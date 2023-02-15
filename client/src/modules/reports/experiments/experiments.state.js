import { atom, selector } from "recoil";
import { methylscapeData } from "../data.state";

export const defaultexperimentsTableState = {
  filters: [],
  sortBy: [{ id: "experimentdate", desc: true }],
  pageSize: 25,
  pageIndex: 0,
};

export const experimentsTableState = atom({
  key: "experimentsTableState",
  default: defaultexperimentsTableState,
});

export const experimentsTableData = selector({
  key: "experimentsTableData",
  get: ({ get }) => {
    const { experimentData } = get(methylscapeData);
    if (!experimentData.length) return [];
    return Object.values(experimentData);
  },
});
