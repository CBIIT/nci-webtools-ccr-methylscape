import { Card, Form, Row, Col, Button } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import { sessionState } from "../session/session.state";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { parseMetadata } from "./submissions.utils";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SubmissionsForm() {
  const navigate = useNavigate();
  const session = useRecoilValue(sessionState);
  const [success, setSuccess] = useState(false);
  const [invalidMetadata, setInvalidMetadata] = useState([]);
  const [metadataFileError, setMetadataFileError] = useState("");
  const [sampleFilesError, setSampleFilesError] = useState("");
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
    const sampleFiles = Array.from(data.sampleFiles)
      .map((e) => {
        const [id, position, channel] = e.name.slice(0, -5).split("_");
        if (id && position && channel) return { id, position, channel };
      })
      .filter(Boolean);
    if (sampleFiles.length == 0) {
      setSampleFilesError("Improperly named files. Unable to identify Sentrix ID and position.");
      return;
    } else if (sampleFiles.length % 2 > 0) {
      setSampleFilesError("Each sample requires two pairs of IDAT files.");
      return;
    } else {
      setSampleFilesError("");
    }

    try {
      const { ownerInfo, metadata } = await parseMetadata(data.metadataFile[0]);
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
          experiment: ownerInfo.experiment,
          experimentDate: ownerInfo.date,
          submitDate: new Date(),
          status: "Submitted",
        };

        Array.from(data.sampleFiles).forEach((e) => formData.append("sampleFiles", e));
        formData.append(
          "data",
          JSON.stringify({
            submission,
            metadata,
          })
        );
        try {
          await axios.post(`/api/submissions/${uuid}`, formData);
          setSuccess(true);
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
    <div>
      <h3 className="text-white mb-3">Submit Samples</h3>
      <Card className="bg-light p-3" style={{ width: "700px" }}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="my-2">
            <Row>
              <Col sm="3">
                <Form.Label className="me-3">Organization</Form.Label>
              </Col>
              <Col sm="9">
                <div>{session?.user.organizationName}</div>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group controlId="submissionName" className="my-2">
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
                />
                <Form.Control.Feedback type="invalid">
                  {errors?.submissionName && errors.submissionName.message}
                </Form.Control.Feedback>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group controlId="sampleFiles" className="my-2">
            <Row>
              <Col sm="3">
                <Form.Label className="me-3">
                  Sample Files <span style={{ color: "crimson" }}>*</span>
                </Form.Label>
              </Col>
              <Col sm="9">
                <Form.Control
                  {...register("sampleFiles", { required: true })}
                  size="sm"
                  type="file"
                  multiple
                  accept=".idat"
                  isInvalid={sampleFilesError.length || errors.sampleFiles}
                />
                <Form.Control.Feedback type="invalid">{sampleFilesError}</Form.Control.Feedback>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group controlId="manualMetadata">
            <Form.Check {...register("manualMetadata")} type="checkbox" label={"Single Sample Metadata"} />
            <p className="text-muted">Use this option if you are uploading a single sample without a metadata file.</p>
          </Form.Group>

          {/* metadata */}
          {manualMetadata ? (
            <>
              <Form.Group controlId="sampleName" className="my-2">
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
                      isInvalid={errors?.sampleName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors?.sampleName && errors.sampleName.message}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="tumorSite" className="my-2">
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
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors?.tumorSite && errors.tumorSite.message}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="diagnosis" className="my-2">
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
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors?.diagnosis && errors.diagnosis.message}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="sex" className="my-2">
                <Row>
                  <Col sm="3">
                    <Form.Label>Sex</Form.Label>
                  </Col>
                  <Col sm="auto">
                    <Form.Select {...register("sex")} size="sm">
                      <option value="NA">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="NA">NA</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="age" className="my-2">
                <Row>
                  <Col sm="3">
                    <Form.Label>Age</Form.Label>
                  </Col>
                  <Col sm="auto">
                    <Form.Control {...register("age")} size="sm" type="number" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="surgeryDate" className="my-2">
                <Row>
                  <Col sm="3">
                    <Form.Label>Surgery Date</Form.Label>
                  </Col>
                  <Col sm="auto">
                    <Form.Control {...register("surgeryDate")} size="sm" type="date" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="notes" className="my-2">
                <Row>
                  <Col sm="3">
                    <Form.Label>Notes</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control {...register("notes")} size="sm" as="textarea" rows="3" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="projectName" className="my-2">
                <Row>
                  <Col sm="3">
                    <Form.Label>Project Name</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control {...register("projectName")} size="sm" />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="experimentName" className="my-2">
                <Row>
                  <Col sm="3">
                    <Form.Label>Experiment Name</Form.Label>
                  </Col>
                  <Col sm="9">
                    <Form.Control
                      {...register("experimentName")}
                      size="sm"
                      placeholder="Enter Experiment Name (Will use Sentrix ID if left blank)"
                    />
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="sampleGroup" className="my-2">
                <Row>
                  <Col sm="3">
                    <Form.Label>Sample Group</Form.Label>
                  </Col>
                  <Col sm="auto">
                    <Form.Select {...register("sampleGroup")} size="sm">
                      <option>Select</option>
                      <option value="450K">450K</option>
                      <option value="EPIC">EPIC</option>
                      <option value="EPICv2">EPICv2</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
              <Form.Group controlId="materialType" className="my-2">
                <Row>
                  <Col sm="3">
                    <Form.Label>Material Type</Form.Label>
                  </Col>
                  <Col sm="auto">
                    <Form.Select {...register("materialType")} size="sm">
                      <option>Select</option>
                      <option value="Frozen-Fresh">Frozen-Fresh</option>
                      <option value="FFPE">FFPE</option>
                      <option value="Periphal blood">Periphal blood</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
            </>
          ) : (
            <Form.Group controlId="metadataFile" className="my-2">
              <Row>
                <Col sm="3">
                  <Form.Label className="me-3">
                    Metadata File <span style={{ color: "crimson" }}>*</span>
                  </Form.Label>
                </Col>
                <Col sm="9">
                  <Form.Control
                    {...register("metadataFile", { required: true })}
                    size="sm"
                    type="file"
                    accept=".csv"
                    isInvalid={metadataFileError.length || errors.metadataFile}
                  />
                  <Form.Control.Feedback type="invalid">{metadataFileError}</Form.Control.Feedback>
                </Col>
              </Row>
            </Form.Group>
          )}

          {success && <p className="text-success">Submitted</p>}
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
              <Button variant="danger" onClick={() => navigate("/submissions")}>
                Cancel
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}
