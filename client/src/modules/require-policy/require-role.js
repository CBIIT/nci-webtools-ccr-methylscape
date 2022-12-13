import { useRecoilValue } from "recoil";
import { sessionState } from "../session/session.state";
import DefaultUnauthorizedTemplate from "./default-unauthorized-template";

export default function RequireRole({ role = null, children, unauthorizedTemplate = <DefaultUnauthorizedTemplate /> }) {
  const session = useRecoilValue(sessionState);
  const authorized = session.authenticated && session.user?.id && (!role || session.user?.roleName === role);
  return authorized ? children : unauthorizedTemplate;
}
