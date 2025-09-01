import type { NPC } from "./systems/npcs";
import { Vector2 } from "./util/vector2";

export const testNPC: NPC = {
  body: {
    segmentLength: 45,
    segmentRadius: [49, 56, 58, 58, 53, 44, 35, 26, 22, 13, 13, 13],
    scale: 0.012,
    bodyLength: 10,
    palette: {
      outline: "#AAA",
      fins: "#333",
      body: "yellow",
      eyeSclera: "red",
      eyeIris: "#AAA",
      eyePupil: "black",
    },
  },
  value: 20,
  speed: 0.8,
};

export const testBoulder = [
  [-3, -1],
  [-1, -3],
  [2, -2],
  [3, 1],
  [1, 3],
  [-1, 3],
  [-3, 1],
  [-3, -1],
].map((p) => new Vector2(...(p as [number, number])));

export const testRectangle = () =>
  [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map((p) =>
    new Vector2(...(p as [number, number])).multiply(new Vector2(50, 2)),
  );
