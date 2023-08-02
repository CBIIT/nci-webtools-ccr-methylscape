import { atom, selector } from "recoil";
import axios from "axios";

export const defaultState = {
  submissions: [],
};

export const formState = atom({
  key: "submissions.form",
  default: {},
});

export const submissionsState = selector({
  key: "submissions.state",
  get: async () => {
    return defaultState;
  },
});
