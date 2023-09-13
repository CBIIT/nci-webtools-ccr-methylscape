import { parse } from "csv-parse";
import copyStreams from "pg-copy-streams";
import format from "pg-format";

export const COMMANDS = {
  createSchema,
  createTable,
  recreateTables,
  dropTables,
  copyTable,
  importTable,
  upsertTable,
};

export async function runTask(task, commands = COMMANDS) {
  const command = commands[task.command];
  if (command) {
    return await command(task);
  } else {
    throw new Error(`Unknown command: ${task.command}`);
  }
}

export async function createSchema({ connection, schema }) {
  const tables = schema.map((s) => s.table).filter(Boolean);
  await recreateTables({ connection, schema, tables });
}

export async function createTable({ connection, table, columns, type = "" }) {
  const columnDefs = columns
    .filter((c) => c.name !== "COMPOSITE_P_KEY")
    .map((c) => format("%I %s %s %s", c.name, c.type, c.constraints?.join(" "), c.options?.join(" ")));
  const compositePrimaryKeyDef = columns
    .filter((c) => c.name === "COMPOSITE_P_KEY")
    .map((c) => format(", PRIMARY KEY(%I)", c.columns));
  await connection.query(format("CREATE %s TABLE %I (%s %s)", type, table, columnDefs, compositePrimaryKeyDef));
}

export async function recreateTables({ connection, schema, tables }) {
  const tableSchemas = schema.filter((s) => tables.includes(s.table));
  await dropTables({ connection, tables });
  for (const { table, columns } of tableSchemas) {
    await createTable({ connection, table, columns });
  }
}

export async function dropTables({ connection, tables }) {
  for (const table of [...tables.reverse()]) {
    await connection.query(format("DROP TABLE IF EXISTS %I CASCADE", table));
  }
}

export async function copyTable({ connection, schema, source, target, columns }) {
  const tableSchema = schema.find((s) => s.table === target);
  const columnTypes = Object.fromEntries(tableSchema.columns.map((c) => [c.name, c.type]));
  const parseSourceValues = (column) => {
    if (column.sourceExpression) {
      return column.sourceExpression;
    } else if (column.sourceValue) {
      return format("%L", column.sourceValue);
    } else if (column.sourceName) {
      return format("CAST(%I as %s)", column.sourceName, columnTypes[column.name]);
    } else {
      return "null";
    }
  };
  const columnNames = columns.map((column) => format("%I", column.name));
  const columnValues = columns.map(parseSourceValues);
  const insertStatement = format("INSERT INTO %I (%s) SELECT %s FROM %I", target, columnNames, columnValues, source);
  return await connection.query(insertStatement);
}

export async function importTable({ connection, schema, source, sourceProvider, target, convert, options }) {
  const tableSchema = schema.find((s) => s.table === target);

  if (tableSchema) {
    await createSchema({ connection, schema: [tableSchema] });
  } else {
    const columns = await getColumns(await getConvertedStream(source, sourceProvider, convert), options);
    await createTable({ connection, table: target, columns, type: "temporary" });
  }
  return await importTableFromStream(
    connection,
    await getConvertedStream(source, sourceProvider, convert),
    target,
    options
  );
}

export async function upsertTable({ connection, schema, source, target, columns, conflictTarget }) {
  const tableSchema = schema.find((s) => s.table === target);
  const columnTypes = Object.fromEntries(tableSchema.columns.map((c) => [c.name, c.type]));
  const parseSourceValues = (column) => {
    if (column.sourceExpression) {
      return column.sourceExpression;
    } else if (column.sourceValue) {
      return format("%L", column.sourceValue);
    } else if (column.sourceName) {
      return format("CAST(%I as %s)", column.sourceName, columnTypes[column.name]);
    } else {
      return "null";
    }
  };
  const columnNames = columns.map((column) => format("%I", column.name));
  const columnValues = columns.map(parseSourceValues);
  const upsertStatement = format(
    "INSERT INTO %I (%s) SELECT %s FROM %I ON CONFLICT (%I) DO NOTHING",
    target,
    columnNames,
    columnValues,
    source,
    conflictTarget
  );
  return await connection.query(upsertStatement);
}

export async function getColumns(inputStream, options) {
  const parser = inputStream.pipe(parse({ ...options, to_line: 1 }));
  for await (const line of parser) {
    return line.map((v, i) => ({ name: v || i, type: "text" }));
  }
}

export async function convertStream(inputStream, sourceFormat, targetFormat) {
  if (sourceFormat === targetFormat) {
    return inputStream;
  } else {
    throw new Error(`Unsupported conversion: ${sourceFormat} -> ${targetFormat}`);
  }
}

export async function getConvertedStream(source, sourceProvider, convert) {
  const inputStream = await sourceProvider.readFile(source);
  if (convert) {
    return await convertStream(inputStream, convert.from, convert.to);
  } else {
    return inputStream;
  }
}

export function importTableFromStream(connection, inputStream, table, options = {}) {
  options = {
    delimiter: ",",
    header: true,
    nullString: "",
    quoteCharacter: '"',
    escapeCharacter: '"',
    ...options,
  };
  return new Promise((resolve, reject) => {
    const query = format(
      "COPY %I FROM STDIN CSV %s DELIMITER %L NULL %L QUOTE %L ESCAPE %L",
      table,
      options.header ? "HEADER" : "",
      options.delimiter,
      options.nullString,
      options.quoteCharacter,
      options.escapeCharacter
    );
    const stream = connection.query(copyStreams.from(query));
    inputStream.on("error", reject);
    stream.on("error", reject);
    stream.on("finish", () => resolve(stream));
    inputStream.pipe(stream);
  });
}
