import { Container, Row, Col, Button } from "react-bootstrap";
import { useRecoilValue, useSetRecoilState } from "recoil";
import axios from "axios";
import { saveAs } from "file-saver";
import { Link } from "react-router-dom";
import { experimentsTableData, experimentsTableFilters } from "./experiments.state";
import { samplesTableFilters } from "../samples/samples.state";
import Table from "../../components/table";

export default function Experiments() {
  const tableData = useRecoilValue(experimentsTableData);
  const tableFilters = useRecoilValue(experimentsTableFilters);
  const setSamplesTableFilters = useSetRecoilState(samplesTableFilters);

  const columns = [
    {
      id: "project",
      accessor: "project",
      Header: "Project",
    },
    {
      id: "experiment",
      accessor: "experiment",
      Header: "Experiment",
    },
    {
      id: "investigator",
      accessor: "investigator",
      Header: "Investigator Name",
    },
    {
      id: "samplesCount",
      accessor: "samplecount",
      Header: "# of Samples",
      Cell: (e) => (
        <Link
          to="../samples?experiment"
          onClick={() =>
            setSamplesTableFilters({ project: e.data[e.row.index].project, experiment: e.data[e.row.index].experiment })
          }>
          {e.value}
        </Link>
      ),
    },
    {
      id: "date",
      accessor: "experimentdate",
      Header: "Experiment Date",
    },
  ];
  const options = {
    initialState: {
      filters: [
        { id: "project", value: tableFilters.project || "" },
        { id: "experiment", value: tableFilters.experiment || "" },
      ],
      pageSize: 25,
    },
  };

  async function download(experiment, file) {
    try {
      const response = await axios.post(
        `/api/reports/getReportsFile`,
        {
          qc: experiment + "/" + file,
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
    <Container fluid>
      <Row>
        <Col>
          {tableData && tableData.length > 0 && (
            <Table name="Experiments" data={tableData} columns={columns} defaultPageSize={100} options={options} />
          )}
        </Col>
      </Row>
    </Container>
  );
}
