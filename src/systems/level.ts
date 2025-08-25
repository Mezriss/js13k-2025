import { Polygon } from "../entities/polygon";
import type { State } from "../game";
import { Vector2 } from "../util/vector2";

export const loadLevel = (state: State) => {
  state.obstacles.push(
    new Polygon(
      new Vector2(100, 100),
      [
        new Vector2(0, 0),
        new Vector2(100, 0),
        new Vector2(100, 100),
        new Vector2(0, 100),
      ],
      Math.PI / 4,
    ),
  );
};
