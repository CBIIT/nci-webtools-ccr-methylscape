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
    connection.raw(`count(distinct "sample") as sampleCount`),
    connection.raw(`count(distinct "sentrixId") as experimentCount`),
    connection.raw(`"unifiedSamplePlate"`),
    connection.raw(`string_agg(distinct "piCollaborator", ', ' ) as Investigators`),
  ];
  const query = await connection
    .select(sampleColumns)
    .from("sample")
    .whereNotNull("samplePlate")
    .groupBy("unifiedSamplePlate");
  return query;
}

export async function getUnifiedProject(connection) {
  const sampleColumns = [
    connection.raw(`count(distinct "sample") as sampleCount`),
    connection.raw(`"samplePlate" as project`),
    connection.raw(`"unifiedSamplePlate"`),
  ];
  const query = await connection
    .select(sampleColumns)
    .from("sample")
    .whereNotNull("samplePlate")
    .groupBy("unifiedSamplePlate")
    .groupBy("samplePlate");

  return query;
}

export async function getAllSamples(connection) {
  const sampleColumns = [
    connection.raw(`"samplePlate" as project`),
    connection.raw(`"sample"`),
    connection.raw(`"sentrixId" as experiment`),
    connection.raw(`"sex" as gender`),
    connection.raw(`"age" as age`),
    connection.raw(`"notes"`),
    connection.raw(`"diagnosisProvided" as diagnosis`),
    connection.raw(`"CNSv12b6_family" as mf`),
    connection.raw(`"CNSv12b6_family_score" as mf_calibrated_score`),
    connection.raw(`"CNSv12b6_subclass1" as mc`),
    connection.raw(`"CNSv12b6_subclass1_score" as mc_calibrated_score`),
    connection.raw(`"mgmtStatus" as mgmt_status`),
    connection.raw(`"mgmtEstimated" as tumore_sites`),
    connection.raw(`"batchDate"as sampleDate`),
    connection.raw(`"surgeryDate" as 	experimentDate`),
    connection.raw(`"lpCpNumber"`),
    connection.raw(`"unifiedSamplePlate"`),
  ];
  const query = await connection.select(sampleColumns).from("sample").whereNotNull("samplePlate");

  return query;
}

export async function getExperiments(connection) {
  const experimentColumns = [
    connection.raw(`"piCollaborator" as 	Investigator`),
    connection.raw(`"surgeryDate" as 	experimentDate`),
    connection.raw(`count(distinct "sample") as sampleCount`),
    connection.raw(`"sentrixId" as experiment`),
    connection.raw(`"unifiedSamplePlate"`),
  ];
  const query = await connection
    .select(experimentColumns)
    .from("sample")
    .whereNotNull("samplePlate")
    .groupBy("sentrixId")
    .groupBy("unifiedSamplePlate")
    .groupBy("piCollaborator")
    .groupBy("surgeryDate")
    .orderBy("sentrixId");
  return query;
}

export async function getSamples(connection, query) {
  const { columns, conditions, offset, limit, orderBy } = query;

  let sqlQuery = connection("sample")
    .select(columns || "*")
    .offset(offset || 0)
    .limit(limit || 10000)
    .orderBy(orderBy || "id");

  for (let condition of conditions || []) {
    sqlQuery = sqlQuery.where(...condition);
  }

  return await sqlQuery;
}

export async function getGeneMap(connection) {
  const keyColumn = connection.raw(`concat_ws('-', "chromosome", "start", "end") as key`);
  const genes = await connection.select(keyColumn, "gene").from("gene").options({ rowMode: "array" });
  return Object.fromEntries(genes.map(([k, v]) => [k, v?.split(";")]));
}

export async function getCnvBins(connection, { idatFilename }) {
  if (!this.geneMap) {
    this.geneMap = await getGeneMap(connection);
  }

  if (idatFilename) {
    const s3Response = await getFile(`analysis/CNV/bins/${idatFilename}.bins.txt`);
    const parser = getTxtParser(["id", "chromosome", "start", "end", "feature", "medianValue"]);
    const results = [];
    for await (const record of s3Response.Body.pipe(parser)) {
      const key = [record.chromosome, record.start, record.end].join("-");
      const chromosome = parseChromosome(record.chromosome);
      const medianValue = record.medianValue || 0;
      const gene = this.geneMap[key] || [];
      results.push({ ...record, chromosome, medianValue, gene });
    }
    return results;
  } else {
    return [];
  }
}

export async function getCnvSegments(connection, { idatFilename }) {
  if (idatFilename) {
    const s3Response = await getFile(`analysis/CNV/segments/${idatFilename}.seg.txt`);
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
