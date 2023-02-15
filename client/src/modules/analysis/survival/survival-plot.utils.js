import { groupBy } from "lodash";

export function getSummaryColumns(summary) {
  if (!summary || !summary.length) return [];

  const columnNames = Object.keys(summary[0]);
  return columnNames.map((name) => ({
    Header: name,
    id: name,
    accessor: (row) => row[name],
  }));
}

export function getSurvivalPlot(data, includeCensors = true) {
  let traces = [];
  let layout = {
    margin: { t: 0 },
    xaxis: {
      title: "Overall Survival (months)",
    },
    yaxis: {
      title: "Survival Probability",
      range: [0, 1.1], // [0, 1] will cut off the top of the graph
    },
    hovermode: "x",
  };

  if (!data) {
    return { data: traces, layout };
  }

  const xKey = "time";
  const yKey = "surv";
  const censorKey = "n.censor";

  const groups = groupBy(data, "strata");

  for (let name in groups) {
    const rows = groups[name];
    const isUndefined = name === "undefined";

    const curve = {
      name: isUndefined ? "group=1" : name,
      x: rows.map((row) => row[xKey]),
      y: rows.map((row) => row[yKey]),
      line: { shape: "hv" },
      mode: "lines",
      type: "scatter",
      showlegend: !isUndefined,
    };

    traces.push(curve);

    if (includeCensors) {
      const censoredRows = rows.filter((row) => row[censorKey] > 0);
      const censors = {
        x: censoredRows.map((row) => row[xKey]),
        y: censoredRows.map((row) => row[yKey]),
        mode: "markers",
        type: "scatter",
        showlegend: false,
        hoverinfo: "skip",
        marker: {
          size: 4,
          symbol: "203",
          opacity: 0.2,
        },
      };
      traces.push(censors);
    }
  }

  return { data: traces, layout };
}
