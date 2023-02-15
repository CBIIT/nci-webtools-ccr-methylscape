import { atom } from "recoil";

export const sessionState = atom({
  key: "session.sessionState",
  default: { authenticated: false },
});
