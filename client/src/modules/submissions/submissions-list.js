import { useEffect, useCallback, useState } from "react";
import { Card, Row, Col, Button, Container, Alert, Form, Accordion, InputGroup, ButtonGroup } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import moment from "moment";
import Table from "../components/table";
import { submissionsSelector } from "./submissions.state";
import SubmissionsDetailsSubrow from "./submissions-details-subrow";

export default function SubmissionsList() {
  const { hash } = useLocation();
  const submissions = useRecoilValue(submissionsSelector);
  const navigate = useNavigate();
  const [altView, setToggle] = useState(false);
  const [search, setSearch] = useState("");
  const columns = [
    {
      Header: () => null,
      id: "expander",
      aria: "Show/Hide Details",
      disableSortBy: true,
      disableToggle: true,
      Cell: ({ row }) => (
        <span {...row.getToggleRowExpandedProps()}>
          {row.isExpanded ? <i className="bi bi-plus-square-dotted" /> : <i className="bi bi-plus-square" />}
        </span>
      ),
    },
    { accessor: "submissionName", Header: "Submission Name" },
    { accessor: "submitter", Header: "Submitter" },
    { accessor: "organizationName", Header: "Organization" },
    {
      accessor: "sampleCount",
      Header: "Sample Count",
      Cell: ({ value }) => value || 0,
    },
    { accessor: "status", Header: "Status" },
    {
      accessor: "submitDate",
      Header: "Submission Date",
      Cell: (e) => {
        const time = moment(e.value);
        return `${time.format("LLL")} (${time.fromNow()})`;
      },
    },
    {
      accessor: "id",
      Header: "Action",
      Cell: ({ value }) => <Link to={`/submissions/details/${value}`}>Review</Link>,
    },
  ];

  // automatically hide alert
  useEffect(() => {
    if (hash === "#success") {
      setTimeout(() => {
        window.location.replace("#");
      }, 10000);
    }
  }, [hash]);

  const renderRowSubComponent = useCallback(({ row }) => {
    return <SubmissionsDetailsSubrow submissionData={row.original} />;
  }, []);

  const accordions = submissions
    .filter((s) => Object.values(s).some((e) => new RegExp(search, "gi").test(e)))
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
          <Accordion.Body>
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
      <div>
        <Form.Check
          className="m-3 text-white"
          type="switch"
          label="Toggle view"
          onChange={(e) => {
            setToggle(e.target.checked);
          }}
        />
      </div>
      <Card className="bg-white p-3">
        {submissions.length == 0 ? (
          <p>You have no submissions. Click on Create Submission to start a data submission.</p>
        ) : altView ? (
          <Table
            key="submissions-table"
            name="Submissions"
            data={submissions}
            columns={columns}
            customOptions={{ expanded: true, hideColumns: true }}
            renderRowSubComponent={renderRowSubComponent}
          />
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
                  <Button variant="secondary">Recent</Button>
                  <Button variant="secondary">Status</Button>
                </ButtonGroup>
              </Col>
            </Row>
            <Accordion defaultActiveKey="0">{accordions}</Accordion>
          </Container>
        )}
      </Card>
    </Container>
  );
}
