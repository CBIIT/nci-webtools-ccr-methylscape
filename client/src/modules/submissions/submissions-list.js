import { Card, Row, Col, Button, Container } from "react-bootstrap";
import Table from "../components/table";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import moment from "moment";
import { submissionsSelector } from "./submissions.state";

export default function SubmissionsList() {
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
      accessor: "submitDate",
      Header: "Submitted Date",
      Cell: (e) => {
        const time = moment(e.value);
        return `${time.format("LLL")} (${time.fromNow()})`;
      },
    },
    {
      accessor: "id",
      Header: "Action",
      Cell: ({ value }) => (
        <Button variant="link" onClick={() => navigate(`/submissions/details/${value}`)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <Container fluid="xxl">
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
          <Table key="submissions-table" name="Submissions" data={submissions} columns={columns} />
        )}
      </Card>
    </Container>
  );
}
