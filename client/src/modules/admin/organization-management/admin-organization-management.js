import { useState } from "react";
import { Container, Button, Row, Col, Modal, Form, FormControl } from "react-bootstrap";
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from "recoil";
import Table from "../../components/table";
import { organizationsSelector } from "./organization-management.state";
import axios from "axios";

export default function AdminOrganizationManagement() {
  const organizations = useRecoilValue(organizationsSelector);
  const [form, setForm] = useState([]);
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [showRenameOrgModal, setShowRenameOrgModal] = useState(false);
  const refreshOrgs = useRecoilRefresher_UNSTABLE(organizationsSelector);

  async function openAddOrgModal() {
    setShowAddOrgModal(true);
  }

  async function openEditOrgModal(cell) {
    setShowRenameOrgModal(true);
    setForm(cell?.row?.original);
  }

  async function addOrganizationChange(e) {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));
    console.log(form);
  }

  async function renameOrganizationChange(e) {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));
    console.log(form);
  }

  async function handleAddOrgSubmit(e) {
    e.preventDefault();

    const response = await axios.post("/api/organizations", {
      name: form.name,
    });
    const id = response.data[0].id;
    console.log(id);
    console.log(form);
    setShowAddOrgModal(false);
    refreshOrgs();
  }

  async function handleRenameSubmit(e) {
    e.preventDefault();
    const response = await axios.put(`/api/organizations/${form.id}`, form);
    console.log(response);
    setShowRenameOrgModal(false);
    refreshOrgs();
  }
  const cols = [
    {
      Header: "Active Organizations",
      accessor: "name",
      Cell: (e) => (
        <div
          style={{
            textAlign: "left",
          }}>
          {e.value}
        </div>
      ),
    },
    {
      Header: "Created Date",
      accessor: "createdAt",
      Cell: (e) => (
        <div
          style={{
            textAlign: "left",
          }}>
          {new Date(e.value).toLocaleDateString()}
        </div>
      ),
    },
    {
      Header: "Created By",
      accessor: "createdBy",
      Cell: (e) => (
        <div
          style={{
            textAlign: "left",
          }}>
          {e.value}
        </div>
      ),
    },
    {
      Header: "Updated Date",
      accessor: "updatedAt",
      Cell: (e) => (
        <div
          style={{
            textAlign: "left",
          }}>
          {new Date(e.value).toLocaleDateString()}
        </div>
      ),
    },
    {
      Header: "Updated By",
      accessor: "updatedBy",
      Cell: (e) => (
        <div
          style={{
            textAlign: "left",
          }}>
          {e.value}
        </div>
      ),
    },
    {
      Header: "Actions",
      id: "actions",
      disableSortBy: true,
      Cell: (props) => {
        return (
          <>
            {props.row.original.id !== 1 ? (
              <Button className="me-2" onClick={() => openEditOrgModal(props)}>
                Edit
              </Button>
            ) : (
              <div></div>
            )}
          </>
        );
      },
    },
  ];
  return (
    <>
      <Container>
        <Row className="my-4">
          <Col>
            <h1 className="text-white">Manage Organizations/Institutions</h1>
          </Col>
          <Col className="d-flex justify-content-end">
            <Button variant="light" onClick={() => openAddOrgModal()}>
              Add Organization
            </Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <div className="bg-light py-4 px-2 rounded">
              <Table responsive data={organizations} columns={cols} options={{ disableFilters: true }} />
            </div>
          </Col>
        </Row>

        <Modal show={showAddOrgModal} onHide={() => setShowAddOrgModal(false)}>
          <Form className="bg-light p-3" onSubmit={handleAddOrgSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>Add New Organization/ Instituiton</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form.Group className="mb-3" controlId="organizationName">
                <Form.Label>Organization Name</Form.Label>
                <FormControl
                  type="text"
                  name="name"
                  placeholder="Add Organization Name"
                  maxLength={255}
                  //value={form.name}
                  onChange={addOrganizationChange}
                  required
                />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="primary" type="submit" className="btn-lg">
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Modal show={showRenameOrgModal} onHide={() => setShowRenameOrgModal(false)}>
          <Form className="bg-light p-3" onSubmit={handleRenameSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Organization</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {/* <Form.Group className="mb-3" controlId="organizationName">
                <Form.Label>Current Organization Name</Form.Label>
                <span>{oldOrgName.name} </span>
              </Form.Group> */}
              <Form.Group className="mb-3" controlId="organizationName">
                <Form.Label>New Organization Name</Form.Label>
                <FormControl
                  type="text"
                  name="name"
                  placeholder="Organization Name"
                  maxLength={255}
                  value={form.name}
                  onChange={renameOrganizationChange}
                  required
                />

                {/* <Form.Select
                  name="organizationId"
                  value={form.organizationId}
                  onChange={renameOrganizationChange}
                  required
                >
                  <option value="" hidden>
                    Select Organization/Instituiton
                  </option>
                  {organizations.map((o) => (
                    <option key={`organization-${o.name}`} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </Form.Select>
                {+form.organizationId === 1 && (
                  <Form.Control
                    type="text"
                    name="organizationOther"
                    placeholder="Enter Organization/Instituiton"
                    value={form.organizationOther}
                    onChange={renameOrganizationChange}
                    required
                    className="mt-2"
                  />
                )} */}
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="primary" type="submit" className="btn-lg">
                Rename
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
}
