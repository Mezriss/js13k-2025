import type { FishProps } from "./entities/fish";

export const acceleration = 20;
export const maxSpeed = 30; // max dimension %
export const rotationSpeed = Math.PI * 8; // per second
export const minFrameDuration = 1 / 30;
export const thrashingCost = 30;
export const thrashingRadius = 20;

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
};

export const multipliers = {
  fish: 1000,
  boat: 5000,
  bell: 50000,
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
  bell: "bells rung",
  fish: "fish eaten",
  boat: "boats overturned",
};
