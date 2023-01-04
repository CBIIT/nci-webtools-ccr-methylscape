import { Button } from "react-bootstrap";
import { useRecoilState, useResetRecoilState } from "recoil";
import { selectedPoints } from "../metadata/metadata-plot.state";

export default function GroupTabs() {
  const resetPoints = useResetRecoilState(selectedPoints);
  const [umapPoints, setUmapPoints] = useRecoilState(selectedPoints);

  function addTab() {
    let points = [...(umapPoints?.points || [])];
    if (points.length < 3) {
      points.push([]);
      setUmapPoints({ ...umapPoints, points, selectedGroup: points.length - 1 });
    }
  }

  function removeTab(index) {
    let points = [...(umapPoints?.points || [])];
    if (points.length > 1) {
      points.splice(index, 1);
      setUmapPoints({ ...umapPoints, points, selectedGroup: points.length - 1 });
    }
  }

  return (
    <div className="d-flex justify-content-between">
      <div>
        <Button size="sm" variant="success" onClick={addTab}>
          + Group
        </Button>
        {+umapPoints.selectedGroup !== 0 && (
          <Button size="sm" variant="danger" onClick={() => removeTab(umapPoints.selectedGroup)} className="ms-3">
            - Group
          </Button>
        )}
      </div>
      <Button size="sm" variant="outline-danger" onClick={resetPoints} className="ms-3">
        Reset
      </Button>
    </div>
  );
}
