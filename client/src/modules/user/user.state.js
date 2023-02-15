import { atom, selector } from "recoil";
import axios from "axios";

export const formState = atom({
  key: "userRegistration.form",
  default: {
    accountType: "NIH",
    firstName: "",
    lastName: "",
    email: "",
    organizationId: "",
    organizationOther: "",
  },
});

export const organizationsSelector = selector({
  key: "user.organizations",
  get: async ({ get }) => {
    try {
      const response = await axios.get("/api/organizations");
      const data = response.data;
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  },
});
