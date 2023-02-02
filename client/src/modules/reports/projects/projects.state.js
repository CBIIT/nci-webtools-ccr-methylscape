import { atom, selector } from "recoil";
import { methylscapeData } from "../data.state";

export const defaultProjectState = {
  selectedProject: "",
};

export const projectState = atom({
  key: "projectState",
  default: defaultProjectState,
});

export const projectsTableData = selector({
  key: "projectsTableData",
  get: ({ get }) => {
    const { data } = get(methylscapeData);
    if (!data.length) return [];
    return Object.values(data);
  },
});

export const defaultProjectsTableState = {
  filters: [],
  sortBy: [{ id: "project" }],
  pageSize: 25,
  pageIndex: 0,
};

export const projectsTableState = atom({
  key: "projectsTableState",
  default: defaultProjectsTableState,
});

export const projectsTableFilters = atom({
  key: "projectsTableFilters",
  default: {},
});

export const selectedRow = selector({
  key: "selectedProject",
  get: ({ get }) => {
    const { selectedProject } = get(projectState);
    const { sampleData } = get(methylscapeData);
    const data = sampleData.filter(
      ({ unifiedSamplePlate }) => !selectedProject || unifiedSamplePlate === selectedProject
    );
    return { selectedProject, data };
  },
});
