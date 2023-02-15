import { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { projectsTableData, projectState, projectsTableState } from "./projects.state";
import { experimentsTableState } from "../experiments/experiments.state";
import { samplesTableState } from "../samples/samples.state";
import Table from "../../components/table";
import Summary from "./summary";

export default function Projects() {
  const tableData = useRecoilValue(projectsTableData);
  const [state, setState] = useRecoilState(projectState);
  const mergeState = (newState) => setState({ ...state, ...newState });
  const [initialState, setInitialState] = useRecoilState(projectsTableState);
  const setExperimentsTableState = useSetRecoilState(experimentsTableState);
  const setSamplesTableState = useSetRecoilState(samplesTableState);
  const { selectedProject } = state;
  const stateReducer = (newState, action) => {
    // Allow only one row to be selected at a time
    if (action.type === "toggleRowSelected") {
      newState.selectedRowIds = {
        [action.id]: true,
      };

      mergeState({ selectedProject: tableData[action.id].project });
    }

    const initialStateActions = [
      "toggleHideColumn",
      "toggleSortBy",
      "toggleRowSelected",
      "setFilter",
      "gotoPage",
      "setPageSize",
    ];
    if (initialStateActions.includes(action.type)) setInitialState(newState);

    return newState;
  };

  const columns = [
    { id: "project", accessor: "project", Header: "Project" },
    {
      id: "investigator",
      accessor: "priInvestigators",
      //row =>row.priInvestigators+ " and " + <span style={{textDecoration: 'underline blue'}}>others</span>
      Header: "Investigator Name",
      Cell: (row) => {
        if (row.data[row.row.index].multiInvestigator) {
          return (
            <span>
              {row.value} and{" "}
              <span
                style={{ textDecoration: "underline blue", color: "blue" }}
                title={row.data[row.row.index].investigators}>
                {" "}
                {row.data[row.row.index].numberOfOthers} others
              </span>
            </span>
          );
        } else {
          return <span>{row.value}</span>;
        }
      },
    },
    {
      id: "experimentsCount",
      accessor: "experimentcount",
      Header: "# of Experiments",
      Cell: (e) => (
        <Link
          to="../experiments"
          onClick={() =>
            setExperimentsTableState((state) => ({
              ...state,
              filters: [{ id: "project", value: e.data[e.row.index].project }],
            }))
          }>
          {e.value}
        </Link>
      ),
    },
    {
      id: "samplesCount",
      accessor: "samplecount",
      Header: "# of Samples",
      Cell: (e) => (
        <Link
          to="../samples"
          onClick={() =>
            setSamplesTableState((state) => ({
              ...state,
              filters: [{ id: "project", value: e.data[e.row.index].project }],
            }))
          }>
          {e.value}
        </Link>
      ),
    },
  ];

  // set inital selected project
  useEffect(() => {
    if (!selectedProject && tableData.length) {
      mergeState({ selectedProject: tableData[0].project });
    }
  }, [selectedProject, tableData]);

  return (
    <Container fluid>
      <Row>
        <Col>
          {tableData.length > 0 && (
            <Table
              name="Projects"
              data={tableData}
              columns={columns}
              options={{ initialState, stateReducer }}
              customOptions={{ rowSelectRadio: true }}
            />
          )}
        </Col>
      </Row>
      <Row>
        <Col>
          <Summary />
        </Col>
      </Row>
    </Container>
  );
}
