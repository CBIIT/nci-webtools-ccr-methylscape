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
    {
      title: "Submissions Report",
      icon: "bi-layer-backward",
      link: "/admin/submissions-report",
    },
  ];

  return (
    <Container>
      <Row className="my-4">
        <h3 className="text-white">Administrative Tasks</h3>
      </Row>
      <Row className="mb-4">
        {actions.map((action, index) => (
          <Col lg={4} md={6} key={`admin-action-${index}`}>
            <Link to={action.link} className="text-decoration-none">
              <Card className="card-link card-accent-primary mb-3">
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
