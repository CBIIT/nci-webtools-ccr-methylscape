import { useState } from "react";
import { useRecoilValue } from "recoil";
import { plotState } from "./copy-number.state";
import Plot from "react-plotly.js";
import cloneDeep from "lodash/cloneDeep";

export default function CopyNumberPlot() {
  const { data, config, layout, error } = useRecoilValue(plotState);

  return (
    <>
      {error && error}
      {data?.length ? (
        <Plot
          data={cloneDeep(data)}
          layout={cloneDeep(layout)}
          config={cloneDeep(config)}
          className="w-100"
          useResizeHandler
          style={{ height: "800px" }}
        />
      ) : (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "300px" }}>
          Please select a sample in the UMAP plot.
        </div>
      )}
    </>
  );
}
