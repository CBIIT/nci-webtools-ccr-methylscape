import { selector, selectorFamily } from "recoil";
import axios from "axios";

export const submissionsSelector = selector({
  key: "submissions.list",
  get: async ({ get }) => {
    try {
      const response = await axios.get(`/api/submissions`);
      const data = response.data;
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  },
});

export const submissionSelector = selectorFamily({
  key: "submissions.submission",
  get:
    (submissionId) =>
    async ({ get }) => {
      try {
        const response = await axios.get(`/api/submissions/`, { params: { id: submissionId } });
        const data = response.data;
        return data;
      } catch (err) {
        console.log(err);
        return [];
      }
    },
});

export const detailsSelector = selectorFamily({
  key: "submissions.details",
  get:
    (submissionsId) =>
    async ({ get }) => {
      try {
        const response = await axios.get(`/api/submissions/sample/${submissionsId}`);
        const data = response.data;
        return data;
      } catch (err) {
        console.log(err);
        return [];
      }
    },
});
