import { minFrameDuration } from "./const.ts";
import { GameInstance } from "./game.ts";
import "./style.css";
import { initCanvas } from "./util/draw.ts";

initCanvas();

// function switchMode() {}

const game = new GameInstance(0);

let prevTime = Number(document.timeline.currentTime);
export const loop: FrameRequestCallback = (time) => {
  const dt = Math.min((time - prevTime) / 1000, minFrameDuration);
  prevTime = time;
  game.update(dt);
  game.draw();

  requestAnimationFrame(loop);
};

loop(prevTime);
