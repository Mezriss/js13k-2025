import type { NPC } from "./systems/npcs";

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
  speed: 0.6,
};
