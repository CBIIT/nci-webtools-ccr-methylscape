import { fileURLToPath } from "url";
import { parse } from "csv-parse";

/**
 * Checks if the current module is the main module.
 * @param {ImportMeta} importMeta
 * @param {NodeJS.ProcessEnv} env
 * @returns
 */
export function isMainModule(importMeta, env = process.env) {
  const mainModulePath = env.pm_exec_path || process.argv[1];
  const currentModulePath = fileURLToPath(importMeta.url);
  return mainModulePath === currentModulePath;
}

export function castValue(value) {
  if (["NA", "", null, undefined].includes(value)) {
    return null;
  } else if (!isNaN(value)) {
    return +value;
  } else {
    return value;
  }
}

export function getTxtParser(columns, options = {}) {
  return parse({
    delimiter: "\t",
    from_line: 2,
    cast: castValue,
    columns,
    ...options,
  });
}

export function parseChromosome(chromosome) {
  return +String(chromosome).replace("chr", "").replace("X", "23").replace("Y", "24");
}
