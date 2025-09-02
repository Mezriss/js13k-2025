import { screen } from "@/util/draw";
import { Vector2 } from "@/util/vector2";

export type Path = {
  command: (typeof commandNames)[keyof typeof commandNames];
  points: Vector2[];
}[];

const tokenizer = /[A-Z]|[+-]?\d*\.?\d+/g;
const paramCount = {
  M: 2,
  L: 2,
  C: 6,
  Z: 0,
};
const commandNames = {
  M: "moveTo",
  L: "lineTo",
  C: "bezierCurveTo",
  Z: "closePath",
} as const;

const getPoints = (arr: string[], count: number) => {
  if (!count) return [];
  const numbers = arr.splice(0, count).map(parseFloat);
  const vectors = [];
  for (let i = 0; i < numbers.length; i += 2) {
    vectors.push(new Vector2(numbers[i], numbers[i + 1]));
  }
  return vectors;
};

export class SvgAsset {
  paths: Path[];
  stroke: (string | undefined | null)[];
  fill: ((string | number)[] | undefined | string)[];

  constructor(
    pathData: string,
    stroke: (string | undefined | null)[],
    fill: ((string | number)[] | undefined | string)[],
  ) {
    this.paths = pathData.split("\n").map((path) => {
      const commands: Path = [];
      path.trim();
      const tokens = path.match(tokenizer);
      if (!tokens) return commands;
      let lastCommand = "";
      while (tokens.length > 0) {
        let token = tokens[0];
        switch (token) {
          case "M":
          case "L":
          case "C":
          case "Z":
            lastCommand = tokens.shift()!;
            break;
          default:
            token = lastCommand === "M" ? "L" : lastCommand;
        }
        commands.push({
          command: commandNames[token as keyof typeof commandNames],
          points: getPoints(
            tokens,
            paramCount[token as keyof typeof paramCount],
          ),
        });
      }
      return commands;
    });
    this.fill = fill;
    this.stroke = stroke;
  }
  draw(position: Vector2, scale = new Vector2(1, 1), rotation = 0) {
    screen.ctx.lineWidth = 2.5 * Math.min(scale.x, scale.y);
    this.paths.forEach((path, i) => {
      screen.ctx.strokeStyle = this.stroke[i] || this.stroke[0]!;
      if (this.fill[i]) {
        if (Array.isArray(this.fill[i])) {
          const fill = this.fill[i].slice();
          const pointsY = path.map(({ points }) =>
            points.map((point) => point.y),
          );
          const min = Math.min(...pointsY.flat()) * scale.y + position.y;
          const max = Math.max(...pointsY.flat()) * scale.y + position.y;
          const gradient = screen.ctx.createLinearGradient(
            0,
            min * screen.scale,
            0,
            max * screen.scale,
          );
          while (fill.length > 0) {
            gradient.addColorStop(...(fill.splice(0, 2) as [number, string]));
          }
          screen.ctx.fillStyle = gradient;
        } else {
          screen.ctx.fillStyle = this.fill[i];
        }
      }
      screen.ctx.beginPath();
      this.drawPath(i, position, rotation, scale);

      if (this.fill[i]) screen.ctx.fill();
      if (this.stroke[i] !== null) screen.ctx.stroke();
    });
  }
  drawPath(
    pathN: number,
    position: Vector2,
    rotation = 0,
    scale = new Vector2(1, 1),
  ) {
    this.paths[pathN].forEach(({ command, points }) => {
      screen[command](
        ...(points
          .map(
            (point) =>
              point
                .clone()
                .multiply(scale)
                .add(position)
                .rotateAround(position, rotation).xy,
          )
          .flat() as [number, number, number, number, number, number]),
      );
    });
  }
}
