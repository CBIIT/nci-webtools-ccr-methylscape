import { Container, Row, Col, Button } from "react-bootstrap";
import { useRecoilValue } from "recoil";
import axios from "axios";
import { saveAs } from "file-saver";
import { useSearchParams } from "react-router-dom";
import { experimentsTableData } from "./experiments.state";
import Table from "../../components/table";

export default function Experiments() {
  const [searchParams] = useSearchParams();
  const tableData = useRecoilValue(experimentsTableData);

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
        { id: "project", value: searchParams.get("project") || "" },
        { id: "experiment", value: searchParams.get("experiment") || "" },
      ],
      pageSize: 100,
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
            <Table data={tableData} columns={columns} defaultPageSize={100} options={options} />
          )}
        </Col>
      </Row>
    </Container>
  );
}
