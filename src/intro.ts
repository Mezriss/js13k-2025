import { colors } from "./const";
import type { Result } from "./main";
import { state } from "./state";
import { screen } from "./util/draw";
import { postprocessing } from "./util/noise";
import { wavePattern } from "./util/waves";
import { keyEvents } from "./util/keyboard";
import { drawOnamazu } from "./assets/onamazu";
import { Vector2 } from "./util/vector2";
import { drawFisherman } from "./assets/fisherman";
import spear from "./assets/spear";

const script = [
  {
    from: "Narrator",
    text: `It was this time again
the time for giant black catfish, Ōnamazu, to awaken from its slumber.`,
  },

  {
    from: "Ōnamazu",
    text: `Ahh... so it begins once more.`,
  },

  {
    from: "Ōnamazu",
    text: `The earth is trembling, but there is no one to warn its people.
And even Ebisu is missing... perhaps asleep again?`,
  },

  {
    from: "Ōnamazu",
    text: `Then I shall thrash about until the temple bells ring!
That way, everyone will know what’s coming.`,
  },

  {
    from: "Ōnamazu",
    text: `…But first, I’m a little peckish.
Thrashing takes energy, so I’d better eat all the fish around here.`,
  },

  {
    from: "Fisherman",
    text: `You sneaky fish!`,
  },

  {
    from: "Ōnamazu",
    text: `Wha...`,
  },

  {
    from: "Fisherman",
    text: `You waited until our guardian gods left for the Grand Shrine,
and now you dare to wreak havoc again!`,
  },

  {
    from: "Narrator",
    text: `A major misunderstanding has ensued.`,
  },

  {
    from: "Fisherman",
    text: `Get him!`,
  },

  {
    from: "Ōnamazu",
    text: `Now you've done it! I'm going to thrash!
All over you!`,
  },

  {
    from: "Narrator",
    text: `And so, the story begins.`,
  },
];

const charDelay = 0.03;

export class Intro {
  t = 0;
  scriptIndex = 0;
  currentText = "";
  currentNarrator = "";
  get progress() {
    return (
      1 - Math.min(this.t / script[this.scriptIndex].text.length / charDelay, 1)
    );
  }
  update(dt: number): Result {
    this.t += dt;
    const action = !!keyEvents.find((e) => e[0] === "action");
    keyEvents.splice(0);
    this.currentNarrator = script[this.scriptIndex].from;
    this.currentText = script[this.scriptIndex].text.slice(
      0,
      (this.t / charDelay) | 0,
    );

    if (!action) return;

    if (this.currentText === script[this.scriptIndex].text) {
      this.scriptIndex += 1;
      this.currentText = "";
      this.t = 0;
    } else {
      this.currentText = script[this.scriptIndex].text;
      this.t = this.currentText.length * charDelay;
    }

    if (this.scriptIndex >= script.length) {
      if (state.intro) {
        return "menu";
      }
      state.intro = true;
      return 0;
    }
  }
  draw() {
    screen.ctx.save();
    screen.center();
    screen.clear();
    wavePattern();

    if (this.scriptIndex >= 1) {
      const position = new Vector2(0, -60);
      if (this.scriptIndex === 1) {
        position.y -= 40 * this.progress;
      }
      drawOnamazu(2, position);
    }

    if (this.scriptIndex >= 5) {
      const position = new Vector2(75, 45);
      if (this.scriptIndex === 5) {
        position.x += 20 * this.progress;
      }
      drawFisherman(0.4, position);
    }

    if (this.scriptIndex >= 9) {
      const position = new Vector2(85, 45);
      let spearOffset = 0;
      if (this.scriptIndex === 9) {
        position.x += 20 * this.progress;
        spearOffset = 40 * this.progress;
      }
      spear.draw(new Vector2(-20, 20 + spearOffset), new Vector2(2, 2));
      spear.draw(new Vector2(0, 15 + spearOffset), new Vector2(2, 2));
      spear.draw(new Vector2(20, 20 + spearOffset), new Vector2(2, 2));

      screen.ctx.save();
      screen.ctx.translate(position.x, position.y);
      screen.ctx.scale(-1, 1);
      drawFisherman(0.4, position);
      screen.ctx.restore();
    }

    screen.ctx.fillStyle = "rgba(0,0,0,0.5)";
    screen.ctx.fillRect(
      ...([-55, 15, 110, 20].map((x) => x * screen.scale) as [
        number,
        number,
        number,
        number,
      ]),
    );
    screen.setFont(3, "sans-serif", "bold", "left");
    screen.ctx.fillStyle = colors.ui;
    screen.fillText(this.currentNarrator, -50, 20);
    screen.ctx.fillStyle = "#fff";
    this.currentText.split("\n").forEach((line, index) => {
      screen.fillText(line, -50, 25 + index * 5);
    });

    if (this.currentText === script[this.scriptIndex].text) {
      screen.setFont(2, "sans-serif");
      screen.ctx.fillStyle = colors.ui;
      screen.fillText("[space]", 50, 33);
    }

    postprocessing();
    screen.ctx.restore();
  }
}
