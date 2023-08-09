import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Table from "../components/table";

export default function SubmissionsDetails({}) {
  const navigate = useNavigate();
  const columns = [
    { accessor: "1", Header: "Sample Name" },
    { accessor: "2", Header: "Project" },
    { accessor: "2", Header: "Experiment" },
    { accessor: "2", Header: "Sample Date" },
    { accessor: "2", Header: "Sex" },
    { accessor: "2", Header: "Age" },
    { accessor: "2", Header: "Provided Diagnosis" },
  ];

  return (
    <Container fluid="xxl">
      <Card className="bg-white">
        <Card.Body>
          <Row>
            <Col sm="4" className="d-flex justify-content-between">
              <Form.Label>Submission Name</Form.Label>
              <div>name</div>
            </Col>
            <Col sm="4" className="d-flex justify-content-between">
              <Form.Label>Submitter</Form.Label>
              <div>name</div>
            </Col>
            <Col sm="4" className="d-flex justify-content-between">
              <Form.Label>Investigator</Form.Label>
              <div>name</div>
            </Col>
          </Row>
          <Row>
            <Col sm="4" className="d-flex justify-content-between">
              <Form.Label>Organization</Form.Label>
              <div>name</div>
            </Col>
            <Col sm="4" className="d-flex justify-content-between">
              <Form.Label>Project</Form.Label>
              <div>name</div>
            </Col>
            <Col sm="4" className="d-flex justify-content-between">
              <Form.Label>Experiment</Form.Label>
              <div>name</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="bg-white mt-3">
        <Card.Body>
          <div>placeholder</div>
          {/* <Table name="" data={[{ 1: "test" }]} columns={columns} options={{}} /> */}
          <Button variant="link" onClick={() => navigate("/submissions")}>
            Back to Submissions List
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
