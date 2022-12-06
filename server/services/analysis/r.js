import r from "r-wrapper/src/r.js";

export async function getSurvivalData(data) {
  return await r.async("services/R/wrapper.R", "getSurvivalData", { data });
}
