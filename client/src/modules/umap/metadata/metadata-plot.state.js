import { atom, selector } from 'recoil';
import { query } from '../../../services/query';
import groupBy from 'lodash/groupBy';
import meanBy from 'lodash/meanBy';
import colors from './colors.json';

export const defaultFormState = {
  organSystem: 'centralNervousSystem',
  embedding: 'umap',
  search: [],
  showAnnotations: true,
  methylClass: '',
};

export const formState = atom({
  key: 'metadataPlot.formState',
  default: defaultFormState,
});

export const defaultPlotState = {
  data: [],
  layout: {},
  config: {},
};

export const plotState = selector({
  key: 'metadataPlot.plotState',
  get: async ({ get }) => {
    const { organSystem, embedding, search, showAnnotations, methylClass } =
      get(formState);

    if (!organSystem || !embedding) return defaultPlotState;

    let { records: data } = await query('api/query', {
      table: 'annotation',
      _organSystem: organSystem,
      _embedding: embedding,
      limit: -1,
      columns: [
        'organSystem',
        'embedding',
        'class',
        'label',
        'x',
        'y',
        'idatFile',
        'sample',
        'os_months',
        'os_status',
      ],
    });

    // filter plot by search if show annotations is toggled false
    const searchQueries = search.map(({ value }) => value.toLowerCase());
    // if (!showAnnotations && searchQueries.length) {
    //   data = data.filter(
    //     ({ sample, idatFile }) =>
    //       (sample &&
    //         searchQueries.some((query) =>
    //           sample.toLowerCase().includes(query)
    //         )) ||
    //       (idatFile &&
    //         searchQueries.some((query) =>
    //           idatFile.toLowerCase().includes(query)
    //         ))
    //   );
    // }

    const useWebGl = data.length > 1000;
    const dataGroupedByClass = Object.entries(groupBy(data, (e) => e.class));
    const dataGroupedByLabel = Object.entries(groupBy(data, (e) => e.label));

    // use mean x/y values for annotation positions
    const labelAnnotations = dataGroupedByLabel
      .filter(
        ([name, value]) => !['null', 'undefined', ''].includes(String(name))
      )
      .map(([name, value]) => ({
        text: name,
        x: meanBy(value, (e) => e.x),
        y: meanBy(value, (e) => e.y),
        showarrow: false,
      }));

    const classAnnotations = dataGroupedByClass
      .filter(
        ([name, value]) => !['null', 'undefined', ''].includes(String(name))
      )
      .map(([name, value]) => ({
        text: name,
        x: meanBy(value, (e) => e.x),
        y: meanBy(value, (e) => e.y),
        showarrow: false,
      }));

    // add annotations from search filter
    const sampleAnnotations = searchQueries.length
      ? data
          .filter(
            ({ sample, idatFile }) =>
              (sample &&
                searchQueries.some((query) =>
                  sample.toLowerCase().includes(query)
                )) ||
              (idatFile &&
                searchQueries.some((query) =>
                  idatFile.toLowerCase().includes(query)
                ))
          )
          .map((e) => ({
            text: e.sample || e.idatFile,
            x: e.x,
            y: e.y,
            // showarrow: false,
          }))
      : [];

    // transform data to traces
    const dataTraces = dataGroupedByClass
      .sort((a, b) =>
        a[0] == 'No_match'
          ? -1
          : b[0] == 'No_match'
          ? 1
          : a[0].localeCompare(b[0])
      )
      .map(([name, data]) => ({
        name,
        x: data.map((e) => e.x),
        y: data.map((e) => e.y),
        customdata: data.map((e) => ({
          sample: e.sample || '',
          class: e.class || '',
          label: e.label || '',
          idatFile: e.idatFile,
          os_months: e.os_months ? Math.round(e.os_months) : null,
          os_status: e.os_status,
        })),
        mode: 'markers',
        hovertemplate: 'Sample: %{customdata.sample}<extra></extra>',
        type: useWebGl ? 'scattergl' : 'scatter',
        marker: {
          color: '%{customdata.class}',
        },
      }));

    // try using webgl to display calss annotations to improve performance
    const classAnnotationTrace = dataGroupedByClass
      .filter(
        ([name, value]) => !['null', 'undefined', ''].includes(String(name))
      )
      .map(([name, value]) => ({
        text: name,
        x: meanBy(value, (e) => e.x),
        y: meanBy(value, (e) => e.y),
      }))
      .reduce(
        (acc, curr) => {
          acc.x.push(curr.x);
          acc.y.push(curr.y);
          acc.text.push(curr.text);
          return acc;
        },
        {
          x: [],
          y: [],
          text: [],
          mode: 'text',
          type: useWebGl ? 'scattergl' : 'scatter',
          textfont: {
            size: 10,
          },
        }
      );

    function plotTitle(organSystem) {
      if (organSystem == 'centralNervousSystem')
        return 'Central Nervous System';
      if (organSystem == 'centralNervousSystemSarcoma') return 'CNS Sarcoma';
      if (organSystem == 'boneAndSoftTissue') return 'Bone and Soft Tissue';
      if (organSystem == 'hematopoietic') return 'Hematopoietic';
    }

    // set layout
    const layout = {
      title: `${plotTitle(organSystem)} (n=${data.length})`,
      xaxis: {
        title: `${embedding}_x`,
      },
      yaxis: {
        title: `${embedding}_y`,
      },
      annotations: showAnnotations
        ? [
            ...labelAnnotations,
            ...sampleAnnotations,
            // ...classAnnotations
          ]
        : [...sampleAnnotations],
      uirevision: organSystem + embedding + search + showAnnotations,
      legend: { title: { text: 'Methylation Class' } },
      colorway: colors,
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