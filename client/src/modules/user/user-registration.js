import { useState } from "react";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import { FormControl, Row, Button } from "react-bootstrap";
import axios from "axios";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { formState, organizationsSelector } from "./user.state";

export default function UserRegister() {
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useRecoilState(formState);
  const resetForm = useResetRecoilState(formState);
  const organizations = useRecoilValue(organizationsSelector);
  const activeOrganizations = organizations.filter((org) => org.status === "active");

  async function handleChange(e) {
    const { name, value } = e.target;
    setForm((form) => ({ ...form, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setAlerts([]);
      await axios.post("/api/user/register", form);
      setAlerts([
        {
          type: "success",
          message: "Your registration request has been submitted.",
        },
      ]);
      resetForm();
    } catch (error) {
      console.error(error);
      const data = error.response.data;
      const message = data.error || String(error);
      setAlerts([{ type: "danger", message }]);
    }
  }

  return (
    <Container fluid="xxl">
      <h3 className="text-white my-3">User Registration</h3>
      <Card className="bg-light p-3 d-flex">
        <Form className="mx-auto" onSubmit={handleSubmit} style={{ width: "400px" }}>
          {alerts.map(({ type, message }, i) => (
            <Alert key={i} variant={type} onClose={() => setAlerts([])} dismissible>
              {message}
            </Alert>
          ))}
          <Form.Group controlId="accounttype">
            <Form.Label>Account Type</Form.Label>
            <Form.Check
              inline
              type="radio"
              id="nih"
              label="NIH"
              name="accountType"
              checked={form.accountType === "NIH"}
              value="NIH"
              onChange={handleChange}
            />
            <Form.Check
              inline
              type="radio"
              id="login.gov"
              label="Login.gov"
              name="accountType"
              checked={form.accountType === "Login.gov"}
              value="Login.gov"
              onChange={handleChange}
            />
          </Form.Group>

          <Row>
            {form.accountType === "Login.gov" && (
              <small>
                If you don't have a login.gov account, click{" "}
                <a href="https://secure.login.gov/sign_up/enter_email" target="_blank" rel="noreferrer noopener">
                  <b>here</b>
                </a>{" "}
                to sign up.
              </small>
            )}
            <hr className="my-2" />
          </Row>

          <Form.Group className="mb-3" controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              placeholder="First Name"
              maxLength={255}
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <FormControl
              type="text"
              name="lastName"
              placeholder="Last Name"
              maxLength={255}
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              pattern={form.accountType === "NIH" ? ".+.nih.gov" : null}
              required
            />
            {form.accountType === "NIH" && (
              <Form.Text className="text-muted">Please provide an NIH email address.</Form.Text>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="organization">
            <Form.Label>Organization/Institution</Form.Label>
            <Form.Select name="organizationId" value={form.organizationId} onChange={handleChange} required>
              <option value="" hidden>
                Select your Organization/Instituiton
              </option>
              {activeOrganizations.map((o) => (
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
                onChange={handleChange}
                required
                className="mt-2"
              />
            )}

            {/* <Form.Control
              type="text"
              name="organizationOther"
              placeholder="Enter Organization/Instituiton"
              value={form.organizationOther}
              onChange={handleChange}
              required
              className="mt-2"
              disabled={+form.organizationId === 1 ? '' : 'disabled'}
            /> */}
          </Form.Group>
          <Row className="d-grid gap-2 col-6 mx-auto">
            <Button variant="primary" type="submit" className="btn-lg">
              Submit
            </Button>
          </Row>
        </Form>
      </Card>
    </Container>
  );
}
