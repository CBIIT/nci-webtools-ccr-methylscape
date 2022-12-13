import { useRecoilValue } from "recoil";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import { sessionState } from "../session/session.state";

export default function UserProfile() {
  const session = useRecoilValue(sessionState);

  return (
    <Container className="py-3">
      <Row className="mb-3">
        <h1 className="text-white">User Profile</h1>
      </Row>
      <Row>
        <Col>
          <Card className="h-100">
            <Card.Body>
              {/* <h1 class="h4 mb-3 text-primary">Summary</h1> */}
              <p>
                Please contact the <a href="mailto:MethylscapeWebAdmin@mail.nih.gov">site administrator</a> if your user
                profile is inaccurate or needs to be updated.
              </p>

              {session.user && (
                <Table className="w-auto">
                  <tbody>
                    <tr>
                      <th className="text-muted">First Name</th>
                      <td>{session.user?.firstName}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Last Name</th>
                      <td>{session.user?.lastName}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Email</th>
                      <td>{session.user?.email}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Role</th>
                      <td>{session.user?.roleName}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Organization</th>
                      <td>{session.user?.organizationName}</td>
                    </tr>
                    <tr>
                      <th className="text-muted">Account Type</th>
                      <td>{session.user?.accountType}</td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
