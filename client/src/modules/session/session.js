import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { sessionState } from "./session.state";
import { getUserSession } from "./session.utils";

export default function Session({ children }) {
  const setSession = useSetRecoilState(sessionState);
  const location = useLocation();

  useEffect(() => {
    getUserSession().then(setSession);
  }, [setSession, location]);

  return children;
}
