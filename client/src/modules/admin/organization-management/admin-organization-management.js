import { useState } from "react";
import { Container, Button, Row, Col, Modal, Form, FormControl } from "react-bootstrap";
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from "recoil";
import Table from "../../components/table";
import { organizationsSelector } from "./organization-management.state";
import axios from "axios";
import { useForm } from "react-hook-form";
import SelectForm from "../../components/selectHookForm";
import { sessionState } from "../../session/session.state";

export default function AdminOrganizationManagement() {
  const organizations = useRecoilValue(organizationsSelector);
  const session = useRecoilValue(sessionState);
  const currentUser = `${session.user.firstName}, ${session.user.lastName}`;
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [showRenameOrgModal, setShowRenameOrgModal] = useState(false);
  const refreshOrgs = useRecoilRefresher_UNSTABLE(organizationsSelector);
  const initialForm = {
    name: "",
    organSystem: [{ label: "Central Nervous System", value: "centralNervousSystem" }],
  };
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialForm,
  });

  const organSystemOptions = [
    { label: "Central Nervous System", value: "centralNervousSystem" },
    { label: "Bone and Soft Tissue", value: "boneAndSoftTissue" },
    { label: "Hematopoietic", value: "hematopoietic" },
    { label: "Renal", value: "renal" },
    { label: "Pan-Cancer", value: "panCancer" },
  ];

  async function openAddOrgModal() {
    reset(initialForm);
    setShowAddOrgModal(true);
  }

  async function openEditOrgModal(cell) {
    reset(cell?.row?.original);
    setShowRenameOrgModal(true);
  }

  async function handleAddOrgSubmit(form) {
    await axios.post("/api/organizations", {
      ...form,
      organSystem: JSON.stringify(form.organSystem),
      createdBy: currentUser,
      updatedBy: currentUser,
    });
    setShowAddOrgModal(false);
    refreshOrgs();
  }

  async function handleOrgEditSubmit(form) {
    const data = { ...form, organSystem: JSON.stringify(form.organSystem), updatedBy: "" };

    await axios.put(`/api/organizations/${data.id}`, { ...data, updatedBy: currentUser });
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
      Cell: (props) =>
        props.row.original.id !== 1 ? (
          <Button className="me-2" onClick={() => openEditOrgModal(props)}>
            Edit
          </Button>
        ) : (
          <div></div>
        ),
    },
  ];
  return (
    <>
      <Container>
        <Row className="my-4">
          <Col>
            <h3 className="text-white">Manage Organizations/Institutions</h3>
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
              <Table
                responsive
                data={organizations}
                columns={cols}
                options={{ disableFilters: true }}
                customOptions={{ hideColumns: true }}
              />
            </div>
          </Col>
        </Row>

        <Modal show={showAddOrgModal} onHide={() => setShowAddOrgModal(false)}>
          <Form className="bg-light p-3" onSubmit={handleSubmit(handleAddOrgSubmit)}>
            <Modal.Header closeButton>
              <Modal.Title>Add New Organization/ Institution</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Organization Name</Form.Label>
                <FormControl
                  {...register("name", { required: { value: true, message: "Organization name required" } })}
                  type="text"
                  placeholder="Add Organization Name"
                  maxLength={255}
                />
                <Form.Control.Feedback className="d-block" type="invalid">
                  {errors?.name && errors.name.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="organSystem">
                <SelectForm
                  control={control}
                  name="organSystem"
                  label="Select Organ Systems"
                  options={organSystemOptions}
                  isMulti
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
          <Form className="bg-light p-3" onSubmit={handleSubmit(handleOrgEditSubmit)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Organization</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="newOrgName">
                <Form.Label>New Organization Name</Form.Label>
                <FormControl
                  {...register("name", { required: "Organization name required" })}
                  type="text"
                  placeholder="Organization Name"
                  maxLength={255}
                />
                <Form.Control.Feedback className="d-block" type="invalid">
                  {errors?.name && errors.name.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="organSystem">
                <SelectForm
                  control={control}
                  name="organSystem"
                  label="Select Organ Systems"
                  options={organSystemOptions}
                  isMulti
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" type="submit" className="btn-lg">
                Update
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
}
