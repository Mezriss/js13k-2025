import { loadState } from "./util/util";

export type State = {
  scores: number[];
  intro: boolean;
};

export const state: State = {
  scores: [],
  intro: false,
  ...loadState(),
};
