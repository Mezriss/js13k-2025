import { init } from "./game.ts";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <canvas id="c" width="1024" height="768"/>
  </div>
`;

const canvas = document.getElementById("c") as HTMLCanvasElement;

init(canvas);
