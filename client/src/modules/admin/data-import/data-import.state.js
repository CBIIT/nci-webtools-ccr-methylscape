import axios from "axios";
import { selector } from "recoil";

export const importLogSelector = selector({
  key: "importLogSelector",
  get: async () => {
    const response = await axios.get("/api/admin/importLogs");
    return response.data;
  },
});
