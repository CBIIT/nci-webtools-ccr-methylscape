import { atom, selector } from "recoil";
import axios from "axios";
import { selectedPoints } from "../metadata/metadata-plot.state";
import pick from "lodash/pick";
import isNumber from "lodash/isNumber";

export const defaultTableForm = {
  group: 0,
};

export const tableForm = atom({
  key: "umapTableForm",
  default: defaultTableForm,
});

export const tableData = selector({
  key: "umapSelectedTable",
  get: ({ get }) => {
    const { points } = get(selectedPoints);

    const columns = [
      {
        accessor: "sample",
        Header: "Sample",
        show: true,
      },
      {
        accessor: "idatFilename",
        Header: ".IDAT Filename",
        show: false,
      },
      {
        accessor: "nihLabels",
        Header: "NIH Labels",
        show: false,
      },
      {
        accessor: "nciMetric",
        Header: "NCI Metric",
        show: true,
      },
      {
        accessor: "v11b6",
        Header: "v11b6",
        show: true,
      },
      {
        accessor: "age",
        Header: "Age",
        Cell: (c) => +c.value?.toFixed(1) || "N/A",
        show: true,
      },
      {
        accessor: "sex",
        Header: "Sex",
        show: true,
      },
      {
        accessor: "diagnosisProvided",
        Header: "Diagnosis Provided",
        show: true,
      },
      {
        accessor: "locationRegion",
        Header: "Location (Region)",
        show: true,
      },
      {
        accessor: "locationSite",
        Header: "Location (Site)",
        show: true,
      },
      {
        accessor: "additionalInfo",
        Header: "Additional Info",
        show: false,
      },
      {
        accessor: "variants",
        Header: "Variants",
        show: true,
      },
      {
        accessor: "fusionsOrTranslocations",
        Header: "Fusions/Translocations",
        show: true,
      },
      {
        accessor: "assay",
        Header: "Assay",
        show: false,
      },
      {
        accessor: "variantsReport",
        Header: "Variants Report",
        show: false,
      },
      {
        accessor: "fusionsOrTranslocationsReport",
        Header: "Fusions/Translocations Report",
        show: false,
      },
      {
        accessor: "outsideAssay",
        Header: "Outside Assay",
        show: false,
      },
      {
        accessor: "variantsFormat",
        Header: "Variants Format",
        show: false,
      },
      {
        accessor: "fusionsOrTranslocationsFormat",
        Header: "Fusions/Translocations Format",
        show: false,
      },
      {
        accessor: "lpCpNumber",
        Header: "LP.CP Number",
        show: false,
      },
      {
        accessor: "subtypeOrPattern",
        Header: "Subtype/Pattern",
        show: false,
      },
      {
        accessor: "who2007Grade",
        Header: "WHO 2007 Grade",
        show: false,
      },
      {
        accessor: "MCF1_v11b6",
        Header: "MCF1_v11b6",
        show: false,
      },
      {
        accessor: "MCF1_v11b6_score",
        Header: "MCF1_v11b6_score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "SC1_v11b6",
        Header: "SC1_v11b6",
        show: false,
      },
      {
        accessor: "SC1_v11b6_score",
        Header: "SC1_v11b6_score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "gsmAccession",
        Header: "GSM Accession",
        show: false,
      },
      {
        accessor: "dkfzBrainTumorClassifier",
        Header: "DKFZ Brain Tumor Classifier",
        show: false,
      },
      {
        accessor: "primaryStudy",
        Header: "Primary Study",
        show: false,
      },
      {
        accessor: "centerMethylation",
        Header: "Center Methylation",
        show: false,
      },
      {
        accessor: "accessionMethylation",
        Header: "Accession Methylation",
        show: false,
      },
      {
        accessor: "samplingTreatment",
        Header: "Sampling Treatment",
        show: false,
      },
      {
        accessor: "locationMetastasis",
        Header: "Location (Metastasis)",
        show: false,
      },
      {
        accessor: "type",
        Header: "Type",
        show: false,
      },
      {
        accessor: "category",
        Header: "Category",
        show: false,
      },
      {
        accessor: "diagnosisTier1",
        Header: "Diagnosis (Tier 1)",
        show: false,
      },
      {
        accessor: "diagnosisTier2",
        Header: "Diagnosis (Tier 2)",
        show: false,
      },
      {
        accessor: "diagnosisTier3",
        Header: "Diagnosis (Tier 3)",
        show: false,
      },
      {
        accessor: "whoDiagnosisTier4",
        Header: "WHO Diagnosis (Tier 4)",
        show: false,
      },

      {
        accessor: "rfPurityAbsolute",
        Header: "RF Purity (Absolute)",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "rfPurityEstimate",
        Header: "RF Purity (Estimate)",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "lump",
        Header: "LUMP",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "mcf",
        Header: "MCF",
        show: false,
      },
      {
        accessor: "mcfScore",
        Header: "MCF Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "subclass",
        Header: "Subclass",
        show: false,
      },
      {
        accessor: "subclassScore",
        Header: "Subclass Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "CNSv12b6",
        Header: "CNSv12b6",
        show: false,
      },
      {
        accessor: "CNSv12b6_score",
        Header: "CNSv12b6 Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "CNSv12b6_superfamily",
        Header: "CNSv12b6 Superfamily",
        show: false,
      },
      {
        accessor: "CNSv12b6_superfamily_score",
        Header: "CNSv12b6 Superfamily Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "CNSv12b6_family",
        Header: "CNSv12b6 Family",
        show: false,
      },
      {
        accessor: "CNSv12b6_family_score",
        Header: "CNSv12b6 Family Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "CNSv12b6_class",
        Header: "CNSv12b6 Class",
        show: false,
      },
      {
        accessor: "CNSv12b6_class_score",
        Header: "CNSv12b6 Class Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "CNSv12b6_subclass1",
        Header: "CNSv12b6 Subclass 1",
        show: false,
      },
      {
        accessor: "CNSv12b6_subclass1_score",
        Header: "CNSv12b6 Subclass 1 Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "CNSv12b6_subclass2",
        Header: "CNSv12b6 Subclass 2",
        show: false,
      },
      {
        accessor: "CNSv12b6_subclass2_score",
        Header: "CNSv12b6 Subclass 2 Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "mgmtStatus",
        Header: "MGMT Status",
        show: false,
      },
      {
        accessor: "mgmtEstimated",
        Header: "MGMT Estimated",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "SARv12b6",
        Header: "SARv12b6",
        show: false,
      },
      {
        accessor: "SARv12b6_desc",
        Header: "SARv12b6 Description",
        show: false,
      },
      {
        accessor: "SARv12b6_score",
        Header: "SARv12b6 Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "SARv12b6_second",
        Header: "SARv12b6 Second",
        show: false,
      },
      {
        accessor: "SARv12b6_second_desc",
        Header: "SARv12b6 Second Description",
        show: false,
      },
      {
        accessor: "SARv12b6_second_score",
        Header: "SARv12b6 Second Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
      {
        accessor: "SARv12b6_third",
        Header: "SARv12b6 Third",
        show: false,
      },
      {
        accessor: "SARv12b6_third_desc",
        Header: "SARv12b6 Third Description",
        show: false,
      },
      {
        accessor: "SARv12b6_third_score",
        Header: "SARv12b6 Third Score",
        Cell: (c) => +c.value?.toFixed(2) || "N/A",
        show: false,
      },
    ];

    const tables = points.reduce(
      (prev, data, i) => ({
        ...prev,
        [i]: {
          cols: columns,
          data: data.length
            ? data.map((e) =>
                pick(
                  e.customdata,
                  columns.map((e) => e.accessor)
                )
              )
            : [],
        },
      }),
      {}
    );

    return tables;
  },
});

const survivalGroupsSelector = selector({
  key: "table.survivalGroupsSelector",
  get: ({ get }) => {
    const { points } = get(selectedPoints);
    return points
      .filter((p) => p.length)
      .map((pointGroup, groupIndex) =>
        pointGroup
          .map((g) => ({
            group: groupIndex + 1,
            overallSurvivalMonths: g.customdata.overallSurvivalMonths,
            overallSurvivalStatus: g.customdata.overallSurvivalStatus,
          }))
          .filter((data) => isNumber(data.overallSurvivalMonths) && isNumber(data.overallSurvivalStatus))
      )
      .flat();
  },
});

export const survivalDataSelector = selector({
  key: "survivalDataSelector",
  get: async ({ get }) => {
    const selectedGroups = get(survivalGroupsSelector);
    if (selectedGroups?.length) {
      const response = await axios.post("/api/analysis/survival", selectedGroups);
      return response.data;
    } else {
      return null;
    }
  },
});
