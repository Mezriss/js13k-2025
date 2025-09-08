import { colors } from "@/const";
import type { LevelState } from "../game";
import { drawCircle } from "../util/draw";
import { easing, Tweened } from "../util/util";
import { Vector2 } from "../util/vector2";
import { screen } from "@/util/draw";

export class UI {
  hp: number;
  score: Tweened;
  energy: Tweened;

  constructor(state: LevelState) {
    this.hp = state.player.hp;
    this.score = new Tweened(state.player.score, 0.5, easing.linear);
    this.energy = new Tweened(state.player.energy);
  }

  update(state: LevelState, dt: number) {
    this.hp = state.player.hp;
    this.score.update(state.player.score, dt);
    this.energy.update(state.player.energy, dt);
  }

  draw() {
    screen.ctx.fillStyle = colors.ui;
    screen.ctx.strokeStyle = colors.ui;
    this.drawHP();
    this.drawScore();
    this.drawEnergy();
  }
  drawHP() {
    for (let i = 0; i < this.hp; i++) {
      screen.ctx.beginPath();
      drawCircle(new Vector2(-75 + i * 3, -40), 1);
      screen.ctx.fill();
    }
  }
  drawScore() {
    screen.ctx.font = `${Math.floor(screen.scale * 3)}px Arial`;
    screen.ctx.textAlign = "right";
    screen.ctx.textBaseline = "middle";
    screen.fillText(
      Math.floor(Math.floor(this.score.value)).toString().padStart(6, "0"),
      75,
      -40,
    );
  }
  drawEnergy() {
    screen.ctx.lineWidth = 1;
    screen.ctx.beginPath();
    const outline: [number, number][] = [
      [-30, 38],
      [30, 38],
      [30, 43],
      [-30, 43],
    ];
    screen.moveTo(...outline[0]);

    outline.forEach(([x, y]) => {
      screen.lineTo(x, y);
    });
    screen.ctx.closePath();
    screen.ctx.stroke();

    screen.ctx.beginPath();
    const bar: [number, number][] = [
      [-29, 39],
      [-29 + (58 * this.energy.value) / 100, 39],
      [-29 + (58 * this.energy.value) / 100, 42],
      [-29, 42],
    ];
    screen.moveTo(...bar[0]);
    bar.forEach(([x, y]) => {
      screen.lineTo(x, y);
    });
    screen.ctx.closePath();
    screen.ctx.fill();
  }
}
