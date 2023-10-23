import { parse } from "papaparse";
import { groupBy } from "lodash";

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
  const [_, ownerText, metadataText] = text.split(/^\[.+\],*$/gm);
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
  } else throw "Unable to parse metadata file. Please ensure the file is properly formatted.";
}

export function parseForm(data, session, sampleFiles) {
  return {
    ownerInfo: {
      investigator: `${session.user.firstName} ${session.user.lastName}`,
      project: data.project,
      experiment: data.experiment || sampleFiles[0].id,
      date: new Date(),
    },
    metadata: [
      {
        sample: data.sample,
        sampleWell: data.sampleWell,
        samplePlate: data.samplePlate,
        sampleGroup: data.sampleGroup,
        poolId: data.poolId,
        sentrixId: sampleFiles[0].id,
        sentrixPosition: sampleFiles[0].position,
        materialType: data.materialType,
        sex: data.sex,
        surgicalCase: data.surgicalCase,
        diagnosis: data.diagnosis,
        age: data.age,
        notes: data.notes,
        tumorSite: data.tumorSite,
        piCollaborator: data.piCollaborator,
        outsideId: data.outsideId,
        surgeryDate: data.surgeryDate,
      },
    ],
  };
}

/**
 * Filter and parse sentrix info from uploaded files
 * @param {FileList} sampleFiles
 * @returns {Array} array of sentrix data parsed from file name
 */
export function parseSampleFiles(sampleFiles) {
  return Array.from(sampleFiles)
    .map((e) => {
      const [filename, extension] = e.name.split(".");
      const [id, position, channel] = filename.split("_");
      return extension === "idat" && id && position && channel ? { id, position, channel } : null;
    })
    .filter(Boolean);
}

/**
 * Filter and parse sentrix info from uploaded files
 * @param {Array} sampleFiles
 * @returns {Array} array of arrays containing pairs of sentrix data
 */
export function sampleFilePairs(files) {
  return Object.values(groupBy(files, (e) => e.id + e.position)).filter((e) => e.length == 2);
}
