//6065
// 6325
// 6629

import { cmax } from "@/util/draw";
import { Vector2 } from "@/util/vector2";

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
  paths: {
    command: (typeof commandNames)[keyof typeof commandNames];
    points: Vector2[];
  }[][];
  stroke: string[];
  fill: ((string | number)[] | undefined)[];

  constructor(
    pathData: string,
    stroke: string[],
    fill: ((string | number)[] | undefined)[],
  ) {
    this.paths = pathData.split("\n").map((path) => {
      const commands: {
        command: (typeof commandNames)[keyof typeof commandNames];
        points: Vector2[];
      }[] = [];
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
            token = lastCommand;
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
  draw(
    ctx: CanvasRenderingContext2D,
    position: Vector2,
    scale = 1,
    rotation = 0,
  ) {
    ctx.lineWidth = cmax(0.03 * scale);
    this.paths.forEach((path, i) => {
      ctx.strokeStyle = this.stroke[i] || this.stroke[0];
      //if (this.fill[i]) ctx.fillStyle = this.fill[i];
      ctx.beginPath();
      path.forEach(({ command, points }) => {
        ctx[command](
          ...(points
            .map(
              (point) =>
                point
                  .clone()
                  .scale(scale)
                  .add(position)
                  .rotateAround(position, rotation).xy,
            )
            .flat() as [number, number, number, number, number, number]),
        );
      });
      if (this.fill[i]) ctx.fill();
      ctx.stroke();
    });
  }
}
