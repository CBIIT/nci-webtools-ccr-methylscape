import { useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { sessionState } from "../session/session.state";
import { isAuthorized } from "./require-policy.utils";
import DefaultUnauthorizedTemplate from "./default-unauthorized-template";

export default function RequirePolicy({ action, children, unauthorizedTemplate = <DefaultUnauthorizedTemplate /> }) {
  const session = useRecoilValue(sessionState);
  const location = useLocation();
  const resource = location?.pathname || "/";
  const authorized = isAuthorized(session, action, resource);
  return authorized ? children : unauthorizedTemplate;
}
