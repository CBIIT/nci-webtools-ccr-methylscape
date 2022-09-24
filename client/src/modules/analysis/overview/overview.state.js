import { selector } from "recoil";
import { sampleCoordinatesState } from "../metadata/metadata-plot.state";

export const defaultOverviewState = {
  samples: 0,
  studies: 0,
  institutions: 0,
  plot: { data: [], layout: {}, config: {} },
};

export const overviewState = selector({
  key: "overviewState",
  get: async ({ get }) => {
    const data = get(sampleCoordinatesState);
    if (!data.length) return defaultOverviewState;

    const samples = data.filter((v) => v.category); // && v.matchedCases != 'Duplicate');
    const studies = [
      ...new Set(samples.filter(({ primaryStudy }) => primaryStudy).map(({ primaryStudy }) => primaryStudy)),
    ].length;
    const institutions = [
      ...new Set(
        samples.filter(({ centerMethylation }) => centerMethylation).map(({ centerMethylation }) => centerMethylation)
      ),
    ].length;

    const reducer = (prev, curr, i, arr) => {
      if (prev[curr]) {
        return { ...prev, [curr]: prev[curr] + 1 };
      } else {
        return { ...prev, [curr]: 1 };
      }
    };

    const catCount = Object.fromEntries(
      Object.entries(samples.map(({ category }) => category).reduce(reducer, {})).sort(([, a], [, b]) => a - b)
    );
    const plotData = [
      {
        x: Object.values(catCount),
        y: Object.keys(catCount),
        type: "bar",
        orientation: "h",
      },
    ];

    const layout = {
      margin: {
        b: 50,
        t: 50,
        pad: 4,
      },
      yaxis: { automargin: true },
      autosize: true,
    };

    return {
      samples: samples.length,
      studies,
      institutions,
      plot: { data: plotData, layout, config: {} },
    };
  },
});
