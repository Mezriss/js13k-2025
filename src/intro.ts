import { colors } from "./const";
import type { Result } from "./main";
import { state } from "./state";
import { screen } from "./util/draw";

export class Intro {
  t = 0;
  update(dt: number): Result {
    this.t += dt;

    if (this.t > 2) {
      if (state.intro) {
        return { switch: "menu" };
      }
      return { switch: 0, update: { intro: true } };
    }
  }
  draw() {
    screen.ctx.save();
    screen.center();
    screen.clear();

    screen.ctx.fillStyle = colors.ui;
    screen.fillText("Intro", 0, 0);

    screen.ctx.restore();
  }
}
