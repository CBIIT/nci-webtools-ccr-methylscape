import { parse } from "papaparse";

export async function parseMetadata(file) {
  const infoKeys = {
    "Investigator Name": "investigator",
    "Project Name": "project",
    "Experiment Name": "experiment",
    "Date": "date",
  };
  const text = await (await fetch(URL.createObjectURL(file))).text();
  const [_, ownerText, metadataText] = text.split(/\[.+\],+/);
  if (ownerText && metadataText) {
    const { data: ownerParse } = parse(ownerText);
    const { data: metadata } = parse(metadataText, { skipEmptyLines: true, header: true });
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
    return { ownerInfo, metadata };
  } else throw "Unable to parse meatadata file. Please ensure the file is properly formatted.";
}
