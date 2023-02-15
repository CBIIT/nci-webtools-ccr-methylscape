import groupBy from "lodash/groupBy.js";
import merge from "lodash/merge.js";

export const defaultPlot = {
  layout: {
    autosize: true,
    margin: {
      t: 0,
    },
    legend: {
      orientation: "h",
      xanchor: "center",
      x: 0.5,
      y: -0.1,
    },
  },
  config: {
    displayModeBar: false,
    responsive: true,
  },
};
export function getGroupedCounts(data, key) {
  return Object.entries(groupBy(data, key)).map((group) => [group[0], group[1].length]);
}

export function getPiePlot(data, config = {}) {
  return merge(config, defaultPlot, {
    data: [
      {
        labels: data.map((v) => v[0]),
        values: data.map((v) => v[1]),
        type: "pie",
        textinfo: "none",
        scalegroup: "projects",
      },
    ],
  });
}

export function getHistogramPlot(data, config = {}) {
  return merge(config, defaultPlot, {
    layout: {
      showlegend: false,
      hovermode: "x unified",
      xaxis: {
        fixedrange: true,
      },
      yaxis: {
        fixedrange: true,
      },
    },
    data: [
      {
        x: data,
        type: "histogram",
      },
    ],
  });
}
