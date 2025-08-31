import { init } from "./game.ts";
import "./style.css";

const canvas = document.getElementById("c") as HTMLCanvasElement;

window.addEventListener("load", () => {
  init(canvas);
});
