import { Suspense, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { Alert, Container, Row, Col } from "react-bootstrap";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { methylscapeData } from "./data.state";
import Loader from "../components/loader";
import ErrorBoundary from "../components/error-boundary";
import ProjectImg from "../home/images/ProjectImage.png";
import ExperimentImg from "../home/images/ExperimentImage.png";
import SampleImg from "../home/images/SampleImage.png";
import "./data.scss";

export default function Data() {
  const { data, projectsCount, experimentsCount, samplesCount, sampleData } = useRecoilValue(methylscapeData);
  const location = useLocation().pathname.split("/").slice(-1);
  const navigate = useNavigate();

  // automatically redirect to one of the reports tabs, projects by default
  useEffect(() => {
    if (location == "reports") navigate("projects");
  }, [location]);

  const links = [
    { path: "projects", title: "Projects", count: projectsCount, img: ProjectImg },
    { path: "experiments", title: "Experiments", count: experimentsCount, img: ExperimentImg },
    { path: "samples", title: "Samples", count: samplesCount, img: SampleImg },
  ];

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h3 className="text-white text-capitalize">{location}</h3>
        </Col>
      </Row>

      <Row>
        <ErrorBoundary
          fallback={
            <Alert variant="danger">
              An internal error prevented plots from loading. Please contact the website administrator if this problem
              persists.
            </Alert>
          }>
          <Col>
            <Suspense fallback={<Loader message="Loading Samples" />}>
              <div className="bg-light mb-4 rounded">
                <Row className="justify-content-center">
                  {links.map((link, index) => (
                    <Col xl={3} className={index < links.length - 1 ? "border-end" : ""} key={index}>
                      <NavLink
                        to={link.path}
                        className={({ isActive }) =>
                          [
                            "py-4",
                            "data-background-image",
                            "text-decoration-none d-flex",
                            isActive ? "border-active" : "border-inactive",
                          ].join(" ")
                        }
                        style={{ backgroundImage: `url(${link.img})` }}>
                        <div className="data-text text-black">
                          {link.count}
                          <h5 className="fw-light">{link.title}</h5>
                        </div>
                      </NavLink>
                    </Col>
                  ))}
                </Row>
              </div>
            </Suspense>
          </Col>
        </ErrorBoundary>
      </Row>
      <Row>
        <Col>
          <div className="bg-white mb-4 rounded">
            <Outlet />
          </div>
        </Col>
      </Row>
    </Container>
  );
}
