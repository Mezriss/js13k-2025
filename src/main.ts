import { init } from "./kinematicsTest.ts";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <canvas id="c" width="800" height="600"/>
  </div>
`;

const canvas = document.getElementById("c") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

init(canvas, ctx);
