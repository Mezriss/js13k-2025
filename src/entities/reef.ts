import reefAsset from "@/assets/reef";
import waveAsset from "@/assets/wave";
import { easing, toRad } from "@/util/util";
import { Vector2 } from "@/util/vector2";
import { Polygon } from "./polygon";

const reefScale = new Vector2(1, 1);

export class Reef {
  position: Vector2;
  collider: Polygon;
  t = 0;
  constructor(position: Vector2) {
    this.position = position;
    const bounds: Vector2[] = [];
    reefAsset.paths[0].forEach(({ command, points }) => {
      switch (command) {
        case "moveTo":
          bounds.push(points[0].clone().multiply(reefScale));
          break;
        case "lineTo":
          bounds.push(points[0].clone().multiply(reefScale));
          break;
        case "bezierCurveTo":
          bounds.push(points[2].clone().multiply(reefScale));
          break;
      }
    });
    this.collider = new Polygon(position, bounds, 0);
  }
  update(dt: number) {
    this.t += dt;
  }
  draw() {
    reefAsset.draw(this.position, reefScale);

    const offset = easing.parabolic((this.t / 4) % 1) / 2.5;
    waveAsset.draw(
      this.position
        .clone()
        .add(new Vector2(-6, 4.5 - offset).multiply(reefScale)),
      new Vector2(0.7, 1.2).multiply(reefScale),
      toRad(4),
    );
    waveAsset.draw(
      this.position
        .clone()
        .add(new Vector2(7, 5.5 - offset).multiply(reefScale)),
      new Vector2(0.8, 1).multiply(reefScale),
      toRad(10),
    );
    waveAsset.draw(
      this.position
        .clone()
        .add(new Vector2(-0.5, 6 - offset).multiply(reefScale)),
      new Vector2(1, 1).multiply(reefScale),
      toRad(-5),
    );
    this.collider.debugDraw();
  }
}
