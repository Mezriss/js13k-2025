import type { Level } from "@/systems/level";

export default {
  name: "Test level",
  obstacles: [
    {
      type: "reef",
      position: [-20, -20],
    },
    {
      type: "reef",
      position: [20, 20],
    },
    {
      type: "temple",
      position: [0, 0],
    },
  ],
  npcs: [
    {
      t: 2,
      variant: "fishA",
      position: [-60, -50],
      path: [
        [-30, -30],
        [-30, 30],
        [25, 25],
        [30, -30],
      ],
      cycle: true,
      amount: 10,
      scatter: 15,
    },
  ],
  attacks: [
    {
      t: 1,
      type: "rock",
      position: "player",
      amount: 60,
      stagger: 1,
    },
  ],
} as Level;
