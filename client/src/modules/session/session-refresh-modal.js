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
          <Modal.Title>Session timeout warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-4 text-center">
            Your session will expire in
            <p className="display-4">{formatTime(remainingTime)}</p>
            Select "Continue Session" to extend your session.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="w-100 d-flex justify-content-between">
            <Button variant="secondary" onClick={(_) => setShowWarning(false)}>
              Close
            </Button>
            <div>
              <Button variant="primary" onClick={refreshUserSession} className="me-1">
                Continue Session
              </Button>
              <Button variant="danger" href="/api/logout">
                End Session Now
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
