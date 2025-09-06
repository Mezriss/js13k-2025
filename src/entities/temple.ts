import { Vector2 } from "@/util/vector2";
import { Polygon } from "./polygon";
import island from "@/assets/island";
import support from "@/assets/support";
import bell from "@/assets/bell";
import wave from "@/assets/wave";
import { easing, getBounds, toRad } from "@/util/util";

const scale = new Vector2(1, 1);

export class Temple {
  position: Vector2;
  collider: Polygon;
  t = 0;

  constructor(position: Vector2) {
    this.position = position;
    this.collider = new Polygon(position, getBounds(island.paths[0], scale));
  }
  update(dt: number) {
    this.t += dt;
  }
  draw() {
    island.draw(this.position, scale);

    const offset = easing.parabolic((this.t / 4) % 1) / 2.5;

    wave.draw(
      this.position.clone().add(new Vector2(-6, 1.5 - offset).multiply(scale)),
      new Vector2(0.7, 1.2).multiply(scale).scale(1),
      toRad(4),
    );
    wave.draw(
      this.position.clone().add(new Vector2(7, 2 - offset).multiply(scale)),
      new Vector2(0.8, 1).multiply(scale).scale(1),
      toRad(10),
    );
    wave.draw(
      this.position
        .clone()
        .add(new Vector2(-0.5, 2.2 - offset).multiply(scale)),
      new Vector2(1, 1).multiply(scale).scale(1),
      toRad(-5),
    );
  }
  drawForeground() {
    support.draw(this.position, scale);
    bell.draw(this.position.clone().add(new Vector2(0, -0.21)), scale);
  }
}
