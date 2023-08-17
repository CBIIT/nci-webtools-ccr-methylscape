import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { detailsSelector } from "./submissions.state";
import Table from "../components/table";

export default function SubmissionsDetails() {
  const navigate = useNavigate();
  const { id: submissionsId } = useParams();
  const details = useRecoilValue(detailsSelector(submissionsId));

  const columns = [
    { accessor: "sample", Header: "Sample Name" },
    { accessor: "surgeryDate", Header: "Surgery Date" },
    { accessor: "sex", Header: "Sex" },
    { accessor: "age", Header: "Age" },
    { accessor: "diagnosis", Header: "Provided Diagnosis" },
  ];

  return (
    <Container fluid="xxl">
      <Card className="bg-white">
        {details && (
          <Card.Body>
            <Row>
              <Col sm="4" className="d-flex justify-content-between">
                <Form.Label>Submission Name</Form.Label>
                <div>{details[0].submissionName}</div>
              </Col>
              <Col sm="4" className="d-flex justify-content-between">
                <Form.Label>Submitter</Form.Label>
                <div>{details[0].submitter}</div>
              </Col>
              <Col sm="4" className="d-flex justify-content-between">
                <Form.Label>Investigator</Form.Label>
                <div>{details[0].investigator}</div>
              </Col>
            </Row>
            <Row>
              <Col sm="4" className="d-flex justify-content-between">
                <Form.Label>Organization</Form.Label>
                <div>{details[0].organizationName}</div>
              </Col>
              <Col sm="4" className="d-flex justify-content-between">
                <Form.Label>Project</Form.Label>
                <div>{details[0].projectName}</div>
              </Col>
              <Col sm="4" className="d-flex justify-content-between">
                <Form.Label>Experiment</Form.Label>
                <div>{details[0].experiment}</div>
              </Col>
            </Row>
          </Card.Body>
        )}
      </Card>

      <Card className="bg-white mt-3">
        <Card.Body>
          <Table name="Samples" data={details} columns={columns} options={{}} />
          <Button variant="link" onClick={() => navigate("/submissions")}>
            Back to Submissions List
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
