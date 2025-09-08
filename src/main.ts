import { minFrameDuration } from "./const.ts";
import { GameInstance } from "./game.ts";
import { Intro } from "./intro.ts";
import { Menu } from "./menu.ts";
import { state, type State } from "./state.ts";
import "./style.css";
import { initCanvas } from "./util/draw.ts";
import { saveState } from "./util/util.ts";

export type Result = void | {
  switch: number | "menu" | "intro";
  update?: Partial<State>;
};

initCanvas();

function switchMode() {}

const menu = new Menu();

let current: GameInstance | Menu | Intro = menu;

let prevTime = Number(document.timeline.currentTime);
export const loop: FrameRequestCallback = (time) => {
  const dt = Math.min((time - prevTime) / 1000, minFrameDuration);
  prevTime = time;
  current.draw();
  const result: Result = current.update(dt);

  if (result) {
    switch (result.switch) {
      case "menu":
        current = menu;
        break;
      case "intro":
        current = new Intro();
        break;
      default:
        current = new GameInstance(result.switch);
        break;
    }
    if (result.update) {
      Object.assign(state, result.update);
      saveState(state);
    }
  }

  requestAnimationFrame(loop);
};

switchMode();
loop(prevTime);
