import { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { projectsTableData, projectState, projectsTableFilters } from "./projects.state";
import { experimentsTableFilters } from "../experiments/experiments.state";
import { samplesTableFilters } from "../samples/samples.state";
import Table from "../../components/table";
import Summary from "./summary";

export default function Projects() {
  const tableData = useRecoilValue(projectsTableData);
  const tableFilters = useRecoilValue(projectsTableFilters);
  const [state, setState] = useRecoilState(projectState);
  const mergeState = (newState) => setState({ ...state, ...newState });
  const setExperimentsTableFilters = useSetRecoilState(experimentsTableFilters);
  const setSamplesTableFilters = useSetRecoilState(samplesTableFilters);
  const { selectedProject } = state;

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
        <Link to="../experiments" onClick={() => setExperimentsTableFilters({ project: e.data[e.row.index].project })}>
          {e.value}
        </Link>
      ),
    },
    {
      id: "samplesCount",
      accessor: "samplecount",
      Header: "# of Samples",
      Cell: (e) => (
        <Link to="../samples" onClick={() => setSamplesTableFilters({ project: e.data[e.row.index].project })}>
          {e.value}
        </Link>
      ),
    },
  ];
  const options = {
    initialState: {
      sortBy: [{ id: "project" }],
      selectedRowIds: { 0: true },
      filters: [{ id: "project", value: tableFilters?.project || "" }],
    },
    stateReducer: (newState, action) => {
      // Allow only one row to be selected at a time
      if (action.type === "toggleRowSelected") {
        newState.selectedRowIds = {
          [action.id]: true,
        };

        mergeState({ selectedProject: tableData[action.id].project });
      }
      return newState;
    },
  };

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
              options={options}
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
