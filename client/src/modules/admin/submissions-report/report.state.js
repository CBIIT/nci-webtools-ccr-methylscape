import { atom, selectorFamily } from "recoil";
import axios from "axios";

export const reportSelector = selectorFamily({
  key: "submissions.submission",
  get:
    (type) =>
    async ({ get }) => {
      try {
        const { data } = await axios.get(`/api/submissions/report/${type}`);
        return data;
      } catch (err) {
        console.log(err);
        return [];
      }
    },
});

export const submissionsReportColumns = [{ accessor: "submissionsCount", Header: "Submissions", show: true }];

export const defaultReportTableState = {
  hiddenColumns: submissionsReportColumns.filter((c) => c.show === false).map((c) => c.accessor),
  filters: [],
  sortBy: [{ id: "submissionsCount", desc: true }],
  pageSize: 100,
  pageIndex: 0,
};

export const submissionReportTableState = atom({
  key: "submissionsReportTableState",
  default: defaultReportTableState,
});
