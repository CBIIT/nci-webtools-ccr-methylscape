import { Suspense } from "react";
import { useRecoilValue } from "recoil";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
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
import SessionRefreshModal from "./modules/session/session-refresh-modal";
import Session from "./modules/session/session";
import ErrorBoundary from "./modules/components/error-boundary";
import Header from "./header";
import UserRegister from "./modules/user/user-registration";
import RequirePolicy from "./modules/require-policy/require-policy";
import RequireRole from "./modules/require-policy/require-role";
import { isAuthorized } from "./modules/require-policy/require-policy.utils";
import { sessionState } from "./modules/session/session.state";
import UserProfile from "./modules/user/user-profile";
import Submissions from "./modules/submissions/submissions";
import SubmissionsForm from "./modules/submissions/submissions-form";
import SubmissionsList from "./modules/submissions/submissions-list";
import SubmissionsReport from "./modules/admin/submissions-report/report";

export default function App() {
  const session = useRecoilValue(sessionState);
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
      {
        path: "submissions",
        title: "Submissions",
        show: (session) => isAuthorized(session, "GetPage", "/submissions"),
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
        title: "Register",
        show: (session) => !session.authenticated || !session.user.id,
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
      {
        title: "Logout",
        show: (session) => session.authenticated && !session.user.id,
        path: "/api/logout",
        native: true,
      },
      {
        title: session.user ? [session.user?.firstName, session.user?.lastName].join(" ") : "Profile",
        show: (session) => session.authenticated && session.user.id,
        align: "end",
        childLinks: [
          {
            title: "User Profile",
            path: "/profile",
          },
          {
            title: "Logout",
            path: "/api/logout",
            native: true,
          },
        ],
      },
    ],
  ];

  return (
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
              <Route
                path="submissions"
                element={
                  <RequirePolicy action="GetPage">
                    <Submissions />
                  </RequirePolicy>
                }>
                <Route
                  path="create"
                  element={
                    <RequirePolicy action="GetPage">
                      <SubmissionsForm />
                    </RequirePolicy>
                  }
                />
                <Route
                  path="list"
                  element={
                    <RequirePolicy action="GetPage">
                      <SubmissionsList />
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
              <Route
                path="admin/submissions-report"
                element={
                  <RequirePolicy action="GetPage">
                    <SubmissionsReport />
                  </RequirePolicy>
                }
              />
              <Route
                path="profile"
                element={
                  <RequireRole>
                    <UserProfile />
                  </RequireRole>
                }
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Session>
    </Router>
  );
}
