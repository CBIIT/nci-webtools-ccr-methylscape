import { atom, selector } from "recoil";
import axios from "axios";
import groupBy from "lodash/groupBy";
import meanBy from "lodash/meanBy";
import isNumber from "lodash/isNumber";
import mapValues from "lodash/mapValues";
import colors from "./colors.json";
import nciMetricColors from "./nciMetricColors";

export const defaultFormState = {
  organSystem: "centralNervousSystem",
  embedding: "umap",
  search: [],
  showAnnotations: true,
  color: { label: "NCI Metric", value: "nciMetric", type: "categorical" },
};

export const formState = atom({
  key: "metadataPlot.formState",
  default: defaultFormState,
});

export const defaultSelectedPoints = {
  points: [[]],
};

export const selectedPoints = atom({
  key: "metadataPlot.selected",
  default: defaultSelectedPoints,
});

export const defaultPlotState = {
  data: [],
  layout: {},
  config: {},
};

export const plotState = selector({
  key: "metadataPlot.plotState",
  get: async ({ get }) => {
    const { organSystem, embedding, search, showAnnotations, color } = get(formState);

    if (!organSystem || !embedding) return defaultPlotState;

    const params = { embedding, organSystem };
    const { data } = await axios.get("/api/analysis/samples", { params });

    // filter plot by search if show annotations is toggled false
    const searchQueries = search.map(({ value }) => value.toLowerCase());
    // if (!showAnnotations && searchQueries.length) {
    //   data = data.filter(
    //     ({ sample, idatFilename }) =>
    //       (sample &&
    //         searchQueries.some((query) =>
    //           sample.toLowerCase().includes(query)
    //         )) ||
    //       (idatFilename &&
    //         searchQueries.some((query) =>
    //           idatFilename.toLowerCase().includes(query)
    //         ))
    //   );
    // }

    const useWebGl = data.length > 1000;

    // use mean x/y values for annotation positions
    // const labelAnnotations = dataGroupedByLabel
    //   .filter(
    //     ([name, value]) => !['null', 'undefined', ''].includes(String(name))
    //   )
    //   .map(([name, value]) => ({
    //     text: name,
    //     x: meanBy(value, (e) => e.x),
    //     y: meanBy(value, (e) => e.y),
    //     showarrow: false,
    //   }));

    // const classAnnotations = dataGroupedByClass
    //   .filter(
    //     ([name, value]) => !['null', 'undefined', ''].includes(String(name))
    //   )
    //   .map(([name, value]) => ({
    //     text: name,
    //     x: meanBy(value, (e) => e.x),
    //     y: meanBy(value, (e) => e.y),
    //     showarrow: false,
    //   }));

    // show annotations for samples from the past 10 days
    const weeklyThreshold = Date.now() - 1000 * 60 * 60 * 24 * 10;
    const isClinicalAnnotation = (d) =>
      d.batchDate && new Date(d.batchDate).getTime() > weeklyThreshold && d.samplePlate === "Clinical Testing";
    const weeklyAnnotations = data.filter(isClinicalAnnotation).map((value) => ({
      text: value.sample,
      x: value.x,
      y: value.y,
      showarrow: true,
    }));

    // add annotations from search filter
    const sampleAnnotations = searchQueries.length
      ? data
          .filter(
            ({ sample, idatFilename }) =>
              (sample && searchQueries.some((query) => sample.toLowerCase().includes(query))) ||
              (idatFilename && searchQueries.some((query) => idatFilename.toLowerCase().includes(query)))
          )
          .map((e) => ({
            text: e.sample || e.idatFilename,
            x: e.x,
            y: e.y,
            // showarrow: false,
          }))
      : [];

    const hovertemplate =
      [
        "Sample: %{customdata.sample}",
        "Metric: %{customdata.nciMetric}",
        "Diagnosis: %{customdata.diagnosisProvided}",
        "Sex: %{customdata.sex}",
        "RF Purity (Absolute): %{customdata.customRfPurityAbsolute}",
        "Age: %{customdata.customAge}",
      ].join("<br>") + "<extra></extra>";

    // Sort these keywords to the top so that their traces are rendered first and overlapped by others
    const sortTopKeyWord = ["No_match", "Unclassified", "NotAvailable", "null"];

    // const dataGroupedByClass = Object.entries(groupBy(data, (e) => e.v11b6));
    // const dataGroupedByLabel = Object.entries(groupBy(data, (e) => e.nihLabel));

    // organize data for unique colors by categorical (multiple traces) or continuous (single trace) variables
    const dataGroupedByColor =
      color.type == "categorical"
        ? Object.entries(groupBy(data, (e) => e[color.value])).sort((a, b) =>
            sortTopKeyWord.includes(a[0]) ? -1 : sortTopKeyWord.includes(b[0]) ? 1 : a[0].localeCompare(b[0])
          )
        : [[color.value, data]];

    const nciMetricColorMap = await nciMetricColors();
    let colorCount = 0;

    // maximum fixed precision formatter
    const toFixed = (num, maxDigits = 2) => (isNumber(num) && !isNaN(num) ? +num.toFixed(maxDigits) : num);

    // transform data to traces
    const dataTraces = dataGroupedByColor.map(([name, data]) => ({
      name,
      x: data.map((e) => e.x),
      y: data.map((e) => e.y),
      customdata: data.map((d) => ({
        ...mapValues(d, (v) => v ?? "N/A"),
        customRfPurityAbsolute: +toFixed(d.rfPurityAbsolute, 2) ?? "N/A",
        customAge: +toFixed(d.age, 1) ?? "N/A",
      })),
      mode: "markers",
      hovertemplate: hovertemplate,
      type: useWebGl ? "scattergl" : "scatter",
      marker: {
        size: 7,
        color:
          color.type == "categorical"
            ? nciMetricColorMap[name] || colors[colorCount++]
            : data.map((e) => e[color.value]),
        colorbar: color.type == "continuous" ? { title: color.label, dtick: color.dtick } : null,
      },
    }));
    const plotTitles = {
      centralNervousSystem: "Central Nervous System",
      boneAndSoftTissue: "Bone and Soft Tissue",
      hematopoietic: "Hematopoietic",
      renal: "Renal",
      panCancer: "Pan-Cancer",
    };

    // set layout
    const layout = {
      title: `${plotTitles[organSystem] || organSystem} (n=${data.length})`,
      xaxis: {
        title: `${embedding} x`,
      },
      yaxis: {
        title: `${embedding} y`,
      },
      annotations: showAnnotations
        ? [
            // ...labelAnnotations,
            ...sampleAnnotations,
            // ...classAnnotations
            ...weeklyAnnotations,
          ]
        : [...sampleAnnotations],
      uirevision: organSystem + embedding + color.value + search + showAnnotations,
      legend: { title: { text: color.label } },
      autosize: true,
      dragmode: "zoom",
    };

    const config = {
      scrollZoom: true,
    };

    return {
      data: [
        ...dataTraces,
        // classAnnotationTrace,
      ],
      layout,
      config,
    };
  },
});
