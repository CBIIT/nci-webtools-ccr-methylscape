import { atom, selector } from "recoil";
import { methylscapeData } from "../data.state";

export const samplesTableFilters = atom({
  key: "samplesTableFilters",
  default: {},
});

export const samplesTableData = selector({
  key: "samplesTableData",
  get: ({ get }) => {
    const { sampleData } = get(methylscapeData);
    if (!sampleData.length) return [];
    return sampleData;
  },
});
