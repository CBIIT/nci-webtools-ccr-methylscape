import { atom } from "recoil";

export const defaultTaskQueueState = {
  queue: [],
};

export const taskQueueState = atom({
  key: "taskQueueState",
  default: defaultTaskQueueState,
});
