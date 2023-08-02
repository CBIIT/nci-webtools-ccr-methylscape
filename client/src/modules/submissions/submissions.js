import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import SubmissionsForm from "./submissions-form";
import SubmissionsList from "./submissions-list";
import { submissionsState } from "./submissions.state";
import { useState } from "react";

export default function Submissions() {
  const [modalVis, setModalVis] = useState(false);
  const { submissions } = useRecoilValue(submissionsState);

  return (
    <>
      <Container fluid="xxl" className="">
        <Row className="justify-content-end my-3">
          <Col sm="auto">
            <Button size="sm" variant="success" onClick={() => setModalVis(true)}>
              Create Submission
            </Button>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <SubmissionsList submissions={submissions} />
          </Col>
        </Row>
      </Container>

      <Modal size="lg" show={modalVis} onHide={() => setModalVis(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SubmissionsForm />
        </Modal.Body>
      </Modal>
    </>
  );
}
