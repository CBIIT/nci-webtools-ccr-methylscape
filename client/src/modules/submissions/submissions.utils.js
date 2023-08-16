import { parse } from "papaparse";
import { renameKeys } from "lodash";

export async function parseMetadata(file) {
  const infoKeys = {
    "Investigator Name": "investigator",
    "Project Name": "project",
    "Experiment Name": "experiment",
    "Date": "date",
  };
  const metadataKeys = {
    Sample_Name: "sample",
    Sample_Well: "sampleWell",
    Sample_Plate: "samplePlate",
    Sample_Group: "sampleGroup",
    Pool_ID: "poolId",
    Sentrix_ID: "sentrixId",
    Sentrix_Position: "sentrixPosition",
    Material_Type: "materialType",
    Gender: "sex",
    Surgical_Case: "surgicalCase",
    Diagnosis: "diagnosis",
    Age: "age",
    Notes: "notes",
    Tumor_site: "tumorSite",
    PI_Collaborator: "piCollaborator",
    Outside_ID: "outsideId",
    Surgery_date: "surgeryDate",
  };

  const text = await (await fetch(URL.createObjectURL(file))).text();
  const [_, ownerText, metadataText] = text.split(/\[.+\],+/);
  if (ownerText && metadataText) {
    const { data: ownerParse } = parse(ownerText);
    const { data: metadata } = parse(metadataText, {
      skipEmptyLines: true,
      header: true,
    });
    const renameMetadata = metadata.map((e) =>
      Object.fromEntries(Object.entries(e).map(([key, val]) => [metadataKeys[key], val]))
    );
    const ownerInfo = ownerParse
      .filter((e) => e.length > 1)
      .reduce((obj, e) => {
        if (e[0] && e[1]) {
          const key = infoKeys[e[0]];
          const val = e[1];
          if (!key) throw `Invalid Metadata key: ${e[0]}`;
          if (!val) throw `Missing value for key: ${e[0]}`;
          return { ...obj, [key]: val };
        } else {
          return obj;
        }
      }, {});
    return { ownerInfo, metadata: renameMetadata };
  } else throw "Unable to parse meatadata file. Please ensure the file is properly formatted.";
}
