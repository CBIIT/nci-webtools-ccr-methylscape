import axios from "axios";
import groupBy from "lodash/groupBy";
import isNumber from "lodash/isNumber";
import mapValues from "lodash/mapValues";
import colors from "./colors.json";
import nciMetricColors from "./nciMetricColors.json";
import { defaultPlotState } from "./metadata-plot.state";

export const organSystemLabels = {
  centralNervousSystem: "Central Nervous System",
  boneAndSoftTissue: "Bone and Soft Tissue",
  hematopoietic: "Hematopoietic",
  renal: "Renal",
  panCancer: "Pan-Cancer",
};

export async function getSampleCoordinates({ organSystem, embedding }) {
  const response = await axios.get("/api/analysis/samples", { params: { organSystem, embedding } });
  return response.data;
}

export async function getMetadataPlot({ organSystem, embedding, search, showAnnotations, color }, sampleCoordinates) {
  if (!organSystem || !embedding) return defaultPlotState;
  const searchQueries = search.map(({ value }) => value.toLowerCase());
  const weeklyAnnotations = getWeeklyAnnotations(sampleCoordinates);
  const searchAnnotations = getSearchAnnotations(sampleCoordinates, searchQueries);

  const getCategoricalMarker = createCategoricalMarker(nciMetricColors, colors);
  const getContinuousMarker = createContinousMarker(color);

  // Sort these keywords to the top so that their traces are rendered first and overlapped by others
  const priorityKeywords = ["No_match", "Unclassified", "NotAvailable", "null"];
  const compareCategories = compareWithPriorityKeywords(priorityKeywords);

  // generate data traces from sample coordinates
  const data =
    color.type == "categorical"
      ? Object.entries(groupBy(sampleCoordinates, (e) => e[color.value]))
          .sort(compareCategories)
          .map(([name, sampleCoordinates]) => ({
            ...getScatterTrace(sampleCoordinates),
            marker: getCategoricalMarker(name),
            name,
          }))
      : [
          {
            ...getScatterTrace(sampleCoordinates),
            marker: getContinuousMarker(sampleCoordinates),
          },
        ];

  const title = `${organSystemLabels[organSystem] || organSystem} (n=${sampleCoordinates.length})`;
  const annotations = searchAnnotations.concat(showAnnotations ? weeklyAnnotations : []);
  const uirevision = organSystem + embedding + color.value + search + showAnnotations;

  const layout = {
    title,
    annotations,
    uirevision,
    xaxis: { title: `${embedding} x` },
    yaxis: { title: `${embedding} y` },
    legend: { title: { text: color.label } },
    autosize: true,
    dragmode: "zoom",
  };

  const config = {
    scrollZoom: true,
  };

  return { data, layout, config };
}

export function createCategoricalMarker(colorMap, colors) {
  let colorCount = 0;
  return (name) => ({
    color: colorMap[name] || colors[colorCount++],
  });
}

export function createContinousMarker(color) {
  return (data) => ({
    color: data.map((e) => e[color.value]),
    colorbar: { title: color.label, dtick: color.dtick },
  });
}

export function compareWithPriorityKeywords(keywords) {
  return ([a], [b]) => (keywords.includes(a) ? -1 : keywords.includes(b) ? 1 : a.localeCompare(b));
}

// maximum fixed precision formatter
function toFixed(num, maxDigits = 2) {
  return isNumber(num) && !isNaN(num) ? +num.toFixed(maxDigits) : num;
}

// get scatter traces from data
function getScatterTrace(data) {
  const hovertemplate =
    [
      "Sample: %{customdata.sample}",
      "Metric: %{customdata.nciMetric}",
      "Diagnosis: %{customdata.diagnosisProvided}",
      "Sex: %{customdata.sex}",
      "RF Purity (Absolute): %{customdata.customRfPurityAbsolute}",
      "Age: %{customdata.customAge}",
    ].join("<br>") + "<extra></extra>";

  const customdata = data.map((d) => ({
    ...mapValues(d, (v) => v ?? "N/A"),
    customRfPurityAbsolute: toFixed(d.rfPurityAbsolute, 2) ?? "N/A",
    customAge: toFixed(d.age, 1) ?? "N/A",
  }));

  return {
    x: data.map((d) => d.x),
    y: data.map((d) => d.y),
    mode: "markers",
    type: "scattergl",
    customdata,
    hovertemplate,
  };
}

function createSearchQueryFilter(searchQueries) {
  return ({ sample, idatFilename }) =>
    (sample && searchQueries.some((query) => sample.toLowerCase().includes(query))) ||
    (idatFilename && searchQueries.some((query) => idatFilename.toLowerCase().includes(query)));
}

export function getWeeklyAnnotations(data) {
  const weeklyThreshold = Date.now() - 1000 * 60 * 60 * 24 * 10;
  const isWeeklyAnnotation = (d) =>
    d.batchDate && new Date(d.batchDate).getTime() > weeklyThreshold && d.samplePlate === "Clinical Testing";
  const weeklyAnnotations = data.filter(isWeeklyAnnotation).map((value) => ({
    text: value.sample,
    x: value.x,
    y: value.y,
    showarrow: true,
  }));
  return weeklyAnnotations;
}

export function getSearchAnnotations(data, searchQueries) {
  return searchQueries.length
    ? data.filter(createSearchQueryFilter(searchQueries)).map((e) => ({
        text: e.sample || e.idatFilename,
        x: e.x,
        y: e.y,
      }))
    : [];
}
