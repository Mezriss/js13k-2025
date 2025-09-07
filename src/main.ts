import { minFrameDuration } from "./const.ts";
import { GameInstance } from "./game.ts";
import { Menu } from "./menu.ts";
import { state } from "./state.ts";
import "./style.css";
import { initCanvas } from "./util/draw.ts";

initCanvas();

function switchMode() {}

const menu = new Menu();
let game: GameInstance;

game = new GameInstance(0);

let prevTime = Number(document.timeline.currentTime);
export const loop: FrameRequestCallback = (time) => {
  const dt = Math.min((time - prevTime) / 1000, minFrameDuration);
  prevTime = time;
  if (state.mode === "menu") {
    menu.update(dt);
    menu.draw();
  } else if (state.mode === "game" && game) {
    game.update(dt);
    game.draw();
  }

  requestAnimationFrame(loop);
};

switchMode();
loop(prevTime);
