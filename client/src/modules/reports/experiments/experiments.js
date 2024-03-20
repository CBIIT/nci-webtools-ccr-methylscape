import { Container, Row, Col, Button } from "react-bootstrap";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Link } from "react-router-dom";
import { experimentsTableData, experimentsTableState } from "./experiments.state";
import { samplesTableState } from "../samples/samples.state";
import Table from "../../components/table";

export default function Experiments() {
  const tableData = useRecoilValue(experimentsTableData);
  const setSamplesTableState = useSetRecoilState(samplesTableState);
  const [initialState, setInitialState] = useRecoilState(experimentsTableState);
  const stateReducer = (newState, action) => {
    const actions = ["toggleHideColumn", "toggleSortBy", "setFilter", "gotoPage", "setPageSize"];
    if (actions.includes(action.type)) setInitialState(newState);
    return newState;
  };

  const columns = [
    {
      accessor: "project",
      Header: "Project",
    },
    {
      accessor: "experiment",
      Header: "Experiment",
    },
    {
      id: "investigator",
      accessor: "investigator",
      Header: "Investigator Name",
    },
    {
      accessor: "samplecount",
      Header: "# of Samples",
      Cell: (e) => (
        <Link
          to="../samples"
          onClick={() =>
            setSamplesTableState((state) => ({
              ...state,
              filters: [
                { id: "project", value: e.data[e.row.index].project },
                { id: "experiment", value: e.data[e.row.index].experiment },
              ],
            }))
          }>
          {e.value}
        </Link>
      ),
    },
    {
      accessor: "experimentdate",
      Header: "Most Recent Experiment Date",
      Cell: (e) => (e?.value ? new Date(e.value).toLocaleDateString() : null),
    },
  ];

  return (
    <Container fluid>
      <Row>
        <Col>
          {tableData && tableData.length > 0 && (
            <Table
              name="Experiments"
              data={tableData}
              columns={columns}
              options={{ initialState, stateReducer }}
              customOptions={{ hideColumns: true }}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}
