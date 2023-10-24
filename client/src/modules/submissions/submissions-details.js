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
                href={`/api/submissions/data?filePath=/bethesda_classifier_v2/output/${submissionsId}/${row.original.sample}_${row.original.sentrixId}_${row.original.sentrixPosition}/${row.original.sample}_Report-CNS-Bv2_${row.original.sentrixId}_${row.original.sentrixPosition}.html`}>
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
      <Row className="justify-content-between mb-3">
        <Col sm="auto">
          <h3 className="text-white">Submission Samples</h3>
        </Col>
      </Row>
      <Card className="bg-white">
        {details?.length > 0 && (
          <Card.Body>
            <Row>
              <Col sm="3">
                <Form.Label>Submission Name</Form.Label>
                <span className="ml-4">{details[0].submissionName}</span>
              </Col>
              <Col sm="3">
                <Form.Label>Submitter</Form.Label>
                <div>{details[0].submitter}</div>
              </Col>
              <Col sm="3">
                <Form.Label>Investigator</Form.Label>
                <div>{details[0].investigator}</div>
              </Col>
              <Col sm="3">
                <Form.Label>Date</Form.Label>
                <div>{submission[0].date}</div>
              </Col>
            </Row>
            <Row>
              <Col sm="3">
                <Form.Label>Organization</Form.Label>
                <div>{details[0].organizationName}</div>
              </Col>
              <Col sm="3">
                <Form.Label>Project</Form.Label>
                <div>{details[0].projectName}</div>
              </Col>
              <Col sm="3">
                <Form.Label>Experiment</Form.Label>
                <div>{details[0].experiment}</div>
              </Col>
              <Col sm="3">
                <Form.Label>Submission Date</Form.Label>
                <div>{submission[0].submitDate}</div>
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
