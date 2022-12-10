import axios from "axios";

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

export function formatTime(seconds) {
  const [mins, secs] = [seconds / 60, seconds % 60];
  const minsRemaining = [Math.floor(mins), pluralize(Math.floor(mins), "min", "mins")];
  const secsRemaining = [Math.floor(secs), pluralize(Math.floor(secs), "sec", "secs")];

  return Math.floor(mins) > 0 ? [...minsRemaining, ...secsRemaining].join(" ") : secsRemaining.join(" ");
}

export async function getUserSession() {
  try {
    const response = await axios.get("/api/session");
    return response.data;
  } catch (error) {
    console.error(error);
    return { authenticated: false };
  }
}

export async function getRefreshedUserSession() {
  try {
    const response = await axios.post("/api/session");
    return response.data;
  } catch (error) {
    console.error(error);
    return { authenticated: false };
  }
}

export function getRemainingTime(expires) {
  if (!expires) return 0;
  return Math.max(0, new Date(expires).getTime() - new Date().getTime()) / 1000;
}

export function hasExpired(expires) {
  return getRemainingTime(expires) <= 0;
}
