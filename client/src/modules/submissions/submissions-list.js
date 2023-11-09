import { useEffect, useState } from "react";
import { Card, Row, Col, Button, Container, Alert, Form, Accordion, InputGroup, ButtonGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import moment from "moment";
import { submissionsSelector } from "./submissions.state";
import SubmissionsDetailsSubrow from "./submissions-details-subrow";

export default function SubmissionsList() {
  const { hash } = useLocation();
  const submissions = useRecoilValue(submissionsSelector);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortCol, setSort] = useState("recent");

  // automatically hide alert
  useEffect(() => {
    if (hash === "#success") {
      setTimeout(() => {
        window.location.replace("#");
      }, 10000);
    }
  }, [hash]);

  const accordions = submissions
    .filter((s) => Object.values(s).some((e) => new RegExp(search, "gi").test(e)))
    .sort((a, b) => {
      if (sortCol == "recent") {
        return moment(b.submitDate).diff(a.submitDate);
      } else if (sortCol == "status") {
        const order = ["Initializing", "Complete"];
        return order.indexOf(a.status) - order.indexOf(b.status);
      } else {
        return 0;
      }
    })
    .map((submission, i) => {
      const { submissionName, submitter, organizationName, sampleCount, status, submitDate } = submission;
      const time = moment(submitDate);
      const formatDate = `${time.format("LLL")} (${time.fromNow()})`;
      return (
        <Accordion.Item eventKey={i}>
          <Accordion.Header>
            <Card.Body>
              <Row>
                <Col sm="2">
                  <Form.Label>Submission Name</Form.Label>
                  <span className="ml-4">{submissionName}</span>
                </Col>
                <Col sm="2">
                  <Form.Label>Submitter</Form.Label>
                  <div>{submitter}</div>
                </Col>
                <Col sm="2">
                  <Form.Label>Organization</Form.Label>
                  <div>{organizationName}</div>
                </Col>
                <Col sm="1">
                  <Form.Label>Samples #</Form.Label>
                  <div>{sampleCount}</div>
                </Col>
                <Col sm>
                  <Form.Label>Submission Date</Form.Label>
                  <div>{formatDate}</div>
                </Col>
                <Col sm="2">
                  <Form.Label>Status</Form.Label>
                  <div>{status}</div>
                </Col>
              </Row>
            </Card.Body>
          </Accordion.Header>
          <Accordion.Body className="bg-light p-2">
            <SubmissionsDetailsSubrow submissionData={submission} />
          </Accordion.Body>
        </Accordion.Item>
      );
    });

  return (
    <Container fluid="xxl">
      <Alert variant="success" dismissible show={hash === "#success"}>
        Your samples are successfully uploaded
      </Alert>
      <Row className="justify-content-between mb-3">
        <Col sm="auto">
          <h3 className="text-white">Submissions</h3>
        </Col>
        <Col sm="auto">
          <Button size="sm" variant="success" onClick={() => navigate("/submissions/create")}>
            Create Submission
          </Button>
        </Col>
      </Row>
      <Card className="bg-white p-3">
        {submissions.length == 0 ? (
          <p>You have no submissions. Click on Create Submission to start a data submission.</p>
        ) : (
          <Container fluid>
            <Row className="my-3">
              <Col md="4">
                <InputGroup>
                  <Form.Control placeholder="Search" onChange={(e) => setSearch(e.target.value)} />
                  <InputGroup.Text>
                    <i class="bi bi-search"></i>
                  </InputGroup.Text>
                </InputGroup>
              </Col>
              <Col className="d-flex">
                <Form.Label className="me-3">Sort By</Form.Label>
                <ButtonGroup aria-label="Sort">
                  <Button variant="secondary" onClick={() => setSort("recent")}>
                    Recent
                  </Button>
                  <Button variant="secondary" onClick={() => setSort("status")}>
                    Status
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
            <Accordion alwaysOpen defaultActiveKey="0">
              {accordions}
            </Accordion>
          </Container>
        )}
      </Card>
    </Container>
  );
}
