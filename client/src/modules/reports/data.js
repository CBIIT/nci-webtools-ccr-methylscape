import { Suspense, useEffect } from "react";
import Container from "react-bootstrap/Container";
import { useRecoilValue } from "recoil";
import { methylscapeData } from "./data.state";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import Alert from "react-bootstrap/Alert";
import Loader from "../components/loader";
import ErrorBoundary from "../components/error-boundary";
import "./data.scss";
import ProjectImg from "../home/images/ProjectImage.png";
import ExperimentImg from "../home/images/ExperimentImage.png";
import SampleImg from "../home/images/SampleImage.png";
import { Row, Col } from "react-bootstrap";

export default function Data() {
  const { data, projectsCount, experimentsCount, samplesCount, sampleData } = useRecoilValue(methylscapeData);
  const location = useLocation().pathname.split("/").slice(-1);
  const navigate = useNavigate();

  const navClass = "text-decoration-none d-flex";
  const activeNavClass = " border-bottom border-5 border-warning";

  // automatically redirect to one of the reports tabs, projects by default
  useEffect(() => {
    if (location == "reports") navigate("projects");
  }, [location]);

  return (
    <>
      <Container>
        <Row className="m-3">
          <h1 className="text-white text-capitalize">{location}</h1>
        </Row>
      </Container>
      <Container fluid="xxl" className="d-flex bg-light justify-content-center">
        <ErrorBoundary
          fallback={
            <Alert variant="danger">
              An internal error prevented plots from loading. Please contact the website administrator if this problem
              persists.
            </Alert>
          }>
          <Suspense fallback={<Loader message="Loading Samples" />}>
            <Row className="vw-100 border-bottom justify-content-md-center">
              <Col md={2}>
                <NavLink
                  to={"projects"}
                  className={({ isActive }) => (isActive ? navClass + activeNavClass : navClass)}>
                  {/* <PieChartFill className="stat-icon" /> */}
                  <img src={ProjectImg} className="stat-icon" alt="Project" />
                  <div className="data-text-project text-black">
                    {projectsCount}
                    <h5 className="fw-light text-black">Projects</h5>
                  </div>
                </NavLink>
              </Col>
              <Col md={2} className="border-start border-end">
                <NavLink
                  to={"experiments"}
                  className={({ isActive }) => (isActive ? navClass + activeNavClass : navClass)}>
                  {/* <ClipboardData className="stat-icon" /> */}
                  <img src={ExperimentImg} className="stat-icon" alt="Experiment" />
                  <div className="data-text-experiment text-black">
                    {experimentsCount}
                    <h5 className="fw-light">Experiments</h5>
                  </div>
                </NavLink>
              </Col>
              <Col md={2}>
                <NavLink to={"samples"} className={({ isActive }) => (isActive ? navClass + activeNavClass : navClass)}>
                  {/* <PeopleFill className="stat-icon" /> */}
                  <img src={SampleImg} className="stat-icon" alt="Samples" />
                  <div className="data-text-sample text-black">
                    {samplesCount}
                    <h5 className="fw-light">Samples</h5>
                  </div>
                </NavLink>
              </Col>
            </Row>
          </Suspense>
        </ErrorBoundary>
      </Container>
      <Container fluid="xxl" className="bg-white mb-4">
        <Outlet />
      </Container>
    </>
  );
}
