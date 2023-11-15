import { useState } from "react";
import { Container, Button, Row, Col, ButtonGroup, Card, Form } from "react-bootstrap";
import { useRecoilValue, useRecoilState } from "recoil";
import { reportSelector, submissionReportTableState, submissionsReportColumns } from "./report.state";
import Table from "../../components/table";

export default function SubmissionsReport() {
  const [type, setType] = useState("user");
  const [initialState, setInitialState] = useRecoilState(submissionReportTableState);
  const reports = useRecoilValue(reportSelector(type));
  const stateReducer = (newState, action) => {
    const actions = ["toggleHideColumn", "toggleSortBy", "setFilter", "gotoPage", "setPageSize"];
    if (actions.includes(action.type)) setInitialState(newState);
    return newState;
  };
  const columns = [
    ...(type === "user"
      ? [{ accessor: "submitter", Header: "User", show: true }]
      : [{ accessor: "organizationName", Header: "Organization", show: true }]),

    ...submissionsReportColumns,
  ];

  return (
    <>
      <Container>
        <Row className="my-4">
          <Col>
            <h3 className="text-white">Submissions Report</h3>
          </Col>
        </Row>
        <Card className="bg-white p-3">
          <Row className="my-3">
            <Col>
              <Form.Label>Sort By</Form.Label>
              <ButtonGroup aria-label="report-type">
                <Button variant="primary" onClick={() => setType("user")}>
                  User
                </Button>
                <Button variant="primary" onClick={() => setType("organization")}>
                  Organization
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <div className="p-3 border rounded">
            <Table
              name="Reports"
              data={reports}
              columns={columns}
              options={{ initialState, stateReducer }}
              customOptions={{ hideColumns: true, hidePagination: false }}
            />
          </div>
        </Card>
      </Container>
    </>
  );
}
