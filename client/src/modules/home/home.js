import { useRecoilValue } from "recoil";
import { NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { sessionState } from "../session/session.state";
import { isAuthorized } from "../require-policy/require-policy.utils";
import backgroundImage from "./images/home-background.png";

export default function Home() {
  const session = useRecoilValue(sessionState);
  return (
    <Container fluid className="cover-image" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <Row className="my-9">
        <Col md={{ span: 4, offset: 1 }} className="text-white text-md-end">
          <h1>Methylscape</h1>
          <h1 className="mb-4">Analysis</h1>
          <p className="mb-4 lead">
            Explore the clinically-reportable assay that uses genome-wide DNA methylation profiling as a diagnostic tool
            for tumores of the central nervous system.
          </p>
          {isAuthorized(session, "GetPage", "/analysis") && (
            <NavLink className="btn btn-lg btn-outline-light" to="analysis">
              Perform Analysis
            </NavLink>
          )}
        </Col>
      </Row>
    </Container>
  );
}
