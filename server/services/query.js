import { getFile } from "./aws.js";
import { getTxtParser, parseChromosome } from "./utils.js";

export async function getSampleCoordinates(connection, query) {
  if (query.embedding && query.organSystem) {
    return await connection("sample")
      .join("sampleCoordinate", "sample.idatFilename", "sampleCoordinate.sampleIdatFilename")
      .where("sampleCoordinate.embedding", query.embedding)
      .andWhere("sampleCoordinate.organSystem", query.organSystem);
  } else {
    return [];
  }
}

export async function getallproject(connection) {
  const sampleColumns = [
    connection.raw(`count(distinct "idatFilename") as sampleCount`),
    connection.raw(`count(distinct "sentrixId") as experimentCount`),
    connection.raw(`"unifiedSamplePlate"`),
    connection.raw(`string_agg(distinct "piCollaborator", ', ' ) as Investigators`),
  ];
  const query = await connection
    .select(sampleColumns)
    .from("sample")
    .whereNotNull("unifiedSamplePlate")
    .groupBy("unifiedSamplePlate");
  return query;
}

export async function getUnifiedProject(connection) {
  const sampleColumns = [
    connection.raw(`count(distinct "idatFilename") as sampleCount`),
    connection.raw(`"unifiedSamplePlate" as project`),
    connection.raw(`"unifiedSamplePlate"`),
  ];
  const query = await connection
    .select(sampleColumns)
    .from("sample")
    .whereNotNull("unifiedSamplePlate")
    .groupBy("unifiedSamplePlate");

  return query;
}

export async function getExperiments(connection) {
  const experimentColumns = [
    connection.raw(`string_agg(distinct "piCollaborator", ', ' ) as Investigator`),
    connection.raw(`max("surgeryDate") as experimentDate`),
    connection.raw(`count(distinct "idatFilename") as sampleCount`),
    connection.raw(`"sentrixId" as experiment`),
    connection.raw(`"unifiedSamplePlate"`),
  ];
  const query = await connection
    .select(experimentColumns)
    .from("sample")
    .whereNotNull("unifiedSamplePlate")
    .groupBy("sentrixId")
    .groupBy("unifiedSamplePlate")
    .orderBy("sentrixId");
  return query;
}

export async function getSamples(connection, query) {
  const { columns, conditions, offset, limit, orderBy, groupBy } = query;

  let sqlQuery = connection("sample")
    .select(columns || "*")
    .offset(offset || 0)
    .limit(limit || 10000)
    .orderBy(orderBy || "id");

  for (let condition of conditions || []) {
    sqlQuery = sqlQuery.where(...condition);
  }

  for (let group of groupBy || []) {
    sqlQuery = sqlQuery.groupBy(group);
  }

  return await sqlQuery;
}

export async function getGeneMap(connection) {
  const keyColumn = connection.raw(`concat_ws('-', "chromosome", "start", "end") as key`);
  const genes = await connection.select(keyColumn, "gene").from("gene").options({ rowMode: "array" });
  return Object.fromEntries(genes.map(([k, v]) => [k, v?.split(";")]));
}

export async function getCnvBins(connection, { idatFilename }) {
  if (idatFilename) {
    const geneMap = await getGeneMap(connection);
    const s3Response = await getFile(`CNV/bins/${idatFilename}.bins.txt`);
    const parser = getTxtParser(["id", "chromosome", "start", "end", "feature", "medianValue"]);
    const results = [];
    for await (const record of s3Response.Body.pipe(parser)) {
      const key = [record.chromosome, record.start, record.end].join("-");
      const chromosome = parseChromosome(record.chromosome);
      const medianValue = record.medianValue || 0;
      const gene = geneMap[key] || [];
      results.push({ ...record, chromosome, medianValue, gene });
    }
    return results;
  } else {
    return [];
  }
}

export async function getCnvSegments(connection, { idatFilename }) {
  if (idatFilename) {
    const s3Response = await getFile(`CNV/segments/${idatFilename}.seg.txt`);
    const parser = getTxtParser([
      "id",
      "sampleIdatFilename",
      "chromosome",
      "start",
      "end",
      "numberOfMarkers",
      "bStatistic",
      "pValue",
      "meanValue",
      "medianValue",
    ]);
    const results = [];
    for await (const record of s3Response.Body.pipe(parser)) {
      const chromosome = parseChromosome(record.chromosome);
      results.push({ ...record, chromosome });
    }
    return results;
  } else {
    return [];
  }
}

export async function getGenes(connection) {
  return await connection("gene").select("*");
}

export async function getImportLogs(connection, query) {
  if (query.id) {
    return await connection("importLog").select("*").where("id", query.id);
  } else {
    return await connection("importLog")
      .select("id", "status", "warnings", "createdAt", "updatedAt")
      .orderBy("createdAt", "desc");
  }
}
