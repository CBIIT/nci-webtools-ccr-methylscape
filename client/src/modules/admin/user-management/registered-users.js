import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import Table from "../../components/table";
import axios from "axios";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import { groupBy } from "lodash";
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from "recoil";
import { organizationsSelector, rolesSelector, usersSelector } from "./user-management.state";
import { useForm } from "react-hook-form";
import SelectForm from "../../components/selectHookForm";

export default function RegisterUsers() {
  const [alerts, setAlerts] = useState([]);
  const users = useRecoilValue(usersSelector);
  const roles = useRecoilValue(rolesSelector);
  const organizations = useRecoilValue(organizationsSelector);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [user, setUser] = useState({});
  const [rejectionForm, setRejectionForm] = useState({});
  const refreshUsers = useRecoilRefresher_UNSTABLE(usersSelector);
  const [showRejectedUsers, setShowRejectedUsers] = useState(false);
  const userGroups = groupBy(users, "status");
  const pendingUsers = userGroups["pending"] || [];
  const rejectedUsers = userGroups["rejected"] || [];
  const visibleUsers = [...pendingUsers, ...(showRejectedUsers ? rejectedUsers : [])];

  const defaultForm = { role: "", organization: "", organizationOther: "", comments: "", addNewOrg: false };
  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultForm });
  const { addNewOrg, organization } = watch();

  const roleOptions = roles.map((e) => ({ label: `${e.description} (${e.name})`, value: e.id }));
  const organizationOptions = organizations
    .filter((e) => e.status === "active")
    .map((e) => ({ label: e.name, value: e.id }));

  function openApprovalModal({ row }) {
    setShowApprovalModal(true);
    setUser(row.original);
    const data = row.original;
    reset({
      ...defaultForm,
      organization: { label: data.organizationName, value: data.organizationId },
      organizationOther: data.organizationOther,
    });
  }

  function openRejectionModal({ row }) {
    setShowRejectionModal(true);
    setRejectionForm(row.original);
  }

  function handleRejectionFormChange(e) {
    const { name, value } = e.target;
    setRejectionForm((form) => ({ ...form, [name]: value }));
  }

  async function handleRejectionFormSubmit(e) {
    e.preventDefault();
    setShowRejectionModal(false);
    await axios.post(`/api/user/reject`, rejectionForm);
    refreshUsers();
  }

  async function handleApproveSubmit(form) {
    const orgParams = {
      organizationName: form.addNewOrg ? form.newOrgName : form.organization.label,
      organizationId: form.addNewOrg
        ? (await axios.post("/api/organizations", { name: form.newOrgName })).data[0].id
        : form.organization.value,
    };

    const data = {
      ...user,
      ...orgParams,
      roleName: form.role.label,
      roleId: form.role.value,
    };
    await axios.post(`/api/user/approve`, data);
    setShowApprovalModal(false);
    refreshUsers();
  }

  const cols = [
    {
      Header: "Name",
      accessor: "firstName",
      Cell: (e) => (
        <div
          style={{
            textAlign: "left",
          }}>
          {e.row.original.lastName}, {e.value}
        </div>
      ),
    },
    {
      Header: "Type",
      accessor: "accountType",
      Cell: (e) => (
        <div
          style={{
            textAlign: "left",
          }}>
          {e.value || "NA"}
        </div>
      ),
    },
    {
      Header: "Email",
      accessor: "email",
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
      Header: "Organization",
      accessor: (e) => ({
        id: e.organizationId,
        name: e.organizationName,
        other: e.organizationOther,
      }),
      Cell: ({ value }) => (
        <div
          style={{
            textAlign: "left",
          }}>
          {value.name} {value.id === 1 && value.other && `(${value.other})`}
        </div>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
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
      Header: "Submitted Date",
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
    showRejectedUsers && {
      Header: "Notes",
      accessor: "notes",
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

      Cell: ({ row }) => (
        <div>
          <Button className="me-2" onClick={() => openApprovalModal({ row })}>
            Approve
          </Button>

          {/* {!showRejectedUsers && (
            <Button variant="danger" onClick={() => openRejectionModal({ row })}>
              Reject
            </Button>
          )} */}
          {row.original.status !== "rejected" && (
            <Button variant="danger" onClick={() => openRejectionModal({ row })}>
              Reject
            </Button>
          )}
        </div>
      ),
    },
  ].filter(Boolean);
  return (
    <>
      {alerts.map(({ type, message }, i) => (
        <Alert key={i} variant={type} onClose={() => setAlerts([])} dismissible>
          {message}
        </Alert>
      ))}
      <Form className="text-primary d-flex justify-content-center">
        <Form.Check type="checkbox" id="show-rejected-user">
          <Form.Check.Input
            type="checkbox"
            checked={showRejectedUsers}
            onChange={(ev) => setShowRejectedUsers(ev.target.checked)}
          />
          <Form.Check.Label>Include Rejected Users</Form.Check.Label>
        </Form.Check>
      </Form>
      <Table responsive data={visibleUsers} columns={cols} options={{ disableFilters: true }} />
      {visibleUsers && visibleUsers.length > 0 ? (
        <></>
      ) : (
        <>
          <div className="text-center py-5 text-primary">
            <h3>No pending users</h3>
          </div>
        </>
      )}

      {showApprovalModal && (
        <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
          <Form onSubmit={handleSubmit(handleApproveSubmit)}>
            <Modal.Header closeButton>
              <Modal.Title>
                Set User Role and Organization: {user.firstName}, {user.lastName}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="role">
                <SelectForm
                  control={control}
                  rules={{ required: "Role required" }}
                  name="role"
                  label="User Role"
                  options={roleOptions}
                />
                <Form.Control.Feedback className="d-block" type="invalid">
                  {errors?.role && errors.role.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="organization">
                <SelectForm
                  control={control}
                  rules={{ required: "Organization required" }}
                  name="organization"
                  label="Organization"
                  options={organizationOptions}
                  disabled={addNewOrg}
                />
                <Form.Control.Feedback className="d-block" type="invalid">
                  {errors?.organization && errors?.organization.message}
                </Form.Control.Feedback>
                {organization?.value === 1 && (
                  <Form.Control
                    {...register("organizationOther")}
                    type="text"
                    name="organizationOther"
                    placeholder="Enter Organization/Instituiton"
                    disabled={addNewOrg}
                  />
                )}
              </Form.Group>
              <Form.Group controlId="addNewOrg">
                <Form.Check type="checkbox">
                  <Form.Check {...register("addNewOrg")} type="checkbox" label="Add New Organization" />
                </Form.Check>
              </Form.Group>
              {addNewOrg && (
                <Form.Group controlId="newOrgName">
                  <Form.Label>New Organization</Form.Label>
                  <Form.Control
                    {...register("newOrgName", {
                      required: { value: addNewOrg, message: "Organization Name Required" },
                    })}
                    name="newOrgName"
                    placeholder="Organization Name"
                  />
                  <Form.Control.Feedback className="d-block" type="invalid">
                    {errors?.newOrgName && errors.newOrgName.message}
                  </Form.Control.Feedback>
                </Form.Group>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" type="submit" className="btn-lg">
                Approve
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

      {showRejectionModal && (
        <Modal show={showRejectionModal} onHide={() => setShowRejectionModal(false)}>
          <Form onSubmit={handleRejectionFormSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>
                Reject User: {rejectionForm.firstName}, {rejectionForm.lastName}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={rejectionForm.notes || ""}
                  onChange={handleRejectionFormChange}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" type="submit" className="btn-lg">
                Reject
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </>
  );
}
