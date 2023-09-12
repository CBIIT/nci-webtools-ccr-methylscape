import { atom, selector, selectorFamily } from "recoil";
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

export const submissionDetailsColumns = [
  { accessor: "sample", Header: "Sample Name", show: true },
  { accessor: "sampleWell", Header: "Sample Well", show: false },
  { accessor: "samplePlate", Header: "Sample Plate", show: false },
  { accessor: "sampleGroup", Header: "Sample Group", show: false },
  { accessor: "poolId", Header: "Pool ID", show: true },
  { accessor: "sentrixId", Header: "Sentrix ID", show: true },
  { accessor: "sentrixPosition", Header: "Sentrix Position", show: true },
  { accessor: "materialType", Header: "Material Type", show: false },
  { accessor: "sex", Header: "Sex", show: false },
  { accessor: "surgeryCase", Header: "Surgery Case", show: true },
  { accessor: "diagnosis", Header: "Provided Diagnosis", show: false },
  { accessor: "age", Header: "Age", show: false },
  { accessor: "notes", Header: "Notes", show: true },
  { accessor: "tumorSite", Header: "Tumor Site", show: false },
  { accessor: "piCollaborator", Header: "PI Collaborator", show: true },
  { accessor: "outsideId", Header: "Outside ID", show: true },
  { accessor: "surgeryDate", Header: "Surgery Date", show: false },
  { accessor: "projectName", Header: "Project Name", show: false },
  { accessor: "experimentName", Header: "Experiment Name", show: true },
];

export const defaultSubmissionDetailsTableState = {
  hiddenColumns: submissionDetailsColumns.filter((c) => c.show === false).map((c) => c.accessor),
  filters: [],
  sortBy: [{ id: "surgeryDate", desc: true }],
  pageSize: 25,
  pageIndex: 0,
};

export const submissionDetailsTableState = atom({
  key: "samplesTableState",
  default: defaultSubmissionDetailsTableState,
});
