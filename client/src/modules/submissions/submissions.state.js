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

export const detailsSelector = selectorFamily({
  key: "submissions.details",
  get:
    (submissionsId) =>
    async ({ get }) => {
      try {
        const response = await axios.get(`/api/userSamples/${submissionsId}`);
        const data = response.data;
        return data;
      } catch (err) {
        console.log(err);
        return [];
      }
    },
});
