import { parse } from "papaparse";
import { groupBy } from "lodash";
import Excel from "exceljs";
import moment from "moment";

export async function parseMetadata(file) {
  const infoKeys = {
    "Investigator Name": "investigator",
    "Project Name": "project",
    "Experiment Name": "experiment",
    "Date": "date",
  };
  const metadataKeys = {
    Sample_Name: {
      name: "sample",
      required: true,
    },
    Sample_Well: {
      name: "sampleWell",
      required: false,
    },
    Sample_Plate: {
      name: "samplePlate",
      required: false,
    },
    Sample_Group: {
      name: "sampleGroup",
      required: false,
      validate: (e) => {
        if (!e) return false;
        if (!["450k", "EPIC", "EPICv2"].includes(e)) {
          return `Sample_Group: ${e} is invalid. Must be one of the following: [450k/EPIC/EPICv2]`;
        } else {
          return false;
        }
      },
    },
    Pool_ID: {
      name: "poolId",
      required: false,
      // validate: invalidDate,
    },
    Sentrix_ID: {
      name: "sentrixId",
      required: true,
    },
    Sentrix_Position: {
      name: "sentrixPosition",
      required: true,
    },
    Material_Type: {
      name: "materialType",
      required: false,
      validate: (e) => {
        if (!e) return false;
        if (!["FFPE", "Frozen", "Fresh"].includes(e)) {
          return `Material_Type: ${e} is invalid. Must be one of the following: [FFPE/Frozen/Fresh]`;
        } else {
          return false;
        }
      },
    },
    Gender: {
      name: "sex",
      required: false,
    },
    Surgical_Case: {
      name: "surgicalCase",
      required: false,
    },
    Diagnosis: {
      name: "diagnosis",
      required: true,
    },
    Age: {
      name: "age",
      required: true,
      // validate: invalidAge,
    },
    Notes: {
      name: "notes",
      required: false,
    },
    Tumor_Site: {
      name: "tumorSite",
      required: true,
    },
    PI_Collaborator: {
      name: "piCollaborator",
      required: false,
    },
    Outside_ID: {
      name: "outsideId",
      required: false,
    },
    Surgery_date: {
      name: "surgeryDate",
      required: false,
      // validate: invalidDate,
    },
  };

  // function invalidDate(date) {
  //   if (!date) return false;
  //   if (!moment(date, "MM-DD-YYYY", true).isValid()) {
  //     return `Date: ${date} is not a valid date format. Dates must be recorded in MM-DD-YYYY`;
  //   } else {
  //     return false;
  //   }
  // }

  // function invalidAge(age) {
  //   if (Number.isNaN(Number.parseFloat(age))) {
  //     return `Age: ${age} is not a valid age value. Please enter a numeric value`;
  //   } else {
  //     return false;
  //   }
  // }

  const text =
    file.name.split(".")[1] === "csv"
      ? await (await fetch(URL.createObjectURL(file))).text()
      : await parseExcelToCsv(file);

  const [_, ownerText, metadataText] = text.split(/^\[.+\],*$/gm);
  if (ownerText && metadataText) {
    const { data: ownerParse } = parse(ownerText);
    const { data: metadata } = parse(metadataText, {
      skipEmptyLines: true,
      header: true,
    });
    const renameMetadata = metadata.map((e) =>
      Object.fromEntries(
        Object.entries(e).map(([key, val]) => {
          const column = metadataKeys[key];
          if (!column) {
            throw `Unknown column: ${key}. Please ensure the metadata columns are named correctly.`;
          }
          if (column.required && !val) {
            throw `Missing required values for column: ${key}. Please update your metadata file to include these values.`;
          }
          if (column.validate) {
            const status = column.validate(val);
            if (status) throw status;
          }
          return [metadataKeys[key].name, val];
        })
      )
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
      experiment: data.experiment,
      date: moment().format("MM-DD-YYYY"),
    },
    metadata: [
      {
        sample: data.sample,
        sampleWell: data.sampleWell,
        samplePlate: data.samplePlate,
        sampleGroup: data.sampleGroup,
        poolId: moment(data.poolId).format("MM-DD-YYYY"),
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
        surgeryDate: moment(data.surgeryDate).format("MM-DD-YYYY"),
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

export async function parseExcelToCsv(file) {
  const workbook = new Excel.Workbook();
  const options = { dateFormats: ["MM-DD-YYYY"], dateFormat: "MM-DD-YYYY" };
  await workbook.xlsx.load(await file.arrayBuffer(), options);
  return (await workbook.csv.writeBuffer(options)).toString();
}
