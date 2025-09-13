import type { Level } from "@/systems/level";

export default {
  name: "Reef Maze",
  obstacles: [
    {
      type: "reef",
      position: [-40, 30],
    },
    {
      type: "reef",
      position: [40, -30],
    },
    {
      type: "reef",
      position: [0, 40],
    },
    {
      type: "reef",
      position: [-50, -40],
    },
    {
      type: "temple",
      position: [35, 35],
    },
    {
      type: "temple",
      position: [-35, -35],
    },
    {
      type: "temple",
      position: [0, -30],
    },
  ],
  npcs: [
    // Early fish waves
    {
      t: 1,
      variant: "fishA",
      position: [100, 20],
      path: [
        [20, 20],
        [-20, -20],
        [-120, -30],
      ],
      amount: 4,
      scatter: 12,
    },
    {
      t: 2,
      variant: "fishA",
      position: [-100, -20],
      path: [
        [-20, -20],
        [30, 30],
        [120, 40],
      ],
      amount: 3,
      scatter: 10,
    },
    {
      t: 3,
      variant: "fishB",
      position: [0, 80],
      path: [
        [0, 20],
        [-30, 10],
        [-30, -10],
        [30, -10],
        [30, 10],
      ],
      cycle: true,
      amount: 2,
      scatter: 8,
    },
    // First boat
    {
      t: 4,
      variant: "boat",
      position: [110, 10],
      path: [[-130, 10]],
    },
    // Mid-game fish spawns
    {
      t: 6,
      variant: "fishA",
      position: [90, -50],
      path: [
        [15, -15],
        [-15, 15],
        [-110, 30],
      ],
      amount: 5,
      scatter: 15,
    },
    {
      t: 8,
      variant: "fishB",
      position: [-90, 50],
      path: [
        [-15, 15],
        [20, -20],
        [130, -50],
      ],
      amount: 3,
      scatter: 12,
    },
    {
      t: 10,
      variant: "fishA",
      position: [0, -80],
      path: [
        [0, -20],
        [25, -10],
        [25, 10],
        [-25, 10],
        [-25, -10],
      ],
      cycle: true,
      amount: 4,
      scatter: 10,
    },
    // Second boat
    {
      t: 12,
      variant: "boat",
      position: [-110, -30],
      path: [[130, -30]],
    },
    // Late game fish for final push
    {
      t: 15,
      variant: "fishB",
      position: [100, 0],
      path: [
        [30, 0],
        [0, 20],
        [-30, 0],
        [0, -20],
      ],
      cycle: true,
      amount: 3,
      scatter: 8,
    },
    {
      t: 18,
      variant: "fishA",
      position: [-100, 20],
      path: [
        [-30, 10],
        [30, -10],
        [120, -40],
      ],
      amount: 6,
      scatter: 18,
    },
    // Third boat
    {
      t: 20,
      variant: "boat",
      position: [110, 40],
      path: [[-130, 40]],
    },
    // Final fish wave
    {
      t: 25,
      variant: "fishB",
      position: [0, 70],
      path: [
        [0, 10],
        [-40, 0],
        [0, -10],
        [40, 0],
      ],
      cycle: true,
      amount: 2,
      scatter: 5,
    },
  ],
  attacks: [
    // Early scattered rocks
    {
      t: 3,
      type: "rock",
      position: "random",
      amount: 6,
      stagger: 0.8,
    },
    // Player-targeted rocks
    {
      t: 5,
      type: "rock",
      position: "player",
      amount: 4,
      scatter: 25,
    },
    // Parallel spear attack pattern
    [
      {
        t: 7,
        type: "spear",
        position: [-60, 0],
        rotation: 0,
        amount: 1,
      },
      {
        t: 7,
        type: "spear",
        position: [0, 0],
        rotation: 0,
        amount: 1,
      },
      {
        t: 7,
        type: "spear",
        position: [60, 0],
        rotation: 0,
        amount: 1,
      },
    ],
    // More player targeting
    {
      t: 9,
      type: "rock",
      position: "player",
      amount: 6,
      scatter: 20,
      stagger: 0.5,
    },
    // Diagonal stone line pattern
    [
      {
        t: 11,
        type: "rock",
        position: [-40, -40],
        amount: 1,
      },
      {
        t: 11.2,
        type: "rock",
        position: [-20, -20],
        amount: 1,
      },
      {
        t: 11.4,
        type: "rock",
        position: [0, 0],
        amount: 1,
      },
      {
        t: 11.6,
        type: "rock",
        position: [20, 20],
        amount: 1,
      },
      {
        t: 11.8,
        type: "rock",
        position: [40, 40],
        amount: 1,
      },
    ],
    // Random spear barrage
    {
      t: 14,
      type: "spear",
      position: "random",
      rotation: "random",
      amount: 8,
      stagger: 1,
    },
    // Cross pattern spears
    [
      {
        t: 16,
        type: "spear",
        position: [0, 0],
        rotation: 0,
        amount: 1,
      },
      {
        t: 16,
        type: "spear",
        position: [0, 0],
        rotation: 0.5,
        amount: 1,
      },
      {
        t: 16,
        type: "spear",
        position: [0, 0],
        rotation: 1,
        amount: 1,
      },
      {
        t: 16,
        type: "spear",
        position: [0, 0],
        rotation: 1.5,
        amount: 1,
      },
    ],
    // Heavy rock bombardment
    {
      t: 18,
      type: "rock",
      position: "random",
      amount: 12,
      stagger: 0.3,
    },
    // Final coordinated assault
    {
      t: 22,
      type: "rock",
      position: "player",
      amount: 8,
      scatter: 30,
      stagger: 0.4,
    },
    // Last wave of spears
    {
      t: 25,
      type: "spear",
      position: "player",
      rotation: "random",
      amount: 6,
      scatter: 35,
      stagger: 0.6,
    },
  ],
} as Level;
