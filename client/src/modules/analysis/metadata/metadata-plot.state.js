import { atom, selector } from "recoil";
import { getMetadataPlot, getSampleCoordinates } from "./metadata-plot.utils";
import { sessionState } from "../../session/session.state";

export const defaultFormState = {
  organSystem: "centralNervousSystem",
  embedding: "umap",
  search: [],
  showAnnotations: false,
  color: "nciMetric",
};

export const formState = atom({
  key: "metadataPlot.formState",
  default: selector({
    key: "sessionDefaultOrganSystem",
    get: async ({ get }) => {
      const { user } = get(sessionState);
      const organSystem = user?.organizationOrganSystem.length
        ? user.organizationOrganSystem[0].value
        : defaultFormState.organSystem;
      return { ...defaultFormState, organSystem };
    },
  }),
});

export const defaultSelectedPoints = {
  groups: [],
  // points: [[]],
  // tableConfig: [{}],
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
