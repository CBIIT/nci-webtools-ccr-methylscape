import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  submissionSelector,
  detailsSelector,
  submissionDetailsColumns,
  submissionDetailsTableState,
} from "./submissions.state";
import Table from "../components/table";

export default function SubmissionsDetails() {
  const navigate = useNavigate();
  const { id: submissionsId } = useParams();
  const [initialState, setInitialState] = useRecoilState(submissionDetailsTableState);
  const submission = useRecoilValue(submissionSelector(submissionsId));
  const details = useRecoilValue(detailsSelector(submissionsId));
  const stateReducer = (newState, action) => {
    const actions = ["toggleHideColumn", "toggleSortBy", "setFilter", "gotoPage", "setPageSize"];
    if (actions.includes(action.type)) setInitialState(newState);
    return newState;
  };

  const columns = [
    ...submissionDetailsColumns,
    {
      accessor: "actions",
      Header: "Actions",
      Cell: ({ row }) => {
        return (
          <>
            {submission[0].status === "Completed" && (
              <a
                target="_blank"
                rel="noreferrer noopener"
                href={`/api/submissions/data/${submissionsId}?filePath=output/${row.original.sentrixId}_${row.original.sentrixPosition}/report.html`}>
                Download Report
              </a>
            )}
          </>
        );
      },
    },
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
          <Table
            name="Samples"
            data={details}
            columns={columns}
            options={{ initialState, stateReducer }}
            customOptions={{ hideColumns: true }}
          />
          <Button variant="link" onClick={() => navigate("/submissions")}>
            Back to Submissions List
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
