import { atom, selector } from "recoil";
import axios from "axios";
import { mean, uniq } from "lodash";
const chrLines = require("./lines.json");

function getRange(array) {
  let min = array[0];
  let max = array[0];
  for (let item of array) {
    if (item < min) min = item;
    if (item > max) max = item;
  }
  return [min, max];
}

function createScale(inputRange, outputRange, clamp = false) {
  return function (value) {
    const [min, max] = inputRange;
    const [outMin, outMax] = outputRange;
    const scale = (value - min) / (max - min);
    const scaledValue = outMin + (outMax - outMin) * scale;
    return clamp ? Math.max(outMin, Math.min(outMax, scaledValue)) : scaledValue;
  };
}

function getStandardDeviation(values) {
  const avg = mean(values);
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

function filterByStandardDeviation(values, key, threshold) {
  const keyValues = values.map((v) => v[key]);
  const avgValue = mean(keyValues);
  const standardDeviation = getStandardDeviation(keyValues);
  const minValue = avgValue - standardDeviation * threshold;
  const maxValue = avgValue + standardDeviation * threshold;
  return values.filter((v) => v[key] > minValue && v[key] < maxValue);
}

export const defaultPreFormState = {
  significant: true,
};

export const preFormState = atom({
  key: "copynumber.preFormState",
  default: defaultPreFormState,
});

export const defaultFormState = {
  annotations: false,
  search: [],
};

export const formState = atom({
  key: "copynumber.formState",
  default: defaultFormState,
});

export const defaultSelectSample = {
  idatFilename: "",
  sample: "",
};

export const selectSampleState = atom({
  key: "selectSampleState",
  default: defaultSelectSample,
});

export const geneSelector = selector({
  key: "copyNumber.geneSelector",
  get: async () => {
    const response = await axios.get("/api/analysis/genes");
    return uniq(
      response.data
        .map((g) => g.gene?.split(";"))
        .flat()
        .sort()
        .filter(Boolean)
    );
  },
  default: [],
});

export const geneOptionsSelector = selector({
  key: "copyNumber.geneOptionsSelector",
  get: async ({ get }) => {
    const genes = await get(geneSelector);
    return genes.map((name) => ({ value: name, label: name }));
  },
});

export const defaultPlotState = {
  data: [],
  layout: {},
  config: {},
};

export const copyNumberPlotDataSelector = selector({
  key: "copyNumber.copyNumberPlotDataSelector",
  get: async ({ get }) => {
    const { idatFilename, sample } = get(selectSampleState);

    if (!idatFilename) return false;
    try {
      const segmentsResponse = await axios.get("/api/analysis/cnv/segments", {
        params: { idatFilename },
      });
      const binsResponse = await axios.get("/api/analysis/cnv/bins", {
        params: { idatFilename },
      });
      let binGeneMap = {};

      // map bins to each gene
      for (let bin of binsResponse.data) {
        for (let gene of bin.gene) {
          if (!binGeneMap[gene]) {
            binGeneMap[gene] = [];
          }
          binGeneMap[gene].push(bin);
        }
      }

      return {
        sample,
        idatFilename,
        segments: segmentsResponse.data,
        bins: binsResponse.data,
        binGeneMap,
      };
    } catch (error) {
      console.log(error);
      return { error };
    }
  },
});

export const plotState = selector({
  key: "cnPlotState",
  get: async ({ get }) => {
    const { error, ...cnData } = get(copyNumberPlotDataSelector);

    if (!Object.keys(cnData).length) return defaultFormState;
    if (error) return defaultPlotState.error;

    let { annotations, search } = get(formState);
    let { sample, idatFilename, segments, bins, binGeneMap } = cnData;

    bins = filterByStandardDeviation(bins, "medianValue", 4);
    segments = filterByStandardDeviation(segments, "medianValue", 4);

    // determine x coordinates for each bin
    const xOffsets = [0, ...chrLines.map((c) => c["pos.start"])];
    const xCoordinates = bins.map((bin) => {
      const offset = xOffsets[bin.chromosome];
      const midpoint = (bin.start + bin.end) / 2;
      return offset + midpoint;
    });

    // determine y coordinates for each bin
    const yCoordinates = bins.map((bin) => bin.medianValue);
    let [yMin, yMax] = getRange(yCoordinates);
    const yAbsMax = Math.max(Math.abs(yMin), Math.abs(yMax));
    const yClamped = yAbsMax * 0.2; // approximates the majority of points
    const colorScale = createScale([-yAbsMax, yAbsMax], [0, 1], true);
    const yRange = Math.max(1.2, yClamped);
    const yRangeValues = [-yRange, yRange];
    [yMin, yMax] = yRangeValues;

    // determine top points
    const sortedBins = [...bins].sort((a, b) => a.medianValue - b.medianValue);
    const topCount = Math.ceil(bins.length / 500); // top 0.5%
    const topBins = [...sortedBins.slice(0, topCount), ...sortedBins.slice(-topCount)];

    const data = [
      {
        x: xCoordinates,
        y: yCoordinates,
        customdata: bins,
        text: bins.map((bin) =>
          [
            `Genes: ${bin.gene[0] || "N/A"} ${bin.gene.length > 1 ? ` + ${bin.gene.length - 1}` : ""}`,
            `Chromosome: ${bin.chromosome}`,
            `Log<sub>2</sub>ratio: ${bin.medianValue.toFixed(2)}`,
          ].join("<br>")
        ),
        hovertemplate: "%{text}<extra></extra>",
        mode: "markers",
        type: "scattergl",
        marker: {
          color: yCoordinates.map(colorScale),
          colorscale: [
            [0, "rgb(255, 0, 0)"],
            [0.5, "rgb(180, 180, 180)"],
            [1, "rgb(0, 255, 0)"],
          ],
        },
      },
    ];

    const binAnnotations = annotations
      ? topBins.map((bin) => ({
          text: `${bin.gene[0] || "No Gene"} ${bin.gene.length > 1 ? `+ ${bin.gene.length - 1}` : ""}`,
          x: xOffsets[bin.chromosome] + bin.start,
          y: bin.medianValue,
        }))
      : [];

    const searchAnnotations = (search || [])
      .map((search) => search.value)
      .map((query) => (binGeneMap[query] || []).map((e) => ({ ...e, query })))
      .flat()
      .map((bin) => ({
        text: bin.query,
        x: xOffsets[bin.chromosome] + bin.start,
        y: bin.medianValue,
      }));

    const bufferMargin = 0.1;
    const layout = {
      uirevision: idatFilename + annotations + search,
      title: [sample, idatFilename].filter(Boolean).join(" - "),
      showlegend: false,
      dragmode: "pan",
      xaxis: {
        title: "Chromosome",
        showgrid: false,
        showline: true,
        tickmode: "array",
        tickvals: chrLines.map(({ center }) => center),
        ticktext: chrLines.map(({ chr }) => chr),
        tickangle: 0,
      },
      yaxis: {
        title: "log<sub>2</sub> ratio",
        zeroline: true,
        // zerolinecolor: '#eee',
        dtick: 0.25,
        ticks: "outside",
        range: yRangeValues,
      },
      annotations: [...binAnnotations, ...searchAnnotations],
      shapes: [
        // chromosome dividers
        ...chrLines.map((e) => ({
          type: "line",
          x0: e["pos.start"],
          x1: e["pos.start"],
          y0: yMin - bufferMargin,
          y1: yMax + bufferMargin,
          line: { width: 1 },
        })),
        // chromosome segment divider
        ...chrLines.map((e) => ({
          type: "line",
          x0: e["pq"],
          x1: e["pq"],
          y0: yMin - bufferMargin,
          y1: yMax + bufferMargin,
          line: { dash: "dot", width: 1 },
        })),
        // chromosome segments
        ...segments.map((e) => ({
          type: "line",
          x0: xOffsets[e.chromosome] + e.start,
          x1: xOffsets[e.chromosome] + e.end,
          y0: e.medianValue,
          y1: e.medianValue,
        })),
        // y-axis zero line
        {
          type: "line",
          y0: 0,
          y1: 0,
          line: { dash: "dot" },
        },
      ],
      autosize: true,
    };

    const config = { scrollZoom: true };

    return {
      data,
      config,
      layout,
    };

    /*

    const { significant } = get(preFormState);
    const { annotations, search } = get(formState);
    const { data, idatFilename, sample } = intermediateData;
    const { bins, segments, binPosOffset, yMin, yMax, significantRange } = data;

    // group bins by chromosome
    const dataGroupedByChr = Object.entries(
      groupBy(
        bins.map(
          ({ position, log2ratio, chr, genes, Start, End, Chromosome }) => ({
            position: position + binPosOffset[chr],
            chr,
            log2ratio,
            genes,
            chromosome: Chromosome,
            start: Start,
            end: End,
            hovertemplate: `${
              genes.length
                ? `Genes: ${genes[0]}${
                    genes.length > 1 ? ` + ${genes.length - 1}` : ''
                  }<br>`
                : ''
            }Chromosome: ${Chromosome}<br>log<sub>2</sub>ratio: ${log2ratio}<extra></extra>`,
          })
        ),
        (e) => e.chr
      )
    );

    // create annotation trace of bins by search query
    const searchQueries = search.map(({ value }) => value.toLowerCase());
    const searchAnnotations = searchQueries.length
      ? bins
          .filter(({ genes }) =>
            genes.some((gene) =>
              searchQueries.find((query) => gene.toLowerCase().includes(query))
            )
          )
          .map((e) => ({
            text: e.genes.find((gene) =>
              searchQueries.find((query) => gene.toLowerCase().includes(query))
            ),
            x: e.position + binPosOffset[e.chr],
            y: e.log2ratio,
          }))
      : [];

    const allAnnotations = annotations
      ? bins
          .filter((e) => e.genes.length)
          .map((e) => ({
            text: e.genes[0],
            x: e.position + binPosOffset[e.chr],
            y: e.log2ratio,
          }))
      : [];
    // hsl hue - degress of a color wheel
    // const getHue = (i) => {
    //   if (i > 7) return 45 * (i % 8);
    //   else return 45 * i;
    // };

    const colorMinMax =
      (Math.abs(yMin) > yMax ? Math.abs(yMin) : yMax) * significantRange;

    // transform data to traces
    const dataTraces = dataGroupedByChr
      .sort(([chrA], [chrB]) => parseInt(chrA) - parseInt(chrB))
      .map(([chr, data], i) => ({
        chr,
        x: data.map((e) => e.position),
        y: data.map((e) => e.log2ratio),
        customdata: data.map(({ genes, chromosome, start, end }) => ({
          genes,
          chromosome,
          start,
          end,
        })),
        mode: 'markers',
        type: 'scattergl',
        hovertemplate: data.map((e) => e.hovertemplate),
        marker: {
          color: data.map((e) => e.log2ratio),
          // colorscale: [
          //   ['0.0', `hsl(${getHue(i)}, 100%, 40%)`],
          //   ['0.25', `hsl(${getHue(i)}, 100%, 60%)`],
          //   ['0.5', `hsl(${getHue(i)}, 50%, 90%)`],
          //   ['0.75', `hsl(${getHue(i)}, 100%, 60%)`],
          //   ['1.0', `hsl(${getHue(i)}, 100%, 40%)`],
          // ],
          cmax: colorMinMax,
          cmid: 0,
          cmin: colorMinMax * -1,
        },
      }));

    const bufferMargin = 0.25;

    const layout = {
      uirevision: idatFilename + annotations + search + significant,
      title: `${sample} (${idatFilename})`,
      showlegend: false,
      dragmode: 'pan',
      xaxis: {
        title: 'Chromosome',
        showgrid: false,
        showline: true,
        tickmode: 'array',
        tickvals: chrLines.map(({ center }) => center),
        ticktext: chrLines.map(({ chr }) => chr),
        tickangle: 0,
      },
      yaxis: {
        title: 'log<sub>2</sub> ratio',
        zeroline: true,
        // zerolinecolor: '#eee',
        dtick: 0.25,
        ticks: 'outside',
        fixedrange: true,
      },
      annotations: [...allAnnotations, ...searchAnnotations],
      shapes: [
        // chromosome dividers
        ...chrLines.map((e) => ({
          type: 'line',
          x0: e['pos.start'],
          x1: e['pos.start'],
          y0: yMin - bufferMargin,
          y1: yMax + bufferMargin,
          line: { width: 1 },
        })),
        // chromosome segment divider
        ...chrLines.map((e) => ({
          type: 'line',
          x0: e['pq'],
          x1: e['pq'],
          y0: yMin - bufferMargin,
          y1: yMax + bufferMargin,
          line: { dash: 'dot', width: 1 },
        })),
        // chromosome segments
        ...segments.map((e) => ({
          type: 'line',
          x0: e['x1'],
          x1: e['x2'],
          y0: e['medianLog2Ratio'],
          y1: e['medianLog2Ratio'],
        })),
        // y-axis zero line
        {
          type: 'line',
          y0: 0,
          y1: 0,
          line: { dash: 'dot' },
        },
      ],
      autosize: true,
    };
    const config = { scrollZoom: true };


    return {
      data: dataTraces,
      config,
      layout,
    };
    */
  },
});
