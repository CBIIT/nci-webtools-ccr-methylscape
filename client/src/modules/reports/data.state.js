import { atom, selector } from "recoil";
import axios from "axios";

export const defaultDataState = {
  data: [],
  experimentData: [],
  sampleData: [],
  projectsCount: 0,
  experimentsCount: 0,
  samplesCount: 0,
};

export const dataState = atom({ key: "appState", default: defaultDataState });

export const methylscapeData = selector({
  key: "methylscapeData",
  get: async (_) => {
    try {
      const newResponse = await axios.get("/api/analysis/allproject");
      const experimentRes = await axios.get("/api/analysis/experiment");
      const sampleRes = await axios.post("/api/analysis/samples", {
        conditions: [["unifiedSamplePlate", "!=", "null"]],
      });
      const unifiedproject = await axios.get("/api/analysis/unifiedproject");
      const data = newResponse.data;
      const experimentData = experimentRes.data;
      const sampleData = sampleRes.data;
      const unifiedprojectData = unifiedproject.data;
      var dict = new Object();
      for (let i = 0; i < unifiedprojectData.length; i++) {
        let item = unifiedprojectData[i];
        if (!(item.unifiedSamplePlate in dict)) {
          dict[item.unifiedSamplePlate] = max(unifiedprojectData, item.unifiedSamplePlate);
        }
      }
      for (let i = 0; i < data.length; i++) {
        const obj = data[i];
        const cp = obj.investigators;
        obj.project = dict[obj.unifiedSamplePlate];
        if (cp != null && cp.includes(",")) {
          obj.priInvestigators = cp.split(",")[0];
          obj.multiInvestigator = true;
          obj.numberOfOthers = cp.split(",").length - 1;
        } else {
          obj.priInvestigators = cp;
          obj.multiInvestigator = false;
          obj.numberOfOthers = 0;
        }

        data[i] = obj;
      }

      for (let i = 0; i < experimentData.length; i++) {
        const obj = experimentData[i];
        obj.project = dict[obj.unifiedSamplePlate];
        experimentData[i] = obj;
      }

      const projectsCount = data.length; //[...new Set(data.filter(({ project }) => project).map(({ project }) => project))].length;
      const experimentsCount = experimentData.length;
      const samplesCount = sampleData.length;
      data.map((sample) => {
        const cp = sample.investigators;
        if (cp != null && cp.includes(",")) {
          return {
            ...sample,
            priInvestigators: cp.split(",")[0],
            multiInvestigator: true,
          };
        } else if (cp != null) {
          return {
            ...sample,
            priInvestigators: cp,
            multiInvestigator: false,
          };
        } else {
          return {
            ...sample,
            priInvestigators: "N/A",
            multiInvestigator: false,
          };
        }
      });
      return {
        data,
        experimentData,
        sampleData,
        projectsCount,
        experimentsCount,
        samplesCount,
      };
    } catch (err) {
      console.log(err);
      return defaultDataState;
    }
  },
});

function max(list, maxItem) {
  let tmpItem = list[0];
  let count = 0;
  for (let j = 0; j < list.length; j++) {
    let newitem = list[j];
    if (parseInt(newitem.samplecount) > count && newitem.unifiedSamplePlate == maxItem) {
      count = parseInt(newitem.samplecount);
      tmpItem = newitem;
    }
  }
  return tmpItem.project;
}

function round(value) {
  var multiplier = Math.pow(10, 1 || 0);
  return Math.round(value * multiplier) / multiplier;
}
