import { screen } from "./util/draw";
import { keyEvents } from "./util/keyboard";
import { state } from "./state";
import { colors } from "./const";

const title = "Ōnamazu";
const islands = ["Yaeyama", "Kikai", "Tokara", "Izu", "Jogashima"];

const lineHeight = 6;

const font = (size: number) =>
  `${Math.floor(screen.scale * size)}px Times New Roman, serif`;

export class Menu {
  menu: "start" | "continue" | "select" = "start";
  selected: number = 0;
  constructor() {
    if (state.intro) {
      this.menu = "continue";
      this.selected = 1;
    } else {
      this.menu = "start";
    }
  }
  update(_dt: number) {
    const now = Date.now();
    while (keyEvents.length > 0) {
      const [event, timestamp] = keyEvents.shift()!;
      if (now - timestamp > 1000) continue;
      if (this.menu === "start" && event === "action") {
        console.info("starting intro");
      }
      if (this.menu === "continue") {
        if (event === "action") {
          switch (this.selected) {
            case 0:
              console.info("starting intro");
              break;
            case 1:
              this.menu = "select";
              this.selected = 0;
              break;
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
            console.info("starting level", this.selected);
          }
        } else {
          switch (event) {
            case "up":
            case "down":
              console.info("up/down");
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

    screen.ctx.font = "bold " + font(8);
    screen.ctx.textAlign = "center";
    screen.ctx.textBaseline = "middle";
    screen.ctx.fillStyle = "#fff";

    let y = 0;
    screen.fillText(title, 0, 0);
    y += lineHeight * 1.5;

    screen.ctx.font = font(4);
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

    screen.ctx.restore();
  }
  drawStart() {
    screen.ctx.fillStyle = colors.ui;
    screen.fillText("Start", 0, lineHeight * 1.5);
  }
  drawContinue() {
    screen.ctx.fillStyle = this.selected ? "#fff" : colors.ui;
    screen.fillText("Intro", 0, lineHeight * 1.5);
    screen.ctx.fillStyle = this.selected ? colors.ui : "#fff";
    screen.fillText("Continue", 0, lineHeight * 2.5);
  }
  drawLevelSelect() {
    const width = 20;
    screen.fillText("Select Stage", 0, lineHeight * 1.5);
    for (let i = 0; i < islands.length; i++) {
      const x = (-(islands.length - 1) * width) / 2 + width * i;
      screen.ctx.fillStyle = this.selected === i ? colors.ui : "#fff";
      screen.fillText(islands[i], x, lineHeight * 2.5);
    }
    screen.ctx.fillStyle =
      this.selected === islands.length ? colors.ui : "#fff";
    screen.fillText("Return", 0, lineHeight * 4.5);
  }
}
