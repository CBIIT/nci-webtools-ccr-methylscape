import { Form, Row, Col, Button } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import { sessionState } from "../session/session.state";
import { useForm } from "react-hook-form";

export default function SubmissionsForm() {
  const session = useRecoilValue(sessionState);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: {} });

  const { manualMetadata } = watch();

  if (errors) console.log("errors", errors);
  async function onSubmit(data) {
    console.log(data);
  }

  return (
    <Form className="bg-light p-3" onSubmit={handleSubmit(onSubmit)}>
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
      <Form.Group controlId="sampleFile" className="my-2">
        <Row>
          <Col sm="3">
            <Form.Label className="me-3">
              Sample Files <span style={{ color: "crimson" }}>*</span>
            </Form.Label>
          </Col>
          <Col sm="auto">
            <Form.Control {...register("sampleFile", { required: true })} size="sm" type="file" multiple />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group>
        <Form.Check {...register("manualMetadata")} type="checkbox" label={"Manual Metadata"} />
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
                  {...register("sampleName", { required: { value: true, message: "Sample Name required" } })}
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
                  <option>Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Unknown</option>
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
                <Form.Control {...register("experimentName")} size="sm" placeholder="sentrix id here" />
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
            <Col sm="auto">
              <Form.Control {...register("metadataFile", { required: true })} size="sm" type="file" />
            </Col>
          </Row>
        </Form.Group>
      )}

      <Row className="justify-content-center mt-3">
        <Col sm="auto">
          <Button type="submit">Submit</Button>
        </Col>
        <Col sm="auto">
          <Button>Cancel</Button>
        </Col>
      </Row>
    </Form>
  );
}
