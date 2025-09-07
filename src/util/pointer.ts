import { Vector2 } from "./vector2";
import { screen } from "./draw";

export const pointerEvents: [Vector2, number][] = [];
export const pointerPosition = new Vector2();

const getCoords = (event: PointerEvent) => {
  return new Vector2(
    event.offsetX / screen.scale - 80,
    event.offsetY / screen.scale - 45,
  );
};

screen.ctx.canvas.addEventListener("pointermove", (event) => {
  pointerPosition.copy(getCoords(event));
});

screen.ctx.canvas.addEventListener("pointerdown", (event) => {
  pointerEvents.push([getCoords(event), Date.now()]);
  console.info(pointerEvents);
});
