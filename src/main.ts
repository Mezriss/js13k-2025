import { init } from "./kinematicsTest.ts";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <canvas id="c" width="800" height="600"/>
  </div>
`;

const canvas = document.getElementById("c") as HTMLCanvasElement;

init(canvas);
