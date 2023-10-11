import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useRecoilValue, useRecoilState } from "recoil";
import moment from "moment";
import {
  submissionSelector,
  detailsSelector,
  submissionDetailsColumns,
  submissionDetailsTableState,
} from "./submissions.state";
import Table from "../components/table";

export default function SubmissionsDetails({ submissionData }) {
  const submissionsId = submissionData.id;
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
    <Container fluid="xxl" className="p-0">
      <Card className="">
        {details?.length > 0 && (
          <Card.Body>
            <Row>
              <Col sm>
                <Form.Label>Investigator</Form.Label>
                <div>{submissionData.investigator}</div>
              </Col>
              <Col sm>
                <Form.Label>Date</Form.Label>
                <div>
                  {submissionData.date
                    ? moment(submissionData.date).format("LL")
                    : moment(submissionData.submitDate).format("LL")}
                </div>
              </Col>
              <Col sm>
                <Form.Label>Project</Form.Label>
                <div>{submissionData.projectName ?? "N/A"}</div>
              </Col>
              <Col sm>
                <Form.Label>Experiment</Form.Label>
                <div>{submissionData.experiment}</div>
              </Col>
            </Row>
          </Card.Body>
        )}
      </Card>

      <Card className="mt-2">
        <Card.Body className="p-1">
          <Table
            name="Samples"
            data={details}
            columns={columns}
            options={{ initialState, stateReducer }}
            customOptions={{ hideColumns: true, hidePagination: true }}
          />
        </Card.Body>
      </Card>
    </Container>
  );
}
