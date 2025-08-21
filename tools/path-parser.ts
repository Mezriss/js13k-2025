#!/usr/bin/env node

type Point = [number, number];

function parseSimpleSvgPath(pathData: string): Point[] {
  if (!pathData || typeof pathData !== "string") {
    console.warn("Warning: Input pathData must be a non-empty string.");
    return [];
  }

  const commandChunks = pathData.match(/[MLZ][^MLZ]*/gi);

  if (!commandChunks) {
    return [];
  }

  const points: Point[] = [];
  let firstPointInSubpath: Point | null = null;

  const numberRegex = /-?\d+(\.\d+)?/g;

  for (const chunk of commandChunks) {
    const command = chunk[0].toUpperCase();
    const argsString = chunk.substring(1).trim();
    const args = (argsString.match(numberRegex) || []).map(Number);

    if (command === "M") {
      if (args.length < 2) continue;

      const startPoint: Point = [args[0], args[1]];
      points.push(startPoint);
      firstPointInSubpath = startPoint;

      for (let i = 2; i < args.length; i += 2) {
        if (args[i + 1] !== undefined) {
          points.push([args[i], args[i + 1]]);
        }
      }
    } else if (command === "L") {
      for (let i = 0; i < args.length; i += 2) {
        if (args[i + 1] !== undefined) {
          points.push([args[i], args[i + 1]]);
        }
      }
    } else if (command === "Z") {
      if (firstPointInSubpath) {
        points.push(firstPointInSubpath);
      }
      firstPointInSubpath = null;
    }
  }

  return points;
}

const pathString = process.argv[2];

if (!pathString) {
  process.exit(1); // Exit with an error code
}

const points = parseSimpleSvgPath(pathString);
console.log(JSON.stringify(points));
