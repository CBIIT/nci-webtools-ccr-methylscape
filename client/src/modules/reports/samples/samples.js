import { useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import {
  columns,
  samplesTableData,
  samplesTableState,
  samplesTableFilters,
  defaultSamplesTableState,
} from "./samples.state";
import { projectsTableState } from "../projects/projects.state";
import { experimentsTableState } from "../experiments/experiments.state";
import Table from "../../components/table";

export default function Samples() {
  const tableData = useRecoilValue(samplesTableData);
  const [initialState, setInitialState] = useRecoilState(samplesTableState);
  const setProjectsTableState = useSetRecoilState(projectsTableState);
  const setExperimentsTableState = useSetRecoilState(experimentsTableState);
  const stateReducer = (newState, action) => {
    const actions = ["toggleHideColumn", "toggleSortBy", "setFilter", "gotoPage", "setPageSize"];
    if (actions.includes(action.type)) setInitialState(newState);
    return newState;
  };
  const tableColumns = [
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
    {
      accessor: "sample",
      Header: "Sample Name",
      aria: "Sample Name",
    },
    {
      id: "project",
      accessor: "unifiedSamplePlate",
      Header: "Project",
      aria: "Project",
      Cell: (e) => (
        <Link
          to="../projects"
          onClick={() =>
            setProjectsTableState((state) => ({
              ...state,
              filters: [{ id: "project", value: e.data[e.row.index].unifiedSamplePlate }],
            }))
          }>
          {e.value}
        </Link>
      ),
    },
    {
      id: "experiment",
      accessor: "sentrixId",
      Header: "Experiment",
      aria: "Experiment",
      Cell: (e) => (
        <Link
          to="../experiments"
          onClick={() =>
            setExperimentsTableState((state) => ({
              ...state,
              filters: [{ id: "experiment", value: e.data[e.row.index].sentrixId }],
            }))
          }>
          {e.value}
        </Link>
      ),
    },
    {
      accessor: "surgeryDate",
      Header: "Sample Date",
      Cell: (e) => (e.value ? new Date(e.value).toLocaleDateString("en-US") : "N/A"),
      aria: "Sample Date",
    },
    {
      accessor: "sex",
      Header: "Sex",
      Cell: (e) => (e.value ? e.value : "N/A"),
      aria: "Gender",
    },
    {
      accessor: "age",
      Header: "Age",
      Cell: (e) => (e.value ? e.value : "N/A"),
      aria: "Age",
    },
    {
      accessor: "diagnosisProvided",
      Header: "Provided Diagnosis",
      Cell: (e) => (e.value ? e.value : "N/A"),
      aria: "Diagnosis",
      show: false,
    },
    ...columns,
  ];

  const renderRowSubComponent = useCallback(({ row }) => {
    const { original } = row;
    return (
      <Container fluid="xxl">
        <Row className="ps-3">
          <Col md className="table table-bordered detail-table detail-table-divider mx-1 my-1">
            <Row>
              <Col className="text-primary">DIAGNOSIS:</Col>
              <Col>{original.diagnosisProvided ?? "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary">METHYLATION FAMILY (MF):</Col>
              <Col>{original.CNSv12b6_family ?? "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary">MF CALIBRATED SCORES:</Col>
              <Col>{original.CNSv12b6_family_score ?? "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary">METHYLATION CLASS (MC):</Col>
              <Col>{original.CNSv12b6_subclass1 ?? "N/A"}</Col>
            </Row>
          </Col>
          <Col md className="table table-bordered detail-table detail-table-divider mx-1 my-1">
            <Row>
              <Col className="text-primary">TUMOR SITES:</Col>
              <Col>{[original.locationRegion, original.locationSite].filter(Boolean).join(", ") || "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary">MC CALIBRATED SCORES:</Col>
              <Col>{original.CNSv12b6_subclass1_score ?? "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary">MGMT SCORES:</Col>
              <Col>
                {original.mgmtEstimated} ({original.mgmtStatus})
              </Col>
            </Row>
            <Row>
              <Col className="text-primary">NOTES:</Col>
              <Col>{original.notes}</Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }, []);

  return (
    <Container fluid className="py-1">
      <Row>
        <Col>
          {tableData && tableData.length > 0 && (
            <Table
              name="Samples"
              data={tableData}
              columns={tableColumns}
              options={{ initialState, stateReducer }}
              customOptions={{ expanded: true }}
              renderRowSubComponent={renderRowSubComponent}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}
