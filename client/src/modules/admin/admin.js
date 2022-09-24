import { Container, Col, Row, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Admin() {
  const actions = [
    {
      title: "Manage Users",
      icon: "bi-people-fill",
      link: "/admin/users",
    },
    {
      title: "Manage Organizations",
      icon: "bi-building",
      link: "/admin/organizations",
    },
    {
      title: "Import Data",
      icon: "bi-layer-backward",
      link: "/admin/data-import",
    },
  ];

  return (
    <Container fluid="xxl" className="my-4 p-3 rounded bg-white">
      <h1 className="h3 mb-4 px-3 text-primary">Administrative Tasks</h1>
      <hr className="mb-4 mb-4 border-info" />

      <Row className="px-3">
        {actions.map((action, index) => (
          <Col md="3" key={`admin-action-${index}`}>
            <Link to={action.link} className="text-decoration-none">
              <Card className="card-link card-accent-primary">
                <Card.Body className="shadow">
                  <div className="text-center py-4 admin-manage-icons">
                    <i className={`display-3 bi ${action.icon}`} role="img" aria-label={action.title} />
                    <h2 className="h5">{action.title}</h2>
                  </div>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
