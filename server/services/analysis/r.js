import r from "r-wrapper/src/r.js";

export async function getSurvivalData(data) {
  return await r.async("services/analysis/analysis.R", "getSurvivalData", { data });
}
