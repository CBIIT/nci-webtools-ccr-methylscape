import { useState, useRef } from "react";
import { useRecoilValue, useSetRecoilState, useRecoilCallback } from "recoil";
import cloneDeep from "lodash/cloneDeep";
import { plotState, selectedPoints } from "./metadata-plot.state";
import { analysisState } from "../analysis.state";
import { selectSampleState } from "../copy-number/copy-number.state";
import Plot from "react-plotly.js";

export default function MetdataPlot() {
  const [revision, setRevision] = useState(0);
  const plot = useRecoilValue(plotState);
  const setSelectedPoints = useSetRecoilState(selectedPoints);
  const setTabs = useSetRecoilState(analysisState);
  const setSample = useSetRecoilState(selectSampleState);

  function handleSelect(e) {
    if (e?.points.length) {
      setSelectedPoints((state) => {
        const points = state.points.slice();
        points[state.selectedGroup] = e.points;
        return { ...state, points };
      });
      setTabs((state) => {
        const { currentTab } = state;
        if (!["table", "survival"].includes(currentTab)) {
          return { ...state, currentTab: "table" };
        } else {
          return state;
        }
      });
    }
    // rerender with new traces to clear select box
    setRevision((r) => r + 1);
  }

  function handleClick(e) {
    if (e) {
      setSample((state) => ({
        ...state,
        idatFilename: e.points[0].customdata.idatFilename,
        sample: e.points[0].customdata.sample,
      }));
      setTabs((state) => {
        const { currentTab } = state;
        if (currentTab != "copyNumber") {
          return { ...state, currentTab: "copyNumber" };
        } else {
          return state;
        }
      });
    }
  }

  return (
    <Plot
      {...cloneDeep(plot)}
      className="w-100"
      style={{ height: "800px" }}
      onClick={handleClick}
      onSelected={handleSelect}
      revision={revision}
      useResizeHandler
    />
  );
}
