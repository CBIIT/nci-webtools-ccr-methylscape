import { Container } from "react-bootstrap";
import TableGroupControls from "./table-group-controls";
import TableGroups from "./table-groups";

export default function Table() {
  return (
    <Container fluid>
      <TableGroupControls />
      <TableGroups />
    </Container>
  );
}
