import { useState } from "react";
import { useRecoilValue } from "recoil";
import { plotState } from "./copy-number.state";
import Plot from "react-plotly.js";
import cloneDeep from "lodash/cloneDeep";

export default function CopyNumberPlot() {
  const { data, config, layout, error } = useRecoilValue(plotState);
  const [state, setState] = useState({
    x: "",
    y: "",
    genes: [],
  });

  function handleClick(e) {
    if (e) {
      setState({
        ratio: e.points[0].y,
        data: e.points[0].customdata,
      });
    }
  }

  return (
    <div>
      {error && error}
      {(!data || !data.length) && (
        <div className="d-flex bg-light" style={{ minHeight: "300px" }}>
          <p className="mx-auto my-auto">Please select a sample in the UMAP plot</p>
        </div>
      )}
      {data && data.length && (
        <div>
          <Plot
            data={cloneDeep(data)}
            layout={cloneDeep({
              ...layout,
              uirevision: layout.uirevision + state.ratio,
            })}
            config={cloneDeep(config)}
            className="w-100"
            useResizeHandler
            style={{ height: "800px" }}
            onClick={handleClick}
          />
          {state.ratio && (
            <div>
              <h4>Bin Info</h4>
              <div>
                Location: {state.data.chromosome} ({state.data.start}
                {" - "}
                {state.data.end})
              </div>
              <div>
                log<sub>2</sub>ratio: {state.data.medianLogIntensity}
              </div>
              <div>
                Genes:{" "}
                <ul>
                  {state.data.gene.map((gene) => (
                    <li>{gene}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
