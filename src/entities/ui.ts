import type { State } from "../game";
import { ch, cmin, cw, drawCircle } from "../util/draw";
import { easing, Tweened } from "../util/util";
import { Vector2 } from "../util/vector2";

export class UI {
  hp: number;
  score: Tweened;
  energy: Tweened;

  constructor(state: State) {
    this.hp = state.player.hp;
    this.score = new Tweened(state.player.score, 0.5, easing.linear);
    this.energy = new Tweened(state.player.energy);
  }

  update(state: State, dt: number) {
    this.hp = state.player.hp;
    this.score.update(state.player.score, dt);
    this.energy.update(state.player.energy, dt);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "oklab(0.85 0.02 0.13 / 0.76)";
    ctx.strokeStyle = "oklab(0.85 0.02 0.13 / 0.76)";
    this.drawHP(ctx);
    this.drawScore(ctx);
    this.drawEnergy(ctx);
  }
  drawHP(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.hp; i++) {
      ctx.beginPath();
      drawCircle(ctx, new Vector2(cw(-45 + i * 2), ch(-45)), cmin(1));
      ctx.fill();
    }
  }
  drawScore(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(
      Math.floor(Math.floor(this.score.value)).toString().padStart(6, "0"),
      cw(45),
      ch(-45),
    );
  }
  drawEnergy(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = cmin(0.2);
    ctx.beginPath();
    const outline: [number, number][] = [
      [cw(-30), ch(40)],
      [cw(30), ch(40)],
      [cw(30), ch(45)],
      [cw(-30), ch(45)],
    ];
    ctx.moveTo(...outline[0]);

    outline.forEach(([x, y]) => {
      ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    const bar: [number, number][] = [
      [cw(-29), ch(41)],
      [cw(-29 + (58 * this.energy.value) / 100), ch(41)],
      [cw(-29 + (58 * this.energy.value) / 100), ch(44)],
      [cw(-29), ch(44)],
    ];
    ctx.moveTo(...bar[0]);
    bar.forEach(([x, y]) => {
      ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  }
}
