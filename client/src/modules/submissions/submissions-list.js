import { useEffect } from "react";
import { Card, Row, Col, Button, Container, Alert } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import moment from "moment";
import Table from "../components/table";
import { submissionsSelector } from "./submissions.state";

export default function SubmissionsList() {
  const { hash } = useLocation();
  const submissions = useRecoilValue(submissionsSelector);
  const navigate = useNavigate();
  const columns = [
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
      accessor: "date",
      Header: "Date",
      Cell: (e) => {
        const time = moment(e.value);
        return `${time.format("LLL")} (${time.fromNow()})`;
      },
    },
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
          <Table
            key="submissions-table"
            name="Submissions"
            data={submissions}
            columns={columns}
            customOptions={{ hideColumns: true }}
          />
        )}
      </Card>
    </Container>
  );
}
