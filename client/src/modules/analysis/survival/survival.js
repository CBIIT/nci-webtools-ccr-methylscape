import { Container } from "react-bootstrap";
import { Suspense } from "react";
import Alert from "react-bootstrap/Alert";
import Loader from "../../components/loader";
import ErrorBoundary from "../../components/error-boundary";
import SurvivalPlot from "./survival-plot";

export const warnings = {
  noSurvivalData: "No survival data could be found for the selected samples.",
  noUserSelection: "Please select samples using the Box Select tool to view survival data.",
};

export default function Survival() {
  return (
    <Container fluid>
      <ErrorBoundary fallback={<Alert variant="info">{warnings.noSurvivalData}</Alert>}>
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
