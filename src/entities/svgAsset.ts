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
  H: 1,
  V: 1,
};
const commandNames = {
  M: "moveTo",
  L: "lineTo",
  C: "bezierCurveTo",
  Z: "closePath",
  H: "lineTo",
  V: "lineTo",
} as const;

const getPoints = (
  arr: string[],
  count: number,
  command?: string,
  lastPos?: Vector2,
) => {
  if (!count) return [];
  const numbers = arr.splice(0, count).map(parseFloat);
  if (command === "H") {
    return [new Vector2(numbers[0], lastPos?.y || 0)];
  }
  if (command === "V") {
    return [new Vector2(lastPos?.x || 0, numbers[0])];
  }
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
    fill: (("v" | "h" | string | number)[] | undefined | string)[],
  ) {
    this.paths = pathData.split("\n").map((path) => {
      const commands: Path = [];
      const tokens = path.trim().match(tokenizer);
      if (!tokens) return commands;
      let lastCommand = "";
      while (tokens.length > 0) {
        let token = tokens[0];
        switch (token) {
          case "M":
          case "L":
          case "C":
          case "Z":
          case "H":
          case "V":
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
            token,
            commands.at(-1)?.points?.at(-1) || new Vector2(),
          ),
        });
      }
      return commands;
    });
    this.fill = fill;
    this.stroke = stroke;
  }
  draw(
    position: Vector2,
    scale = new Vector2(1, 1),
    rotation = 0,
    lineWidth = screen.scale * 0.3 * Math.min(scale.x, scale.y),
  ) {
    screen.ctx.save();
    screen.ctx.lineWidth = lineWidth;
    this.paths.forEach((path, i) => {
      screen.ctx.strokeStyle = this.stroke[i] || this.stroke[0]!;
      if (this.fill[i]) {
        if (Array.isArray(this.fill[i])) {
          const fill = this.fill[i].slice();
          let fillDirection = "v";
          if (fill[0] === "v" || fill[0] === "h") {
            fillDirection = fill.shift() as string;
          }
          const points = path
            .map(({ points }) =>
              points.map((point) =>
                fillDirection === "v" ? point.y : point.x,
              ),
            )
            .flat();
          let gradientParams: [number, number, number, number];
          if (fillDirection === "v") {
            gradientParams = [
              0,
              (Math.min(...points) * scale.y + position.y) * screen.scale,
              0,
              (Math.max(...points) * scale.y + position.y) * screen.scale,
            ];
          } else {
            gradientParams = [
              (Math.min(...points) * scale.x + position.x) * screen.scale,
              0,
              (Math.max(...points) * scale.x + position.x) * screen.scale,
              0,
            ];
          }
          const gradient = screen.ctx.createLinearGradient(...gradientParams);
          while (fill.length > 0) {
            gradient.addColorStop(...(fill.splice(0, 2) as [number, string]));
          }
          screen.ctx.fillStyle = gradient;
        } else {
          screen.ctx.fillStyle = this.fill[i];
        }
      }
      screen.ctx.beginPath();
      this.drawPath(i, position, scale, rotation);

      if (this.fill[i]) screen.ctx.fill();
      if (this.stroke[i] !== null) screen.ctx.stroke();
    });
    screen.ctx.restore();
  }
  drawPath(
    pathN: number,
    position: Vector2,
    scale = new Vector2(1, 1),
    rotation = 0,
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
