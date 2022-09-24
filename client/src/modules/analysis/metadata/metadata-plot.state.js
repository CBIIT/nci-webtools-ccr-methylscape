import { atom, selector } from "recoil";
import { getMetadataPlot, getSampleCoordinates } from "./metadata-plot.utils";

export const defaultFormState = {
  organSystem: "centralNervousSystem",
  embedding: "umap",
  search: [],
  showAnnotations: true,
  color: "nciMetric",
};

export const formState = atom({
  key: "metadataPlot.formState",
  default: defaultFormState,
});

export const defaultSelectedPoints = {
  points: [[]],
  selectedGroup: 0,
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

export const sampleCoordinatesState = selector({
  key: "metadataPlot.sampleCoordinates",
  get: async ({ get }) => await getSampleCoordinates(get(formState)),
});

export const plotState = selector({
  key: "metadataPlot.plotState",
  get: async ({ get }) => await getMetadataPlot(get(formState), get(sampleCoordinatesState)),
});
