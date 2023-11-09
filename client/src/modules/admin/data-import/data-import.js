import axios from "axios";
import { useState } from "react";
import { Container, Row, Col, Form, Button, Modal, OverlayTrigger, Tooltip, InputGroup } from "react-bootstrap";
import { useRecoilValue, useRecoilRefresher_UNSTABLE as useRecoilRefresher } from "recoil";
import { importLogSelector } from "./data-import.state";
import Table from "../../components/table";

export default function DataImport() {
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState({
    show: false,
    title: "",
    body: "",
  });

  const data = useRecoilValue(importLogSelector);
  const refreshData = useRecoilRefresher(importLogSelector);
  const filteredData = data.filter((item) => !statusFilter || item.status === statusFilter);

  const columns = [
    { Header: "Date", accessor: "createdAt", Cell: ({ value }) => new Date(value).toLocaleString() },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value, row }) =>
        !row.original.warnings || row.original.warnings === 0 ? (
          value
        ) : (
          <OverlayTrigger
            overlay={
              <Tooltip id="warning-tooltip">
                Some records may not have been imported due to data issues. View logs for details.
              </Tooltip>
            }>
            <span>
              {value} <span className="text-danger">*</span>
            </span>
          </OverlayTrigger>
        ),
    },
    {
      Header: "Actions",
      id: "actions",
      Cell: ({ row }) => (
        <Button size="sm" className="me-2" onClick={(ev) => viewImportLog(row.original)}>
          View Logs
        </Button>
      ),
    },
  ];

  async function closeModal() {
    setModal({ ...modal, show: false });
  }

  async function runImport(forceRecreate = false) {
    try {
      await axios.post("/api/admin/importData", { forceRecreate });
      refreshData();
      setModal({
        show: true,
        title: `Import Requested`,
        body: `Your request to import data has been submitted. Once complete, import status will be displayed on this page.`,
      });
    } catch (e) {
      console.error(e);
      setModal({
        show: true,
        title: `Import Failed`,
        body: `Your request to import data could not be submitted. Please contact support if this issue persists.`,
      });
    }
  }

  async function viewImportLog(importLog) {
    const params = { id: importLog.id };
    const { data } = await axios.get("/api/admin/importLogs", { params });
    const log = data[0]?.log;
    setModal({
      show: true,
      title: "Import Log",
      body: <pre style={{ height: "300px" }}>{log || "No log entries available"}</pre>,
    });
  }

  return (
    <>
      <Container>
        <Row className="my-4">
          <Col>
            <h3 className="text-white">Data Import</h3>
          </Col>
          {/* <Col className="d-flex justify-content-end">
            <Button variant="light" onClick={() => runImport(true)}>
              Recreate Import
            </Button>
          </Col> */}
        </Row>

        <Row className="mb-4">
          <Col>
            <div className="bg-light py-4 px-2 rounded">
              <Row className="row row-cols-lg-auto">
                <Col>
                  <InputGroup className="mb-2">
                    <InputGroup.Text className="bg-transparent border-0">Status</InputGroup.Text>
                    <Form.Select onChange={(ev) => setStatusFilter(ev.target.value)} value={statusFilter}>
                      <option value="">ALL</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="FAILED">FAILED</option>
                    </Form.Select>
                    <Button
                      variant="outline-primary"
                      className="bg-transparent border-0 text-primary"
                      onClick={(ev) => setStatusFilter("")}>
                      &#10005; Clear
                    </Button>
                  </InputGroup>
                </Col>
              </Row>

              <Row>
                <Col>
                  <div className="bg-light">
                    <Table data={filteredData} columns={columns} options={{ disableFilters: true }} />
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={modal.show} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modal.body}</Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
