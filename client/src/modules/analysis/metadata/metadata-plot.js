import { useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import cloneDeep from "lodash/cloneDeep";
import { formState, plotState, selectedPoints } from "./metadata-plot.state";
import { analysisState } from "../analysis.state";
import { selectSampleState } from "../copy-number/copy-number.state";
import { tableColumnsMap, tableColumns } from "../table/table.state";
import Plot from "react-plotly.js";

export default function MetdataPlot() {
  const [revision, setRevision] = useState(0);
  const plot = useRecoilValue(plotState);
  const setSelectedPoints = useSetRecoilState(selectedPoints);
  const setTabs = useSetRecoilState(analysisState);
  const setSample = useSetRecoilState(selectSampleState);
  const { organSystem } = useRecoilValue(formState);

  function handleSelect(e) {
    if (e?.points.length) {
      setSelectedPoints((state) => {
        const groups = state.groups.slice();
        const visibleColumns = tableColumnsMap[organSystem] || tableColumnsMap.default;
        const columns = tableColumns.map((c) => ({ ...c, show: visibleColumns.includes(c.accessor) }));
        const table = {
          data: e.points.map((p) => p.customdata),
          columns,
          initialState: {
            hiddenColumns: columns.filter((c) => !c.show).map((c) => c.accessor),
            pageSize: 25,
          },
        };
        groups[state.selectedGroup] = table;
        return { ...state, groups };
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
        if (currentTab !== "copyNumber") {
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
