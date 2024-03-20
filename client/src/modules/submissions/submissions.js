import { Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "react-bootstrap";
import ErrorBoundary from "../components/error-boundary";
import Loader from "../components/loader";

export default function Submissions() {
  const location = useLocation().pathname.split("/").slice(-1);
  const navigate = useNavigate();

  // automatically redirect to one of the reports tabs, projects by default
  useEffect(() => {
    if (location == "submissions") navigate("list");
  }, [location]);

  return (
    <div className="d-flex justify-content-center my-3">
      <ErrorBoundary
        fallback={
          <Alert variant="danger">
            An internal error prevented data from loading. Please contact the website administrator if this problem
            persists.
          </Alert>
        }>
        <Suspense fallback={<Loader message="Loading" />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
