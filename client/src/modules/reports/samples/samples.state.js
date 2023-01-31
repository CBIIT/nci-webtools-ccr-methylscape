import { atom, selector } from "recoil";
import { methylscapeData } from "../data.state";
import { toFixed } from "../../analysis/table/table.state";

export const samplesTableFilters = atom({
  key: "samplesTableFilters",
  default: {},
});

export const samplesTableData = selector({
  key: "samplesTableData",
  get: ({ get }) => {
    const { sampleData } = get(methylscapeData);
    if (!sampleData.length) return [];
    return sampleData;
  },
});

/*
{
  id: "sample_name",
  accessor: "sample",
  Header: "Sample Name",
  aria: "Sample Name",
},
{
  id: "project",
  accessor: "unifiedSamplePlate",
  Header: "Project",
  aria: "Project",
  Cell: (e) => (
    <Link
      to="../projects"
      onClick={() => setProjectsTableFilters({ project: e.data[e.row.index].unifiedSamplePlate })}>
      {e.value}
    </Link>
  ),
},
{
  id: "experiment",
  accessor: "sentrixId",
  Header: "Experiment",
  aria: "Experiment",
  Cell: (e) => (
    <Link
      to="../experiments"
      onClick={() => setExperimentsTableFilters({ experiment: e.data[e.row.index].sentrixId })}>
      {e.value}
    </Link>
  ),
},
{
  id: "surgeryDate",
  accessor: "surgeryDate",
  Header: "Sample Date",
  Cell: (e) => (e.value ? new Date(e.value).toLocaleDateString("en-US") : "N/A"),
  aria: "Sample Date",
},
{
  id: "sex",
  accessor: "sex",
  Header: "Gender",
  Cell: (e) => (e.value ? e.value : "N/A"),
  aria: "Gender",
},
{
  id: "age",
  accessor: "age",
  Header: "Age",
  Cell: (e) => (e.value ? e.value : "N/A"),
  aria: "Age",
},
{
  id: "diagnosisProvided",
  accessor: "diagnosisProvided",
  Header: "Diagnosis",
  Cell: (e) => (e.value ? e.value : "N/A"),
  aria: "Diagnosis",
},*/

export const additionalColumns = [
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
    show: false,
  },
  {
    accessor: "v11b6",
    Header: "v11b6",
    show: false,
  },
  {
    accessor: "locationRegion",
    Header: "Location (Region)",
    show: false,
  },
  {
    accessor: "locationSite",
    Header: "Location (Site)",
    show: false,
  },
  {
    accessor: "additionalInfo",
    Header: "Additional Info",
    show: false,
  },
  {
    accessor: "variants",
    Header: "Variants",
    show: false,
  },
  {
    accessor: "fusionsOrTranslocations",
    Header: "Fusions/Translocations",
    show: false,
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
    Header: "Variants Format (SNV)",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
    show: false,
  },
  {
    accessor: "gsmAccession",
    Header: "GSM Accession",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
    show: false,
  },
  {
    accessor: "rfPurityEstimate",
    Header: "RF Purity (Estimate)",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
    show: false,
  },
  {
    accessor: "lump",
    Header: "LUMP",
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
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
    Cell: (c) => toFixed(c.value, 2) ?? "N/A",
    show: false,
  },
];
