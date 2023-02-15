import { Suspense } from "react";
import Alert from "react-bootstrap/Alert";
import Loader from "../../components/loader";
import ErrorBoundary from "../../components/error-boundary";
import CopyNumberForm from "./copy-number-form";
import CopyNumberPlot from "./copy-number-plot";

export default function CopyNumber({ className }) {
  return (
    <div className={className}>
      <b>Genome-wide Copy Number</b>
      <p>
        To view sample-level quality control metrics, click on a point in the embedding (please allow approximately 4-5
        seconds for the data to be displayed after clicking a sample). The summary data and plots are generated during
        functional normalization of the methylation signal intensities. It is important to assess both sample and probe
        quality prior to interpretatin of a case.
      </p>
      <CopyNumberForm />
      <ErrorBoundary
        fallback={
          <Alert variant="danger">
            An internal error prevented plots from loading. Please contact the website administrator if this problem
            persists.
          </Alert>
        }>
        <Suspense fallback={<Loader message="Loading Copy Number" />}>
          <CopyNumberPlot />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
