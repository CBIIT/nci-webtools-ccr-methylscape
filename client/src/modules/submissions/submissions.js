import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function Submissions() {
  const location = useLocation().pathname.split("/").slice(-1);
  const navigate = useNavigate();

  // automatically redirect to one of the reports tabs, projects by default
  useEffect(() => {
    if (location == "submissions") navigate("list");
  }, [location]);

  return (
    <div className="d-flex justify-content-center my-3">
      <Outlet />
    </div>
  );
}
