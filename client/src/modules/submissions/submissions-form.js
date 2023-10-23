import { Container, Card, Form, Row, Col, Button, ProgressBar } from "react-bootstrap";
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from "recoil";
import { sessionState } from "../session/session.state";
import { submissionsSelector } from "./submissions.state";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { parseForm, parseMetadata, parseSampleFiles, sampleFilePairs } from "./submissions.utils";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SubmissionsForm() {
  const navigate = useNavigate();
  const session = useRecoilValue(sessionState);
  const refreshSubmissions = useRecoilRefresher_UNSTABLE(submissionsSelector);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [invalidMetadata, setInvalidMetadata] = useState([]);
  const [metadataFileError, setMetadataFileError] = useState("");
  console.log(progress);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const { manualMetadata } = watch();

  if (Object.keys(errors).length) console.log("errors", errors);
  async function onSubmit(data) {
    console.log(data);
    // check sample files
    const sampleFiles = parseSampleFiles(data.sampleFiles);

    try {
      const { ownerInfo, metadata } = !manualMetadata
        ? await parseMetadata(data.metadataFile[0])
        : parseForm(data, session, sampleFiles);

      console.log(metadata);
      const checkInvalid = metadata
        .map((e) => {
          const id = e.sentrixId;
          const pos = e.sentrixPosition;
          const name = e.sample;
          const count = [...new Set(sampleFiles.filter((s) => s.id == id && s.position == pos).map((s) => s.channel))]
            .length;

          if (count != 2)
            return count < 2
              ? `${name} (${id}_${pos}): Missing pair of sample files.`
              : `${name} (${id}_${pos}): Too many sample files.`;
        })
        .filter(Boolean);

      if (checkInvalid.length) {
        setInvalidMetadata(checkInvalid);
      } else {
        setInvalidMetadata([]);

        const formData = new FormData();
        const uuid = crypto.randomUUID();
        const submission = {
          uuid,
          userId: session.user.id,
          organizationId: session.user.organizationId,
          submissionName: data.submissionName,
          investigator: ownerInfo.investigator,
          project: ownerInfo.project,
          experiment: ownerInfo.experiment,
          date: ownerInfo.date,
          submitDate: new Date(),
          status: "Initializing",
        };
        formData.append(
          "data",
          JSON.stringify({
            submission,
            metadata,
          })
        );

        try {
          const response = await axios.post(`/api/submissions/${uuid}`, formData);
          const { submissionsId } = response.data;

          // do not upload files in parallel (minimize memory usage & time per upload)
          let filesUploaded = 0;
          let uploadFiles = [...data.metadataFile, ...data.sampleFiles];
          for (const file of uploadFiles) {
            const fileData = new FormData();
            fileData.append("sampleFiles", file);
            fileData.append("submissionsId", submissionsId);
            await axios.post(`/api/submissions/${uuid}`, fileData);
            filesUploaded++;
            setProgress(Math.round((filesUploaded * 100) / uploadFiles.length));
            setProgressLabel(`Uploaded ${filesUploaded} of ${uploadFiles.length} files`);
          }

          // execute classifier
          await axios.get(`/api/submissions/run-classifier/${submissionsId}`);

          // await Array.from(data.sampleFiles).reduce((promise, file, i) => {
          //   const fileData = new FormData();
          //   const config = {
          //     onUploadProgress: function (progressEvent) {
          //       const { loaded, total } = progressEvent;
          //       const status = Math.round((loaded * 100) / total);
          //       setProgress(status);
          //     },
          //   };
          //   fileData.append("sampleFiles", file);
          //   fileData.append("submissionsId", submissionsId);
          //   return promise.then(() => axios.post(`/api/submissions/${uuid}`, fileData, config));
          // }, Promise.resolve());

          refreshSubmissions();
          navigate("/submissions/list#success");
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
      setMetadataFileError(error);
    }
  }

  return (
    <Container fluid="xxl">
      <h3 className="text-white mb-3">Submit Samples</h3>
      <Card className="bg-light p-3 d-flex ">
        <Form onSubmit={handleSubmit(onSubmit)} className="mx-auto" style={{ width: "700px" }}>
          <Form.Group className="my-3">
            <Row>
              <Col sm="3">
                <Form.Label className="me-3">Organization</Form.Label>
              </Col>
              <Col sm="9">
                <div>{session?.user.organizationName}</div>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group controlId="submissionName" className="my-3">
            <Row>
              <Col sm="3">
                <Form.Label>
                  Submission Name <span style={{ color: "crimson" }}>*</span>
                </Form.Label>
              </Col>
              <Col sm="9">
                <Form.Control
                  {...register("submissionName", { required: { value: true, message: "Submission Name required" } })}
                  size="sm"
                  isInvalid={errors?.submissionName}
                  maxLength={80}
                />
                <Form.Control.Feedback type="invalid">
                  {errors?.submissionName && errors.submissionName.message}
                </Form.Control.Feedback>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group controlId="sampleFiles" className="my-3">
            <Row>
              <Col sm="3">
                <Form.Label className="me-3">
                  Sample Files <span style={{ color: "crimson" }}>*</span>
                </Form.Label>
              </Col>
              <Col sm="9">
                <Form.Control
                  {...register("sampleFiles", {
                    required: true,
                    validate: {
                      pairs: (v) => {
                        const sampleFiles = parseSampleFiles(v);
                        const sampleCount = sampleFilePairs(sampleFiles).length;
                        return (
                          (sampleFiles.length % 2 == 0 && sampleCount > 0) ||
                          "Unable to identify IDAT file pair(s). Each sample requires two pairs of IDAT files with filenames using matching Sentrix ID and position and distinct channel e.g. [id]_[position]_[channel].idat"
                        );
                      },
                      limit: (v) => {
                        const count = Array.from(v).length;
                        if (manualMetadata) {
                          return count == 2 || "Only one sample is allowed when manually inputting metadata.";
                        } else {
                          return (
                            (count > 1 && count <= 200) ||
                            "Exceeded 100 sample limit. You can only upload 100 samples per submission."
                          );
                        }
                      },
                    },
                  })}
                  size="sm"
                  type="file"
                  multiple
                  accept=".idat"
                  isInvalid={errors?.sampleFiles}
                />
                <Form.Control.Feedback type="invalid">
                  {errors?.sampleFiles && errors.sampleFiles.message}
                </Form.Control.Feedback>
              </Col>
            </Row>
            <Form.Group controlId="metadataFile" className="my-3">
              <Row>
                <Col sm="3">
                  <Form.Label className="me-3">
                    Metadata File {!manualMetadata && <span style={{ color: "crimson" }}>*</span>}
                  </Form.Label>
                </Col>
                <Col sm="9">
                  <Form.Control
                    {...register("metadataFile", { required: !manualMetadata })}
                    size="sm"
                    type="file"
                    accept=".csv"
                    isInvalid={metadataFileError.length || errors.metadataFile}
                    disabled={manualMetadata}
                  />
                  <Form.Control.Feedback type="invalid">{metadataFileError}</Form.Control.Feedback>
                </Col>
              </Row>
            </Form.Group>
          </Form.Group>
          <Form.Group controlId="manualMetadata">
            <Form.Check
              {...register("manualMetadata")}
              type="checkbox"
              label={"Enter Sample Metadata here"}
              // onChange={(e) => {
              //   e.target.checked ? setValue
              // }}
            />
            <p className="text-muted">Use this option if you are uploading a single sample without a metadata file.</p>
          </Form.Group>
          {/* metadata */}
          {manualMetadata && (
            <>
              <Form.Group controlId="sample" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>
                      Sample Name <span style={{ color: "crimson" }}>*</span>
                    </Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control
                      {...register("sample", { required: { value: true, message: "Sample Name required" } })}
                      size="sm"
                      isInvalid={errors?.sample}
                      maxLength={80}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors?.sample && errors.sample.message}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="tumorSite" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>
                      Tumor Site <span style={{ color: "crimson" }}>*</span>
                    </Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control
                      {...register("tumorSite", { required: { value: true, message: "Tumor Site required" } })}
                      size="sm"
                      isInvalid={errors?.tumorSite}
                      maxLength={80}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors?.tumorSite && errors.tumorSite.message}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="diagnosis" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>
                      Diagnosis <span style={{ color: "crimson" }}>*</span>
                    </Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control
                      {...register("diagnosis", { required: { value: true, message: "diagnosis required" } })}
                      size="sm"
                      isInvalid={errors?.diagnosis}
                      maxLength={80}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors?.diagnosis && errors.diagnosis.message}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="project" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Project Name</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control {...register("project")} size="sm" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="experiment" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Experiment Name</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control
                      {...register("experiment")}
                      size="sm"
                      placeholder="Enter Experiment Name (Will use Sentrix ID if left blank)"
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="sex" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Gender</Form.Label>
                  </Col>
                  <Col>
                    <Form.Select {...register("sex")} size="sm">
                      <option value="NA">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="NA">NA</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="age" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>
                      Age <span style={{ color: "crimson" }}>*</span>
                    </Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      {...register("age", { required: { value: true, message: "Age required" } })}
                      size="sm"
                      type="number"
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="surgicalCase" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Surgical Case</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control {...register("surgicalCase")} size="sm" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="surgeryDate" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Surgery Date</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control {...register("surgeryDate")} size="sm" type="date" defaultValue={null} />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="poolId" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Pool ID</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control {...register("poolId")} size="sm" type="date" defaultValue={null} />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="sampleGroup" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Sample Group</Form.Label>
                  </Col>
                  <Col>
                    <Form.Select {...register("sampleGroup")} size="sm">
                      <option>Select</option>
                      <option value="450K">450K</option>
                      <option value="EPIC">EPIC</option>
                      <option value="EPICv2">EPICv2</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="materialType" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Material Type</Form.Label>
                  </Col>
                  <Col>
                    <Form.Select {...register("materialType")} size="sm">
                      <option>Select</option>
                      <option value="Frozen-Fresh">Frozen-Fresh</option>
                      <option value="FFPE">FFPE</option>
                      <option value="Periphal blood">Periphal blood</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="samplePlate" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Sample Plate</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control {...register("samplePlate")} size="sm" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="sampleWell" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Sample Well</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control {...register("sampleWell")} size="sm" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="piCollaborator" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>PI Collaborator</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control {...register("piCollaborator")} size="sm" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="outsideId" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Outside ID</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control {...register("outsideId")} size="sm" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="notes" className="my-3">
                <Row>
                  <Col sm="3">
                    <Form.Label>Notes</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control {...register("notes")} size="sm" as="textarea" rows="3" />
                  </Col>
                </Row>
              </Form.Group>
            </>
          )}

          {invalidMetadata.length > 0 && (
            <div>
              <b>Metadata validation failed</b>
              <div>Unable to find matching IDAT files for the samples in the metadata file.</div>
              <div>Please check the format of your metadata file.</div>
              <div>
                Ensure all included samples are uploaded with a pair of IDAT files with standardized file names in the
                following format: <i>[sentrix_id]_[sentrix_position]_[channel].idat</i>
              </div>

              <ul>
                {invalidMetadata.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center">
            {progressLabel}
            {progress > 0 && <ProgressBar className="w-100" now={progress} label={`${progress}%`} />}
          </div>
          <Row className="justify-content-center mt-3">
            <Col sm="auto">
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Col>
            <Col sm="auto">
              <Button
                variant="secondary"
                onClick={() => {
                  reset();
                  setMetadataFileError("");
                  setInvalidMetadata("");
                }}>
                Reset
              </Button>
            </Col>
            <Col sm="auto">
              <Button
                variant="danger"
                onClick={() => {
                  refreshSubmissions();
                  navigate("/submissions");
                }}>
                Cancel
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
}
