import { atom, selector } from "recoil";
import { query } from "../../../services/query";
import groupBy from "lodash/groupBy";
import meanBy from "lodash/meanBy";

export const defaultFormState = {
  organSystem: "centralNervousSystem",
  embedding: "umap",
  search: "",
  showAnnotations: true,
};

export const formState = atom({
  key: "metadataPlot.formState",
  default: defaultFormState,
});

export const defaultPlotState = {
  data: [],
  layout: {},
  config: {},
};

export const plotState = selector({
  key: "metadataPlot.plotState",
  get: async ({ get }) => {
    const { organSystem, embedding, search, showAnnotations } = get(formState);

    if (!organSystem || !embedding) return defaultPlotState;

    let { records: data } = await query("api/query", {
      table: "annotation",
      _organSystem: organSystem,
      _embedding: embedding,
      limit: -1,
      columns: ["organSystem", "embedding", "class", "label", "x", "y"],
    });

    if (search && search.length) {
      data = data.filter(r => 
        r.class?.toLowerCase().includes(search.toLowerCase()) || 
        r.label?.toLowerCase().includes(search.toLowerCase()))
    }

    const useWebGl = data.length > 1000;
    const dataGroupedByClass = Object.entries(groupBy(data, e => e.class));
    const dataGroupedByLabel = Object.entries(groupBy(data, e => e.label));

    // use mean x/y values for annotation positions
    const labelAnnotations = dataGroupedByLabel
      .filter(([name, value]) => !['null', 'undefined', ''].includes(String(name)))
      .map(([name, value]) => ({
        text: name, 
        x: meanBy(value, e => e.x),
        y: meanBy(value, e => e.y)
      }));
  
    const classAnnotations = dataGroupedByClass
      .filter(([name, value]) => !['null', 'undefined', ''].includes(String(name)))
      .map(([name, value]) => ({
        text: name, 
        x: meanBy(value, e => e.x),
        y: meanBy(value, e => e.y),
        showarrow: false,
      }));
  
    // transform data to traces
    const dataTraces = dataGroupedByClass
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, data]) => ({
        name,
        x: data.map(e => e.x),
        y: data.map(e => e.y),
        customdata: data.map(e => ({
          class: e.class || '',
          label: e.label || '',
        })),
        mode: "markers",
        hovertemplate: 'Class: %{customdata.class}<extra></extra>',
        type: useWebGl ? "scattergl" : "scatter",
      }));

    // try using webgl to display calss annotations to improve performance
    const classAnnotationTrace = dataGroupedByClass
      .filter(([name, value]) => !['null', 'undefined', ''].includes(String(name)))
      .map(([name, value]) => ({
        text: name, 
        x: meanBy(value, e => e.x),
        y: meanBy(value, e => e.y),
      }))
      .reduce((acc, curr) => {
        acc.x.push(curr.x);
        acc.y.push(curr.y);
        acc.text.push(curr.text);
        return acc;
      }, {
        x: [],
        y: [],
        text: [],
        mode: "text",
        type: useWebGl ? "scattergl" : "scatter",
        textfont: {
          size: 10
        }
      });

    // set layout
    const layout = {
      title: `${organSystem} (n=${data.length})`,
      xaxis: {
        title: `${embedding}_x`,
      },
      yaxis: {
        title: `${embedding}_y`,
      },
      annotations: showAnnotations ? [
        ...labelAnnotations, 
        ...classAnnotations
      ] : [],
      uirevision: organSystem + embedding + search,
    };

    const config = {
      scrollZoom: true
    };

    return { 
      data: [
        ...dataTraces,
        // classAnnotationTrace,
      ], 
      layout, 
      config 
    };
  },
});