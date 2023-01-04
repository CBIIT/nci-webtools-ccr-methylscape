import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import aboutImage from "../home/images/About.Background-image.png";

export default function DefaultUnauthorizedTemplate() {
  return (
    <Card
      className="py-4 bg-primary text-white border-0 vh-100 cover-image"
      style={{ backgroundImage: `url(${aboutImage})` }}>
      <Card.Body>
        <Container>
          <Row>
            <Col md lg={{ span: 4 }} className="text-wrap text-end">
              <h1>Unauthorized</h1>
            </Col>
            <Col md lg={6}>
              <p>
                You are not authorized to access this page. If you have a Methylscape account, please contact the
                administrator to request access to this page.
              </p>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
}
