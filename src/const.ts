import type { FishProps } from "./entities/fish";
import type { NPC } from "./systems/npcs";

export const acceleration = 20;
export const maxSpeed = 30; // max dimension %
export const rotationSpeed = Math.PI * 8; // per second
export const minFrameDuration = 1 / 30;
export const thrashingCost = 30;
export const thrashingRadius = 20;

export const levelTime = 60;

export const animationDuration = {
  catch: 0.5,
  hit: 0.5,
  thrash: 0.5,
};

export const namazu: FishProps = {
  segmentLength: 45,
  segmentRadius: [49, 56, 58, 58, 53, 44, 35, 26, 22, 13, 13, 13],
  scale: 0.025,
  bodyLength: 10,
  palette: {
    outline: "#AAA",
    fins: "#333",
    body: "#222",
    eyeSclera: "skyblue",
    eyeIris: "#AAA",
    eyePupil: "black",
  },
  barbels: true,
};

export const multipliers = {
  fish: 1000,
  boat: 5000,
  time: 1000,
};

export const lsKey = "mzŌ25";

export const colors = {
  ui: "oklab(0.85 0.02 0.13 / 0.76)",
};

export const fontFamily = "Times New Roman, serif";

export const title = "Ōnamazu";
export const islands = ["Yaeyama", "Kikai", "Tokara", "Izu", "Jogashima"];

export const lines = {
  win: "People warned, quake foretold",
  lose: "Ouch.",
  lose1: "Disaster",
  time: "time remaining",
  fish: "fish eaten",
  boat: "boats overturned",
};

const fishPaletteBase = {
  outline: "#ebec4b",
  fins: "#333",
  body: "#d9d946",
  eyeSclera: "#32a255",
  eyeIris: "#AAA",
  eyePupil: "black",
};

const baseBody = {
  segmentLength: 45,
  segmentRadius: [49, 56, 58, 58, 53, 44, 35, 26, 22, 13, 13, 13],
  scale: 0.012,
  bodyLength: 10,
  palette: {
    ...fishPaletteBase,
  },
};

export const fishA: NPC = {
  body: baseBody,
  value: 20,
  speed: 0.6,
};

export const fishB: NPC = {
  body: {
    ...baseBody,
    palette: {
      ...fishPaletteBase,
      outline: "#e47051",
      body: "#c55335",
      eyeSclera: "#7ecedc",
    },
  },
  value: 40,
  speed: 0.4,
};
