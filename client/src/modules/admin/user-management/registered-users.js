import { useState } from "react";
import { Container, Button, Modal } from "react-bootstrap";
import Table from "../../components/table";
import axios from "axios";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import { groupBy } from "lodash";
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from "recoil";
import { rolesSelector, usersSelector } from "./user-management.state";

export default function RegisterUsers() {
  const [alerts, setAlerts] = useState([]);
  const users = useRecoilValue(usersSelector);
  const roles = useRecoilValue(rolesSelector);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalForm, setApprovalForm] = useState({});
  const [rejectionForm, setRejectionForm] = useState({});
  const refreshUsers = useRecoilRefresher_UNSTABLE(usersSelector);
  const [showRejectedUsers, setShowRejectedUsers] = useState(false);
  const userGroups = groupBy(users, "status");
  const pendingUsers = userGroups["pending"] || [];
  const rejectedUsers = userGroups["rejected"] || [];
  const visibleUsers = [...pendingUsers, ...(showRejectedUsers ? rejectedUsers : [])];

  function openApprovalModal({ row }) {
    setShowApprovalModal(true);
    setApprovalForm(row.original);
  }

  function openRejectionModal({ row }) {
    setShowRejectionModal(true);
    setRejectionForm(row.original);
  }

  function handleApprovalFormChange(e) {
    const { name, value } = e.target;
    setApprovalForm((form) => ({ ...form, [name]: value }));
  }

  function handleRejectionFormChange(e) {
    const { name, value } = e.target;
    setRejectionForm((form) => ({ ...form, [name]: value }));
  }

  async function handleApprovalFormSubmit(e) {
    e.preventDefault();
    setShowApprovalModal(false);
    await axios.post(`/api/user/approve`, approvalForm);
    refreshUsers();
  }

  async function handleRejectionFormSubmit(e) {
    e.preventDefault();
    setShowRejectionModal(false);
    await axios.post(`/api/user/reject`, rejectionForm);
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
      {/* <h1 className="h4 mb-3 text-primary">Registered Users</h1> */}
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
          <Form onSubmit={handleApprovalFormSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>
                Set User Role: {approvalForm.firstName}, {approvalForm.lastName}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="approveModalId">
                <Form.Label>User Role</Form.Label>
                <Form.Select
                  name="roleId"
                  value={approvalForm.roleId || ""}
                  onChange={handleApprovalFormChange}
                  required>
                  <option value="" hidden>
                    Select Role
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.description} ({r.name})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
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
