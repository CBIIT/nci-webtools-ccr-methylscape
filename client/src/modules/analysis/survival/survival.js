import { Container } from "react-bootstrap";
import { Suspense } from "react";
import Alert from "react-bootstrap/Alert";
import Loader from "../../components/loader";
import ErrorBoundary from "../../components/error-boundary";
import SurvivalPlot from "./survival-plot";

export default function Survival() {
  return (
    <Container fluid>
      <ErrorBoundary
        fallback={
          <Alert variant="info">
            No survival data could be found for the selected samples. Please contact the website administrator if this
            problem persists.
          </Alert>
        }>
        <Suspense
          fallback={
            <div className="position-relative" style={{ minHeight: "300px" }}>
              <Loader message="Loading Survival Plot" />
            </div>
          }>
          <SurvivalPlot />
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}
