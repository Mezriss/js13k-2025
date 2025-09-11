import { screen } from "./draw";
import { drawCircle } from "./draw";
import { Vector2 } from "./vector2";

export function wavePattern(radius = 10) {
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
