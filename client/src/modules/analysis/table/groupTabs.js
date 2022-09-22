import { Button } from "react-bootstrap";
import { useRecoilState, useResetRecoilState } from "recoil";
import { tableForm } from "./table.state";
import { selectedPoints } from "../metadata/metadata-plot.state";

export default function GroupTabs() {
  const [formState, setState] = useRecoilState(tableForm);
  const setForm = (newState) => setState({ ...formState, ...newState });
  const resetForm = useResetRecoilState(tableForm);
  const resetPoints = useResetRecoilState(selectedPoints);
  const [umapPoints, setUmapPoints] = useRecoilState(selectedPoints);

  function addTab() {
    let points = umapPoints?.points ? umapPoints.points.slice() : [];
    if (points.length < 3) {
      points = [...points, []];
      setUmapPoints({ ...umapPoints, points });
      setForm({ group: points.length - 1 });
    }
  }

  function removeTab(index) {
    let points = umapPoints?.points ? umapPoints.points.slice() : [];
    if (points.length > 1) {
      points.splice(index, 1);
      setUmapPoints({ ...umapPoints, points });
      setForm({ group: points.length - 1 });
    }
  }

  return (
    <div>
      <Button size="sm" variant="success" onClick={addTab}>
        + Group
      </Button>
      <Button
        size="sm"
        variant="outline-danger"
        onClick={() => {
          resetForm();
          resetPoints();
        }}
        className="ms-3">
        Reset
      </Button>
      {formState.group != 0 && (
        <Button size="sm" variant="danger" onClick={() => removeTab(formState.group)} className="ms-3">
          - Group
        </Button>
      )}
    </div>
  );
}
