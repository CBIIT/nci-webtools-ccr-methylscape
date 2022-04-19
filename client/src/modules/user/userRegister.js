import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { FormControl, FormGroup, FormInput } from 'react-bootstrap';
import axios from 'axios';

export default function UserRegister() {
  const [state, setState] = useState({
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
  });

  const handleChange = (e) => {
    const value = e.target.value;
    setState({
      ...state,
      [e.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // const userData = {
    //   firstname: state.firstname,
    //   lastname: state.lastname,
    //   email: state.email,
    //   organization: state.organization,
    // };
    axios.post('', state).then((response) => {
      console.log(response.status);
      console.log(response.data);
    });
  };

  return (
    <>
      <Container fluid="xxl" className="d-flex justify-content-center">
        <Row className="text-white my-3">
          <h1>Register</h1>
        </Row>
      </Container>
      <Container
        fluid="xxl"
        className="d-inline-flex justify-content-center mb-2 p-2"
      >
        <Form className="bg-light p-3">
          <Row>
            <Form.Group className="mb-3" controlId="lastname">
              <Form.Label>Last Name</Form.Label>
              <FormControl
                type="text"
                name="lastname"
                placeholder="Last Name"
                value={state.lastname}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="firstname">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstname"
                placeholder="First Name"
                value={state.firstname}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              value={state.email}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="organization">
            <Form.Label>Organization/ Institution</Form.Label>
            <Form.Control
              type="text"
              name="organization"
              placeholder="Enter Organization/ Instituiton"
              value={state.organization}
              onChange={handleChange}
            />
          </Form.Group>
          <Row className="d-grid gap-2 col-6 mx-auto">
            <Button
              variant="primary"
              type="submit"
              className="btn-lg"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Row>
        </Form>
      </Container>
    </>
  );
}
