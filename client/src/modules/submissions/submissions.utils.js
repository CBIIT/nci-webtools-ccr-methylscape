import { parse } from "papaparse";

export async function parseMetadata(file) {
  const text = await (await fetch(URL.createObjectURL(file))).text();
  const [_, ownerText, metadataText] = text.split(/\[.+\],+/);
  if (ownerText && metadataText) {
    const { data: ownerParse } = parse(ownerText);
    const { data: metadata } = parse(metadataText, { skipEmptyLines: true, header: true });
    const ownerInfo = ownerParse.filter((e) => e.length > 1).reduce((obj, e) => ({ ...obj, [e[0]]: e[1] }), {});
    return { ownerInfo, metadata };
  } else throw "Unable to parse meatadata file. Please ensure the file is properly formatted.";
}
