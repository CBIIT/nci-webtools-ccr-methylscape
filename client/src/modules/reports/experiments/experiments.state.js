import { atom, selector } from "recoil";
import { methylscapeData } from "../data.state";

export const experimentsTableFilters = atom({
  key: "experimentsTableFilters",
  default: {},
});

export const experimentsTableData = selector({
  key: "experimentsTableData",
  get: ({ get }) => {
    const { experimentData } = get(methylscapeData);
    if (!experimentData.length) return [];
    return Object.values(experimentData);
  },
});
