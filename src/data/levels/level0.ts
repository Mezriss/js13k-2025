import type { Level } from "@/systems/level";

export default {
  name: "Test level",
  obstacles: [
    {
      type: "rock",
      shape: [
        [0, 0],
        [0, 10],
        [10, 10],
        [10, 0],
      ],
      position: [-20, -20],
      rotation: 0.25,
    },
    {
      type: "rock",
      shape: [
        [0, 0],
        [0, 10],
        [10, 10],
        [10, 0],
      ],
      position: [20, 20],
      rotation: -0.25,
    },
  ],
  npcs: [
    {
      t: 2,
      variant: "test",
      position: [-40, -40],
      path: [
        [-30, -30],
        [-30, 30],
        [25, 25],
        [30, -30],
      ],
      cycle: true,
      amount: 3,
      scatter: 5,
    },
  ],
  attacks: [
    {
      t: 2,
      type: "rock",
      position: "random",
      amount: 5,
    },
    [
      {
        t: 2,
        type: "spear",
        position: "player",
        amount: 2,
        rotation: [0, 0.5],
      },
      {
        t: 1,
        type: "spear",
        position: "player",
        amount: 2,
        rotation: [0.25, 0.75],
        stagger: 0.5,
      },
    ],
    {
      t: 2,
      type: "rock",
      position: "random",
      amount: 5,
    },
    {
      t: 2,
      stagger: 0.5,
      type: "rock",
      position: "player",
      amount: 3,
      scatter: 2,
    },
  ],
} as Level;
