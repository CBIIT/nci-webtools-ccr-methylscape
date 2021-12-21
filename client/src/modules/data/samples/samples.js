import { useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { samplesTableData } from "./samples.state";
import { PlusSquare, DashSquare } from "react-bootstrap-icons";
import Table from "../../components/table";

export default function Samples() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tableData = useRecoilValue(samplesTableData);

  const columns = [
    {
      Header: () => null,
      id: "expander",
      Cell: ({ row }) => (
        <span {...row.getToggleRowExpandedProps()}>
          {row.isExpanded ? <DashSquare /> : <PlusSquare />}
        </span>
      ),
    },
    {
      id: "sample_name",
      accessor: "sample_name",
      Header: "Sample Name",
    },
    {
      id: "project",
      accessor: "project",
      Header: "Project",
      Cell: (e) => (
        <Link to={"/data/projects?project=" + e.data[e.row.index].project}>
          {e.value}
        </Link>
      ),
    },
    {
      id: "experiment",
      accessor: "experiment",
      Header: "Experiment",
      Cell: (e) => (
        <Link
          to={"/data/experiments?experiment=" + e.data[e.row.index].experiment}>
          {e.value}
        </Link>
      ),
    },
    {
      id: "pool_id",
      accessor: "pool_id",
      Header: "Sample Date",
    },
    {
      id: "surgical_case",
      accessor: "surgical_case",
      Header: "Surgical Case",
    },
    {
      id: "gender",
      accessor: "gender",
      Header: "Gender",
    },
    {
      id: "age",
      accessor: "age",
      Header: "Age",
    },
    {
      id: "diagnosis",
      accessor: "diagnosis",
      Header: "Diagnosis",
    },
  ];

  const options = {
    initialState: {
      filters: [
        { id: "project", value: searchParams.get("project") || "" },
        { id: "experiment", value: searchParams.get("experiment") || "" },
      ],
    },
  };

  const renderRowSubComponent = useCallback(({ row }) => {
    const { original } = row;
    return (
      <Container fluid="xxl">
        <Row>
          <Col sm="3">
            <b>Diagnosis:</b>
          </Col>
          <Col sm="3">{original.diagnosis}</Col>
          <Col sm="3">
            <b>Tumor Site:</b>
          </Col>
          <Col sm="3">{original.tumor_data}</Col>
        </Row>
        <Row>
          <Col sm="3">
            <b>Methylation Family (MF):</b>
          </Col>
          <Col sm="3">{original.family}</Col>
          <Col sm="3">
            <b>t-SNE Plot:</b>
          </Col>
          <Col sm="3">
            <Button
              variant="link"
              className="p-0"
              onClick={() =>
                download(original.id, original.sample_name + ".html")
              }>
              View Plot
            </Button>
          </Col>
        </Row>
        <Row>
          <Col sm="3">
            <b>MF Calibrated Scores:</b>
          </Col>
          <Col sm="3">{original.family_score}</Col>
          <Col sm="3">
            <b>Methylation Report:</b>
          </Col>
          <Col sm="3">
            <Button
              variant="link"
              className="p-0"
              onClick={() => download(original.id, original.report_file_name)}>
              Download Report
            </Button>
          </Col>
        </Row>
        <Row>
          <Col sm="3">
            <b>Methylation Class (MC):</b>
          </Col>
          <Col sm="3">{original.class}</Col>
          <Col sm="3">
            <b>QCI Report:</b>
          </Col>
          <Col sm="3">
            {original.xml_report ? (
              <Link
                className="btn btn-link p-0"
                target="_blank"
                to={`/qci?id=${original.id}&file=${original.xml_report}`}>
                View Report
              </Link>
            ) : (
              <Button variant="link" className="p-0" disabled={true}>
                View Report
              </Button>
            )}
          </Col>
        </Row>
        <Row>
          <Col sm="3">
            <b>MC Calibrated Scores:</b>
          </Col>
          <Col sm="3">{original.class_score}</Col>
          <Col sm="3">
            <b>NGS Report (legacy)</b>
          </Col>
          <Col sm="3">
            <Button
              variant="link"
              className="p-0"
              onClick={() =>
                download(original.id, original.sample_name + "_NGS.pdf")
              }>
              Download Report
            </Button>
          </Col>
        </Row>
        <Row>
          <Col sm="3">
            <b>MGMT Score:</b>
          </Col>
          <Col sm="3">
            {original.mgmt_prediction == null
              ? ""
              : parseFloat(original.mgmt_prediction.Estimated).toFixed(3)}
          </Col>
          <Col sm="3">
            <b>Slide Image:</b>
          </Col>
          <Col sm="3">
            <Button
              variant="link"
              className="p-0"
              onClick={() =>
                download(original.id, original.sample_name + ".jpg")
              }>
              Download Image
            </Button>
          </Col>
        </Row>
        <Row>
          <Col sm="3">
            <b>Notes:</b>
          </Col>
          <Col sm="3">{original.notes}</Col>
          <Col></Col>
        </Row>
      </Container>
    );
  }, []);

  async function download(id, file) {
    try {
      const response = await fetch(`api/getFile`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sample: id + "/" + file,
        }),
      });

      if (!response.ok) {
        window.alert("File is unavailable");
      } else {
        const url = URL.createObjectURL(await response.blob());
        window.open(url, "_blank");
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          {tableData && tableData.length > 0 && (
            <Table
              data={tableData}
              columns={columns}
              options={options}
              useHooks={{ expanded: true }}
              renderRowSubComponent={renderRowSubComponent}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}