import { atom, selector } from "recoil";
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
