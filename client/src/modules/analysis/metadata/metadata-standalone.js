import { Metadata } from "./metadata";
import { Card, Container } from "react-bootstrap";
export default function MeatadataStandalone() {
  return (
    <Container fluid className="my-4">
      <Card>
        <Card.Body>
          <Metadata />
        </Card.Body>
      </Card>
    </Container>
  );
}
