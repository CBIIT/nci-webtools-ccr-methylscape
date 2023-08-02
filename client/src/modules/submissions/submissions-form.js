import { Form, Row, Col, Button } from "react-bootstrap";

export default function SubmissionsForm() {
  return (
    <Form className="bg-light p-3" onSubmit={() => {}}>
      <Form.Group className="my-2">
        <Row>
          <Col sm="3">
            <Form.Label className="me-3">Organization</Form.Label>
          </Col>
          <Col sm="9">
            <div>My Org</div>
          </Col>
        </Row>
      </Form.Group>
      <Form.Group className="my-2">
        <Row>
          <Col sm="3">
            <Form.Label className="me-3">Submission Name</Form.Label>
          </Col>
          <Col sm="9">
            <Form.Control size="sm" />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group className="my-2">
        <Row>
          <Col sm="3">
            <Form.Label className="me-3">Sample File</Form.Label>
          </Col>
          <Col sm="9">
            <Form.Control size="sm" type="file" />
          </Col>
        </Row>
      </Form.Group>
      <Form.Group className="my-2">
        <Row>
          <Col sm="3">
            <Form.Label className="me-3">Metafile</Form.Label>
          </Col>
          <Col sm="9">
            <Form.Control size="sm" type="file" />
          </Col>
        </Row>
      </Form.Group>
      <Row className="justify-content-center">
        <Col sm="auto">
          <Button>Submit</Button>
        </Col>
        <Col sm="auto">
          <Button>Cancel</Button>
        </Col>
      </Row>
    </Form>
  );
}
