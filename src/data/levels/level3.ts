import type { Level } from "@/systems/level";

export default {
  name: "Abyssal Gauntlet",
  obstacles: [
    // Create a maze-like structure with strategic chokepoints
    {
      type: "reef",
      position: [-45, 35],
    },
    {
      type: "reef",
      position: [45, -35],
    },
    {
      type: "reef",
      position: [-25, -40],
    },
    {
      type: "reef",
      position: [25, 40],
    },
    {
      type: "reef",
      position: [0, -15],
    },
    {
      type: "reef",
      position: [-55, 0],
    },
    // Two temples requiring 200 points total
    {
      type: "temple",
      position: [40, 20],
    },
    {
      type: "temple",
      position: [-40, -20],
    },
  ],
  npcs: [
    // Early game - easier fish to get started
    {
      t: 1,
      variant: "fishA",
      position: [100, 30],
      path: [
        [30, 25],
        [10, 0],
        [-30, -25],
        [-120, -35],
      ],
      amount: 4,
      scatter: 12,
    },
    {
      t: 2,
      variant: "fishB",
      position: [-100, -30],
      path: [
        [-30, -25],
        [-10, 0],
        [30, 25],
        [120, 35],
      ],
      amount: 2,
      scatter: 10,
    },

    // First boat early
    {
      t: 3,
      variant: "boat",
      position: [115, 45],
      path: [[-135, 45]],
    },

    // Mid-early game - fish through tight spaces
    {
      t: 4,
      variant: "fishA",
      position: [0, 80],
      path: [
        [0, 25],
        [-20, 10],
        [-10, -30],
        [10, -30],
        [20, 10],
        [0, -90],
      ],
      amount: 5,
      scatter: 8,
    },

    {
      t: 5,
      variant: "fishB",
      position: [90, -10],
      path: [
        [20, -10],
        [-10, -5],
        [-20, 5],
        [-130, 15],
      ],
      amount: 3,
      scatter: 12,
    },

    // Second boat
    {
      t: 7,
      variant: "boat",
      position: [-115, 25],
      path: [[135, 25]],
    },

    // Cycling fish in danger zones
    {
      t: 8,
      variant: "fishA",
      position: [0, 60],
      path: [
        [0, 30],
        [35, 15],
        [35, -15],
        [-35, -15],
        [-35, 15],
      ],
      cycle: true,
      amount: 6,
      scatter: 15,
    },

    {
      t: 10,
      variant: "fishB",
      position: [-90, 40],
      path: [
        [-20, 20],
        [20, 10],
        [40, -20],
        [130, -30],
      ],
      amount: 2,
      scatter: 8,
    },

    // Third boat with different timing
    {
      t: 12,
      variant: "boat",
      position: [115, -40],
      path: [[-135, -40]],
    },

    // More challenging fish spawns
    {
      t: 14,
      variant: "fishA",
      position: [0, -80],
      path: [
        [0, -30],
        [30, -10],
        [15, 20],
        [-15, 20],
        [-30, -10],
        [0, 90],
      ],
      cycle: true,
      amount: 7,
      scatter: 18,
    },

    {
      t: 16,
      variant: "fishB",
      position: [100, 0],
      path: [
        [30, 0],
        [10, 25],
        [-10, 25],
        [-30, 0],
        [-130, -10],
      ],
      amount: 3,
      scatter: 10,
    },

    // Fourth boat - overlapping with others
    {
      t: 18,
      variant: "boat",
      position: [-115, -35],
      path: [[135, -35]],
    },

    // Late game high-value fish in dangerous areas
    {
      t: 20,
      variant: "fishB",
      position: [0, 70],
      path: [
        [0, 20],
        [-40, 5],
        [-20, -20],
        [20, -20],
        [40, 5],
      ],
      cycle: true,
      amount: 4,
      scatter: 12,
    },

    // Final wave of fish
    {
      t: 25,
      variant: "fishA",
      position: [-100, 35],
      path: [
        [-25, 20],
        [0, 0],
        [25, -20],
        [120, -40],
      ],
      amount: 8,
      scatter: 20,
    },

    {
      t: 28,
      variant: "fishB",
      position: [100, -25],
      path: [
        [25, -15],
        [0, 10],
        [-25, 15],
        [-120, 30],
      ],
      amount: 3,
      scatter: 8,
    },

    // Fifth boat for final pressure
    {
      t: 30,
      variant: "boat",
      position: [115, 20],
      path: [[-135, 20]],
    },
  ],
  attacks: [
    // Early pressure with random rocks
    {
      t: 2,
      type: "rock",
      position: "random",
      amount: 8,
      stagger: 0.6,
    },

    // Triple spear line attack
    [
      {
        t: 4,
        type: "spear",
        position: [-50, -20],
        rotation: 0.25,
        amount: 1,
      },
      {
        t: 4,
        type: "spear",
        position: [0, -20],
        rotation: 0.25,
        amount: 1,
      },
      {
        t: 4,
        type: "spear",
        position: [50, -20],
        rotation: 0.25,
        amount: 1,
      },
    ],

    // Player-targeted rocks with tight scatter
    {
      t: 5,
      type: "rock",
      position: "player",
      amount: 6,
      scatter: 15,
      stagger: 0.4,
    },

    // Diagonal wave of stones
    [
      {
        t: 7,
        type: "rock",
        position: [-60, -40],
        amount: 1,
      },
      {
        t: 7.15,
        type: "rock",
        position: [-40, -20],
        amount: 1,
      },
      {
        t: 7.3,
        type: "rock",
        position: [-20, 0],
        amount: 1,
      },
      {
        t: 7.45,
        type: "rock",
        position: [0, 20],
        amount: 1,
      },
      {
        t: 7.6,
        type: "rock",
        position: [20, 40],
        amount: 1,
      },
      {
        t: 7.75,
        type: "rock",
        position: [40, 60],
        amount: 1,
      },
    ],

    // Cross formation spears from center
    [
      {
        t: 9,
        type: "spear",
        position: [0, 0],
        rotation: 0,
        amount: 1,
      },
      {
        t: 9,
        type: "spear",
        position: [0, 0],
        rotation: 0.5,
        amount: 1,
      },
      {
        t: 9.5,
        type: "spear",
        position: [0, 0],
        rotation: 1,
        amount: 1,
      },
      {
        t: 9.5,
        type: "spear",
        position: [0, 0],
        rotation: 1.5,
        amount: 1,
      },
    ],

    // Heavy bombardment
    {
      t: 11,
      type: "rock",
      position: "random",
      amount: 15,
      stagger: 0.25,
    },

    // Player tracking with spears
    {
      t: 13,
      type: "spear",
      position: "player",
      rotation: "random",
      amount: 5,
      scatter: 25,
      stagger: 0.8,
    },

    // Another diagonal, opposite direction
    [
      {
        t: 15,
        type: "rock",
        position: [60, -40],
        amount: 1,
      },
      {
        t: 15.15,
        type: "rock",
        position: [40, -20],
        amount: 1,
      },
      {
        t: 15.3,
        type: "rock",
        position: [20, 0],
        amount: 1,
      },
      {
        t: 15.45,
        type: "rock",
        position: [0, 20],
        amount: 1,
      },
      {
        t: 15.6,
        type: "rock",
        position: [-20, 40],
        amount: 1,
      },
      {
        t: 15.75,
        type: "rock",
        position: [-40, 60],
        amount: 1,
      },
    ],

    // Coordinated rock and spear assault
    {
      t: 17,
      type: "rock",
      position: "player",
      amount: 8,
      scatter: 20,
      stagger: 0.3,
    },

    // Spear spiral pattern
    [
      {
        t: 18,
        type: "spear",
        position: [0, 0],
        rotation: 0,
        amount: 1,
      },
      {
        t: 18.2,
        type: "spear",
        position: [0, 0],
        rotation: 0.25,
        amount: 1,
      },
      {
        t: 18.4,
        type: "spear",
        position: [0, 0],
        rotation: 0.5,
        amount: 1,
      },
      {
        t: 18.6,
        type: "spear",
        position: [0, 0],
        rotation: 0.75,
        amount: 1,
      },
      {
        t: 18.8,
        type: "spear",
        position: [0, 0],
        rotation: 1,
        amount: 1,
      },
      {
        t: 19,
        type: "spear",
        position: [0, 0],
        rotation: 1.25,
        amount: 1,
      },
      {
        t: 19.2,
        type: "spear",
        position: [0, 0],
        rotation: 1.5,
        amount: 1,
      },
      {
        t: 19.4,
        type: "spear",
        position: [0, 0],
        rotation: 1.75,
        amount: 1,
      },
    ],

    // Intense random bombardment
    {
      t: 21,
      type: "rock",
      position: "random",
      amount: 20,
      stagger: 0.2,
    },

    // Five parallel spears
    [
      {
        t: 23,
        type: "spear",
        position: [-60, 30],
        rotation: 1.25,
        amount: 1,
      },
      {
        t: 23.3,
        type: "spear",
        position: [-30, 30],
        rotation: 1.25,
        amount: 1,
      },
      {
        t: 23.6,
        type: "spear",
        position: [0, 30],
        rotation: 1.25,
        amount: 1,
      },
      {
        t: 23.9,
        type: "spear",
        position: [30, 30],
        rotation: 1.25,
        amount: 1,
      },
      {
        t: 24.2,
        type: "spear",
        position: [60, 30],
        rotation: 1.25,
        amount: 1,
      },
    ],

    // Final desperate assault
    {
      t: 26,
      type: "rock",
      position: "player",
      amount: 12,
      scatter: 35,
      stagger: 0.2,
    },

    // Last wave of spears
    {
      t: 28,
      type: "spear",
      position: "random",
      rotation: "random",
      amount: 10,
      stagger: 0.4,
    },

    // Final barrage
    {
      t: 30,
      type: "rock",
      position: "random",
      amount: 25,
      stagger: 0.15,
    },
  ],
} as Level;
