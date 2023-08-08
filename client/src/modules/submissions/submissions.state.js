import { atom, selector } from "recoil";
import axios from "axios";

export const defaultFormState = {};

export const formState = atom({
  key: "submissions.form",
  default: defaultFormState,
});

export const defaultState = {
  submissions: [],
};

export const submissionsState = selector({
  key: "submissions.state",
  get: async () => {
    return defaultState;
  },
});
