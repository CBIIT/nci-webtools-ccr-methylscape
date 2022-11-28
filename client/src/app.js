import { Suspense } from "react";
import { RecoilRoot } from "recoil";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Loader from "./modules/components/loader";
import Navbar from "./modules/components/navbar";
import Reports from "./modules/reports/data";
import About from "./modules/about/about";
import Home from "./modules/home/home";
import Analysis from "./modules/analysis/analysis";
import MetadataSA from "./modules/analysis/metadata/metadata-standalone";
import Projects from "./modules/reports/projects/projects";
import Experiments from "./modules/reports/experiments/experiments";
import Samples from "./modules/reports/samples/samples";
import Admin from "./modules/admin/admin";
import DataImport from "./modules/admin/data-import/data-import";
import AdminUserManagement from "./modules/admin/user-management/admin-user-management";
import AdminOrganizationManagement from "./modules/admin/organization-management/admin-organization-management";
import Session from "./modules/session/session";
import ErrorBoundary from "./modules/components/error-boundary";
import Header from "./header";
import UserRegister from "./modules/user/user-registration";
import RequirePolicy from "./modules/require-policy/require-policy";
import { isAuthorized } from "./modules/require-policy/require-policy.utils";
import SessionRefreshModal from "./modules/session/session-refresh-modal";

export default function App() {
  const navbarLinks = [
    [
      { path: "/", title: "Home", exact: true },
      {
        path: "analysis",
        title: "Analysis",
        show: (session) => isAuthorized(session, "GetPage", "/analysis"),
      },
      {
        path: "reports",
        title: "Samples",
        show: (session) => isAuthorized(session, "GetPage", "/reports"),
      },
      { path: "about", title: "About" },
    ],
    [
      {
        path: "admin",
        title: "Admin",
        show: (session) => isAuthorized(session, "GetPage", "/admin"),
      },
      {
        path: "/api/logout",
        title: "Logout",
        native: true,
        show: (session) => session.authenticated,
      },
      {
        title: "Register",
        show: (session) => !session.authenticated,
        align: "end",
        path: "register",
      },
      {
        title: "Login",
        show: (session) => !session.authenticated,
        align: "end",
        path: "/api/login",
        native: true,
      },
    ],
  ];

  return (
    <RecoilRoot>
      <Router>
        <Session>
          <SessionRefreshModal />
          <Header />

          <Navbar linkGroups={navbarLinks} className="shadow-sm navbar-bottom-line" />
          <ErrorBoundary
            fallback={
              <Alert variant="danger" className="m-5">
                An internal error prevented this page from loading. Please contact the website administrator if this
                problem persists.
              </Alert>
            }>
            <Suspense fallback={<Loader message="Loading Page" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="register" element={<UserRegister />} />
                <Route
                  path="analysis"
                  element={
                    <RequirePolicy action="GetPage">
                      <Analysis />
                    </RequirePolicy>
                  }
                />
                <Route
                  path="metadata"
                  element={
                    <RequirePolicy action="GetPage">
                      <MetadataSA />
                    </RequirePolicy>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <RequirePolicy action="GetPage">
                      <Reports />
                    </RequirePolicy>
                  }>
                  <Route
                    path="projects"
                    element={
                      <RequirePolicy action="GetPage">
                        <Projects />
                      </RequirePolicy>
                    }
                  />
                  <Route
                    path="experiments"
                    element={
                      <RequirePolicy action="GetPage">
                        <Experiments />
                      </RequirePolicy>
                    }
                  />
                  <Route
                    path="samples"
                    element={
                      <RequirePolicy action="GetPage">
                        <Samples />
                      </RequirePolicy>
                    }
                  />
                </Route>
                <Route path="about" element={<About />} />
                <Route
                  path="admin"
                  element={
                    <RequirePolicy action="GetPage">
                      <Admin />
                    </RequirePolicy>
                  }
                />
                <Route
                  path="admin/users"
                  element={
                    <RequirePolicy action="GetPage">
                      <AdminUserManagement />
                    </RequirePolicy>
                  }
                />
                <Route
                  path="admin/organizations"
                  element={
                    <RequirePolicy action="GetPage">
                      <AdminOrganizationManagement />
                    </RequirePolicy>
                  }
                />
                <Route
                  path="admin/data-import"
                  element={
                    <RequirePolicy action="GetPage">
                      <DataImport />
                    </RequirePolicy>
                  }
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Session>
      </Router>
    </RecoilRoot>
  );
}
