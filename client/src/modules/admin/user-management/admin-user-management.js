import CurrentUsers from "./current-users";
import RegisterUsers from "./registered-users";
import { Container, Row, Col, Tab, Tabs } from "react-bootstrap";

export default function AdminUserManagement() {
  return (
    <>
      <Container>
        <Row className="my-4">
          <Col>
            <h3 className="text-white">Manage Users</h3>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <div className="bg-white px-2 rounded">
              <Tabs defaultActiveKey="currentusers" id="admin-user-managemenr" transition={false}>
                <Tab eventKey="currentusers" title="Current Users">
                  <CurrentUsers />
                </Tab>
                <Tab eventKey="registeredusers" title="Registered Users">
                  <RegisterUsers />
                </Tab>
              </Tabs>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
