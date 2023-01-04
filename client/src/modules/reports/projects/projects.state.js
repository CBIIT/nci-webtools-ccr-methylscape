import { atom, selector } from "recoil";
import groupBy from "lodash/groupBy.js";
import { methylscapeData } from "../data.state";

export const defaultProjectState = {
  selectedProject: "",
};

export const projectState = atom({
  key: "projectState",
  default: defaultProjectState,
});

export const projectsTableData = selector({
  key: "projectsTableData",
  get: ({ get }) => {
    const { data } = get(methylscapeData);

    if (!data.length) return [];

    return Object.values(data);
  },
});

export const selectedRow = selector({
  key: "selectedProject",
  get: ({ get }) => {
    const { selectedProject } = get(projectState);
    if (!selectedProject) return false;

    let { sampleData } = get(methylscapeData);
    let data = sampleData.filter(({ unifiedSamplePlate }) => unifiedSamplePlate == selectedProject);

    const getMethylationClasses = (key = "CNSv12b6_subclass1") =>
      Object.entries(groupBy(data, key)).map((group) => [group[0], group[1].length]);

    const getGender = () => {
      let cur = {};
      let pieData = [];
      data.forEach((row) => {
        cur[row.sex] = cur[row.sex] + 1 || 1;
      });
      Object.keys(cur).forEach((k) => {
        pieData.push([k, cur[k]]);
        //pieData[0].push(k);
        //pieData[1].push(cur[k]);
      });
      return pieData;
    };

    const getAgeDistribution = () => {
      let cur = {};
      let pieData = [];
      data.forEach((row) => {
        cur[row.age] = cur[row.age] + 1 || 1;
      });
      Object.keys(cur).forEach((k) => {
        pieData.push([k, cur[k]]);
      });
      return pieData;
    };

    const methylationClasses = getMethylationClasses();
    const gender = getGender();
    const ageDistribution = getAgeDistribution();

    console.log({ methylationClasses, gender });

    return { selectedProject, methylationClasses, gender, ageDistribution };
  },
});
