import { useRecoilValue } from "recoil";
import { sessionState } from "./session.state";

export default function SessionRoleWarning({ children }) {
  const session = useRecoilValue(sessionState);
  const showWarning = session.authenticated && !(session.user?.id && session.user?.roleId);
  return showWarning ? children : null;
}
