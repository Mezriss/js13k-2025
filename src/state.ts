import { loadState } from "./util/util";

type State = {
  mode: "menu" | "game";
  scores: number[];
  intro: boolean;
};

export const state: State = {
  scores: [],
  intro: true,
  ...loadState(),
  mode: "menu",
};
