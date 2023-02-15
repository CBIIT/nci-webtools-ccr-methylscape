import axios from "axios";
import isNumber from "lodash/isNumber";
import { selector } from "recoil";
import { selectedPoints, formState } from "../metadata/metadata-plot.state";

export function toFixed(num, maxDigits = 2) {
  return isNumber(num) && !isNaN(num) ? +num.toFixed(maxDigits) : num;
}

export const tableColumnsMap = {
  centralNervousSystem: [
    "sample",
    "nciMetric",
    "age",
    "diagnosisProvided",
    "diagnosisIntegrated",
    "locationSite",
    "MCF1_v11b6",
    "MCF1_v11b6_score",
    "CNSv12b6",
    "CNSv12b6_score",
  ],
  boneAndSoftTissue: [
    "sample",
    "nciMetric",
    "age",
    "sex",
    "diagnosisProvided",
    "locationSite",
    "SARv12b6",
    "SARv12b6_score",
    "variantsFormat",
    "fusionsOrTranslocationsFormat",
  ],
  default: [
    "sample",
    "nciMetric",
    "age",
    "sex",
    "diagnosisProvided",
    "locationRegion",
    "locationSite",
    "variantsFormat",
    "fusionsOrTranslocationsFormat",
  ],
};

export const tableColumns = [
  {
    accessor: "sample",
    Header: "Sample",
  },
  {
    accessor: "idatFilename",
    Header: ".IDAT Filename",
  },
  {
    accessor: "nihLabels",
    Header: "NIH Labels",
  },
  {
    accessor: "nciMetric",
    Header: "NCI Metric",
  },
  {
    accessor: "v11b6",
    Header: "v11b6",
  },
  {
    accessor: "age",
    Header: "Age",
    Cell: (c) => toFixed(c.value, 1) ?? "N/A",
  },
  {
    accessor: "sex",
    Header: "Sex",
  },
  {
    accessor: "diagnosisProvided",
    Header: "Provided Diagnosis",
  },
  {
    accessor: "diagnosisIntegrated",
    Header: "Integrated Diagnosis",
  },
  {
    accessor: "locationRegion",
    Header: "Location (Region)",
  },
  {
    accessor: "locationSite",
    Header: "Location (Site)",
  },
  {
    accessor: "additionalInfo",
    Header: "Additional Info",
  },
  {
    accessor: "variants",
    Header: "Variants",
  },
  {
    accessor: "fusionsOrTranslocations",
    Header: "Fusions/Translocations",
  },
  {
    accessor: "assay",
    Header: "Assay",
  },
  {
    accessor: "variantsReport",
    Header: "Variants Report",
  },
  {
    accessor: "fusionsOrTranslocationsReport",
    Header: "Fusions/Translocations Report",
  },
  {
    accessor: "outsideAssay",
    Header: "Outside Assay",
  },
  {
    accessor: "variantsFormat",
    Header: "Variants Format (SNV)",
  },
  {
    accessor: "fusionsOrTranslocationsFormat",
    Header: "Fusions/Translocations Format",
  },
  {
    accessor: "lpCpNumber",
    Header: "LP.CP Number",
  },
  {
    accessor: "subtypeOrPattern",
    Header: "Subtype/Pattern",
  },
  {
    accessor: "who2007Grade",
    Header: "WHO 2007 Grade",
  },
  {
    accessor: "MCF1_v11b6",
    Header: "MCF1_v11b6",
  },
  {
    accessor: "MCF1_v11b6_score",
    Header: "MCF1_v11b6_score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "SC1_v11b6",
    Header: "SC1_v11b6",
  },
  {
    accessor: "SC1_v11b6_score",
    Header: "SC1_v11b6_score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "gsmAccession",
    Header: "GSM Accession",
  },
  {
    accessor: "primaryStudy",
    Header: "Primary Study",
  },
  {
    accessor: "centerMethylation",
    Header: "Center Methylation",
  },
  {
    accessor: "accessionMethylation",
    Header: "Accession Methylation",
  },
  {
    accessor: "samplingTreatment",
    Header: "Sampling Treatment",
  },
  {
    accessor: "locationMetastasis",
    Header: "Location (Metastasis)",
  },
  {
    accessor: "type",
    Header: "Type",
  },
  {
    accessor: "category",
    Header: "Category",
  },
  {
    accessor: "diagnosisTier1",
    Header: "Diagnosis (Tier 1)",
  },
  {
    accessor: "diagnosisTier2",
    Header: "Diagnosis (Tier 2)",
  },
  {
    accessor: "diagnosisTier3",
    Header: "Diagnosis (Tier 3)",
  },
  {
    accessor: "whoDiagnosisTier4",
    Header: "WHO Diagnosis (Tier 4)",
  },

  {
    accessor: "rfPurityAbsolute",
    Header: "RF Purity (Absolute)",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "rfPurityEstimate",
    Header: "RF Purity (Estimate)",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "lump",
    Header: "LUMP",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "mcf",
    Header: "MCF",
  },
  {
    accessor: "mcfScore",
    Header: "MCF Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "subclass",
    Header: "Subclass",
  },
  {
    accessor: "subclassScore",
    Header: "Subclass Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "CNSv12b6",
    Header: "CNSv12b6",
  },
  {
    accessor: "CNSv12b6_score",
    Header: "CNSv12b6 Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "CNSv12b6_superfamily",
    Header: "CNSv12b6 Superfamily",
  },
  {
    accessor: "CNSv12b6_superfamily_score",
    Header: "CNSv12b6 Superfamily Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "CNSv12b6_family",
    Header: "CNSv12b6 Family",
  },
  {
    accessor: "CNSv12b6_family_score",
    Header: "CNSv12b6 Family Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "CNSv12b6_class",
    Header: "CNSv12b6 Class",
  },
  {
    accessor: "CNSv12b6_class_score",
    Header: "CNSv12b6 Class Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "CNSv12b6_subclass1",
    Header: "CNSv12b6 Subclass 1",
  },
  {
    accessor: "CNSv12b6_subclass1_score",
    Header: "CNSv12b6 Subclass 1 Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "CNSv12b6_subclass2",
    Header: "CNSv12b6 Subclass 2",
  },
  {
    accessor: "CNSv12b6_subclass2_score",
    Header: "CNSv12b6 Subclass 2 Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "mgmtStatus",
    Header: "MGMT Status",
  },
  {
    accessor: "mgmtEstimated",
    Header: "MGMT Estimated",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "SARv12b6",
    Header: "SARv12b6",
  },
  {
    accessor: "SARv12b6_desc",
    Header: "SARv12b6 Description",
  },
  {
    accessor: "SARv12b6_score",
    Header: "SARv12b6 Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "SARv12b6_second",
    Header: "SARv12b6 Second",
  },
  {
    accessor: "SARv12b6_second_desc",
    Header: "SARv12b6 Second Description",
  },
  {
    accessor: "SARv12b6_second_score",
    Header: "SARv12b6 Second Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
  {
    accessor: "SARv12b6_third",
    Header: "SARv12b6 Third",
  },
  {
    accessor: "SARv12b6_third_desc",
    Header: "SARv12b6 Third Description",
  },
  {
    accessor: "SARv12b6_third_score",
    Header: "SARv12b6 Third Score",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
  },
];

const survivalGroupsSelector = selector({
  key: "table.survivalGroupsSelector",
  get: ({ get }) => {
    const { groups } = get(selectedPoints);
    return groups
      .map((g, i) =>
        g.data.map((d) => ({
          group: i + 1,
          overallSurvivalMonths: d.overallSurvivalMonths,
          overallSurvivalStatus: d.overallSurvivalStatus,
        }))
      )
      .flat()
      .filter((d) => isNumber(d.overallSurvivalMonths) && isNumber(d.overallSurvivalStatus));
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
