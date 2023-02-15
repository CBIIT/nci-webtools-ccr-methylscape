import { atom } from "recoil";

export const defaultState = {
  currentTab: "",
};

export const analysisState = atom({
  key: "analysisState",
  default: defaultState,
});
