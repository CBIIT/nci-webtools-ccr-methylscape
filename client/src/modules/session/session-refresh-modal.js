import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { sessionState } from "./session.state";
import { getRefreshedUserSession, getRemainingTime, formatTime } from "./session.utils";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function SessionRefreshModal({ warningThresholds = [300, 180, 60] }) {
  const [sessionChannel, setSessionChannel] = useState(null);
  const [session, setSession] = useRecoilState(sessionState);
  const [remainingTime, setRemainingTime] = useState(getRemainingTime(session.expires));
  const [showWarning, setShowWarning] = useState(false);

  // ensure sessions are synced across all windows
  useEffect(() => {
    const channel = new BroadcastChannel("methylscapeSession");
    setSessionChannel(channel);
    channel.onmessage = ({ data }) => {
      setShowWarning(false);
      setSession(data);
    };
    return () => {
      setSessionChannel(null);
      channel.close();
    };
  }, [setShowWarning, setSession, setSessionChannel]);

  // show warnings at intervals
  useEffect(() => {
    const showWarningInterval = setInterval(() => {
      if (session.authenticated) {
        const remainingTime = getRemainingTime(session.expires);
        const showWarning = warningThresholds.includes(Math.floor(remainingTime));
        const hasExpired = remainingTime <= 0;
        setRemainingTime(remainingTime);

        if (hasExpired) {
          window.location.reload();
        } else if (showWarning) {
          setShowWarning(true);
        }
      }
    }, 500);
    return () => clearInterval(showWarningInterval);
  }, [session, setSession, setRemainingTime, warningThresholds]);

  async function refreshUserSession() {
    const session = await getRefreshedUserSession();
    setShowWarning(false);
    setSession(session);
    if (sessionChannel) {
      sessionChannel.postMessage(session);
    }
  }

  return (
    <>
      <Modal show={session.authenticated && showWarning} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Warning: Session Timeout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-5">
            Your session will expire in {formatTime(remainingTime)}. Please select an option below.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={(_) => setShowWarning(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={refreshUserSession}>
            Extend My Session
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
