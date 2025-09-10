import { drawCircle, screen } from "./util/draw";
import { keyEvents } from "./util/keyboard";
import { colors, islands, title } from "./const";
import type { Result } from "./main";
import { state } from "./state";
import onamazu from "./assets/onamazu";
import { Vector2 } from "./util/vector2";
import { postprocessing } from "./util/noise";

export class Menu {
  menu: "start" | "continue" | "select";
  selected: number = 0;
  constructor() {
    if (state.intro) {
      this.menu = "select";
      this.selected = 1;
    } else {
      this.menu = "start";
    }
  }
  update(_dt: number): Result {
    const now = Date.now();
    while (keyEvents.length > 0) {
      const [event, timestamp] = keyEvents.shift()!;
      if (now - timestamp > 1000) continue;
      if (this.menu === "start" && event === "action") {
        this.menu = "select";
        return "intro";
      }
      if (this.menu === "continue") {
        if (event === "action") {
          switch (this.selected) {
            case 0:
              return "intro";
            case 1:
              this.menu = "select";
              this.selected = 0;
              return;
          }
        } else {
          this.selected = (this.selected + 1) % 2;
        }
      }
      if (this.menu === "select") {
        if (event === "action") {
          if (this.selected === islands.length) {
            this.menu = "continue";
            this.selected = 1;
          } else {
            return this.selected;
          }
        } else {
          switch (event) {
            case "up":
            case "down":
              this.selected =
                this.selected === islands.length ? 0 : islands.length;
              break;
            case "left":
              this.selected =
                (this.selected - 1 + islands.length) % islands.length;
              break;
            case "right":
              this.selected = (this.selected + 1) % (islands.length + 1);
              break;
          }
        }
      }
    }
    // Update menu logic here
  }
  draw() {
    screen.ctx.save();
    screen.center();
    screen.clear();
    wavePattern();
    drawOnamazu();
    screen.setFont(14);
    screen.ctx.fillStyle = "#fff";
    screen.fillText(title, 0, -28);

    screen.setFont(4, "sans-serif");

    switch (this.menu) {
      case "start":
        this.drawStart();
        break;
      case "continue":
        this.drawContinue();
        break;
      case "select":
        this.drawLevelSelect();
        break;
    }

    postprocessing();
    screen.ctx.restore();
  }
  drawStart() {
    screen.ctx.fillStyle = colors.ui;
    screen.fillText("Start", 0, -5);
  }
  drawContinue() {
    screen.ctx.fillStyle = this.selected ? "#fff" : colors.ui;
    screen.fillText("Intro", 0, -5);
    screen.ctx.fillStyle = this.selected ? colors.ui : "#fff";
    screen.fillText("Continue", 0, 0);
  }
  drawLevelSelect() {
    const width = 10;
    screen.setFont(3, "sans-serif");

    screen.fillText("Select Stage", 0, -12);
    screen.setFont(2, "sans-serif");
    for (let i = 0; i < islands.length; i++) {
      const x = (-(islands.length - 1) * width) / 2 + width * i;
      screen.ctx.fillStyle = this.selected === i ? colors.ui : "#fff";
      screen.fillText(islands[i], x, -7);
      const score = state.scores[i] ?? "-";

      screen.fillText(score, x, -3);
    }
    screen.setFont(3, "sans-serif");

    screen.ctx.fillStyle =
      this.selected === islands.length ? colors.ui : "#fff";
    screen.fillText("Return", 0, 5);
  }
}

const onamazuScale = new Vector2(1, 1).scale(3);
const drawOnamazu = () => {
  screen.ctx.lineCap = "round";
  screen.ctx.lineJoin = "round";
  onamazu.body.draw(new Vector2(0, -45), onamazuScale);
  onamazu.eyeL.draw(new Vector2(0, -45), onamazuScale);
  onamazu.eyeR.draw(new Vector2(0, -45), onamazuScale);
  onamazu.nostrilL.draw(new Vector2(0, -45), onamazuScale);
  onamazu.nostrilR.draw(new Vector2(0, -45), onamazuScale);
  onamazu.mouth.draw(new Vector2(0, -45), onamazuScale);

  screen.ctx.strokeStyle = "#e9ce97";
  screen.ctx.lineWidth = screen.scale * 0.3 * 9;
  for (let i = 0; i < 2; i += 1) {
    screen.ctx.beginPath();
    onamazu.whiskers.drawPath(i, new Vector2(0, -45), onamazuScale);
    screen.ctx.stroke();
  }

  screen.ctx.strokeStyle = "#222";
  screen.ctx.lineWidth = screen.scale * 0.3 * 6;
  for (let i = 0; i < 2; i += 1) {
    screen.ctx.beginPath();
    onamazu.whiskers.drawPath(i, new Vector2(0, -45), onamazuScale);
    screen.ctx.stroke();
  }
};
// #b0acdc #867edc
function wavePattern(radius = 10) {
  const lineWidth = screen.scale * 0.3 * 4;
  screen.ctx.fillStyle = "#867edc";
  screen.ctx.lineWidth = lineWidth;
  screen.ctx.strokeStyle = "#b0acdc";
  for (let y = 0; y <= (100 / radius) * 2; y += 1) {
    for (let x = 0; x <= 160 / radius; x += 1) {
      const position = new Vector2(
        (x + (y % 2) / 2) * radius * 2 - 80,
        (y * radius) / 2 - 45,
      );
      screen.ctx.beginPath();
      for (let i = 0; i < 4; i += 1) {
        drawCircle(position, radius - (radius / 3) * i);
      }
      screen.ctx.fill();
      screen.ctx.stroke();
    }
  }
}
