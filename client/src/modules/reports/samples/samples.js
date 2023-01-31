import { useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import axios from "axios";
import { saveAs } from "file-saver";
import { additionalColumns, samplesTableData, samplesTableFilters } from "./samples.state";
import { projectsTableFilters } from "../projects/projects.state";
import { experimentsTableFilters } from "../experiments/experiments.state";
import Table from "../../components/table";

export default function Samples() {
  const tableData = useRecoilValue(samplesTableData);
  const tableFilters = useRecoilValue(samplesTableFilters);
  const setProjectsTableFilters = useSetRecoilState(projectsTableFilters);
  const setExperimentsTableFilters = useSetRecoilState(experimentsTableFilters);

  const columns = [
    {
      Header: () => null,
      id: "expander",
      aria: "Show/Hide Details",
      disableSortBy: true,
      Cell: ({ row }) => (
        <span {...row.getToggleRowExpandedProps()}>
          {row.isExpanded ? <i className="bi bi-plus-square-dotted" /> : <i className="bi bi-plus-square" />}
        </span>
      ),
    },
    {
      id: "sample_name",
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
          onClick={() => setProjectsTableFilters({ project: e.data[e.row.index].unifiedSamplePlate })}>
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
          onClick={() => setExperimentsTableFilters({ experiment: e.data[e.row.index].sentrixId })}>
          {e.value}
        </Link>
      ),
    },
    {
      id: "surgeryDate",
      accessor: "surgeryDate",
      Header: "Sample Date",
      Cell: (e) => (e.value ? new Date(e.value).toLocaleDateString("en-US") : "N/A"),
      aria: "Sample Date",
    },
    {
      id: "gender",
      accessor: "sex",
      Header: "Gender",
      Cell: (e) => (e.value ? e.value : "N/A"),
      aria: "Gender",
    },
    {
      id: "age",
      accessor: "age",
      Header: "Age",
      Cell: (e) => (e.value ? e.value : "N/A"),
      aria: "Age",
    },
    {
      id: "diagnosis",
      accessor: "diagnosisProvided",
      Header: "Diagnosis",
      Cell: (e) => (e.value ? e.value : "N/A"),
      aria: "Diagnosis",
      show: false,
    },
    ...additionalColumns,
  ];

  const options = {
    initialState: {
      hiddenColumns: columns.filter((col) => col.show === false).map((col) => col.accessor),
      filters: [
        { id: "project", value: tableFilters?.project || "" },
        { id: "experiment", value: tableFilters?.experiment || "" },
      ],
      sortBy: [{ id: "surgeryDate", desc: true }],
      pageSize: 25,
    },
  };

  const renderRowSubComponent = useCallback(({ row }) => {
    const { original } = row;
    return (
      <Container fluid="xxl">
        <Row className="ps-3">
          <Col md className="table table-bordered detail-table detail-table-divider mx-1 my-1">
            <Row>
              <Col className="text-primary small">
                <b>DIAGNOSIS:</b>
              </Col>
              <Col>{original.diagnosisProvided ?? "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary small">
                <b>METHYLATION FAMILY (MF):</b>
              </Col>
              <Col>{original.CNSv12b6_family ?? "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary small">
                <b>MF CALIBRATED SCORES:</b>
              </Col>
              <Col>{original.CNSv12b6_family_score ?? "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary small">
                <b>METHYLATION CLASS (MC):</b>
              </Col>
              <Col>{original.CNSv12b6_subclass1 ?? "N/A"}</Col>
            </Row>
          </Col>
          <Col md className="table table-bordered detail-table detail-table-divider mx-1 my-1">
            <Row>
              <Col className="text-primary small">
                <b>TUMOR SITES:</b>
              </Col>
              <Col>{[original.locationRegion, original.locationSite].filter(Boolean).join(", ") || "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary small">
                <b>MC CALIBRATED SCORES:</b>
              </Col>
              <Col>{original.CNSv12b6_subclass1_score ?? "N/A"}</Col>
            </Row>
            <Row>
              <Col className="text-primary small">
                <b>MGMT SCORES:</b>
              </Col>
              <Col>
                {original.mgmtEstimated} ({original.mgmtStatus})
              </Col>
            </Row>
            <Row>
              <Col className="text-primary small">
                <b>NOTES:</b>
              </Col>
              <Col>{original.notes}</Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }, []);

  async function download(id, file) {
    try {
      const response = await axios.post(
        `/api/reports/getReportsFile`,
        {
          sample: id + "/" + file,
        },
        { responseType: "blob" }
      );
      saveAs(response.data, file);
    } catch (err) {
      window.alert("File is unavailable");
      console.log(err);
    }
  }

  return (
    <Container fluid className="py-1">
      <Row>
        <Col>
          {tableData && tableData.length > 0 && (
            <Table
              name="Samples"
              data={tableData}
              columns={columns}
              options={options}
              defaultPageSize={25}
              customOptions={{ expanded: true, hideColumns: true }}
              renderRowSubComponent={renderRowSubComponent}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}
