import { screen } from "@/util/draw";

const TILE_SIZE = 128;

const offscreenCanvas = document.createElement("canvas");
offscreenCanvas.width = TILE_SIZE;
offscreenCanvas.height = TILE_SIZE;
const offscreenCtx = offscreenCanvas.getContext("2d")!;

const imageData = offscreenCtx.createImageData(TILE_SIZE, TILE_SIZE);
const data = imageData.data;

for (let i = 0; i < data.length; i += 1) {
  if (Math.random() > 0.8) {
    data[i] = i % 4 ? Math.floor(Math.random() * 60) + 180 : 40; /// R=G=B A=40
  }
}

offscreenCtx.putImageData(imageData, 0, 0);
export default screen.ctx.createPattern(offscreenCanvas, "repeat")!;
