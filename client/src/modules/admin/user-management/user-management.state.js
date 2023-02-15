import { atom, selector } from "recoil";
import axios from "axios";

export const usersSelector = selector({
  key: "userManagement.usersSelector",
  get: async ({ get }) => {
    try {
      const response = await axios.get("/api/users");
      const data = response.data;
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  },
});

export const rolesSelector = selector({
  key: "userManagement.rolesSelector",
  get: async ({ get }) => {
    try {
      const response = await axios.get("/api/roles");
      const data = response.data;
      return data;
    } catch (err) {
      console.log(err);
      return [];
    }
  },
});

export const activeUser = atom({
  key: "userManagement.activeUser",
  default: {},
});

export const organizationsSelector = selector({
  key: "userManagement.organizations",
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
