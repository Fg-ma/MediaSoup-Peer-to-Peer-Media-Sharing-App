import { z } from "zod";

export type Directions = "up" | "down" | "left" | "right";

export type Snake = {
  position: { x: number; y: number }[];
  direction: Directions;
};

export type GameState = {
  snakes: { [username: string]: { [instance: string]: Snake } };
  food: { x: number; y: number; class: string }[];
};

export type PlayersState = {
  [username: string]: { [instance: string]: { snakeColor: SnakeColorsType } };
};

export type SnakeColorsType =
  | {
      primary: "black";
      secondary: "pink";
    }
  | {
      primary: "black";
      secondary: "yellow";
    }
  | {
      primary: "blue";
      secondary: "blue";
    }
  | {
      primary: "blue";
      secondary: "green";
    }
  | {
      primary: "blue";
      secondary: "orange";
    }
  | {
      primary: "blue";
      secondary: "purple";
    }
  | {
      primary: "blue";
      secondary: "red";
    }
  | {
      primary: "blue";
      secondary: "white";
    }
  | {
      primary: "blue";
      secondary: "yellow";
    }
  | {
      primary: "green";
      secondary: "green";
    }
  | {
      primary: "green";
      secondary: "purple";
    }
  | {
      primary: "green";
      secondary: "white";
    }
  | {
      primary: "green";
      secondary: "yellow";
    }
  | {
      primary: "orange";
      secondary: "blue";
    }
  | {
      primary: "orange";
      secondary: "pink";
    }
  | {
      primary: "orange";
      secondary: "purple";
    }
  | {
      primary: "orange";
      secondary: "red";
    }
  | {
      primary: "pink";
      secondary: "green";
    }
  | {
      primary: "pink";
      secondary: "orange";
    }
  | {
      primary: "pink";
      secondary: "purple";
    }
  | {
      primary: "red";
      secondary: "black";
    }
  | {
      primary: "red";
      secondary: "yellow";
    }
  | {
      primary: "white";
      secondary: "aqua";
    }
  | {
      primary: "white";
      secondary: "red";
    }
  | {
      primary: "white";
      secondary: "yellow";
    };
export const SnakeColorsSchema = z.union([
  z.object({
    primary: z.literal("black"),
    secondary: z.literal("pink"),
  }),
  z.object({
    primary: z.literal("black"),
    secondary: z.literal("yellow"),
  }),
  z.object({
    primary: z.literal("blue"),
    secondary: z.literal("blue"),
  }),
  z.object({
    primary: z.literal("blue"),
    secondary: z.literal("green"),
  }),
  z.object({
    primary: z.literal("blue"),
    secondary: z.literal("orange"),
  }),
  z.object({
    primary: z.literal("blue"),
    secondary: z.literal("purple"),
  }),
  z.object({
    primary: z.literal("blue"),
    secondary: z.literal("red"),
  }),
  z.object({
    primary: z.literal("blue"),
    secondary: z.literal("white"),
  }),
  z.object({
    primary: z.literal("blue"),
    secondary: z.literal("yellow"),
  }),
  z.object({
    primary: z.literal("green"),
    secondary: z.literal("green"),
  }),
  z.object({
    primary: z.literal("green"),
    secondary: z.literal("purple"),
  }),
  z.object({
    primary: z.literal("green"),
    secondary: z.literal("white"),
  }),
  z.object({
    primary: z.literal("green"),
    secondary: z.literal("yellow"),
  }),
  z.object({
    primary: z.literal("orange"),
    secondary: z.literal("blue"),
  }),
  z.object({
    primary: z.literal("orange"),
    secondary: z.literal("pink"),
  }),
  z.object({
    primary: z.literal("orange"),
    secondary: z.literal("purple"),
  }),
  z.object({
    primary: z.literal("orange"),
    secondary: z.literal("red"),
  }),
  z.object({
    primary: z.literal("pink"),
    secondary: z.literal("green"),
  }),
  z.object({
    primary: z.literal("pink"),
    secondary: z.literal("orange"),
  }),
  z.object({
    primary: z.literal("pink"),
    secondary: z.literal("purple"),
  }),
  z.object({
    primary: z.literal("red"),
    secondary: z.literal("black"),
  }),
  z.object({
    primary: z.literal("red"),
    secondary: z.literal("yellow"),
  }),
  z.object({
    primary: z.literal("white"),
    secondary: z.literal("aqua"),
  }),
  z.object({
    primary: z.literal("white"),
    secondary: z.literal("red"),
  }),
  z.object({
    primary: z.literal("white"),
    secondary: z.literal("yellow"),
  }),
]);

export const foodClasses = [
  "snake-game-apple",
  "snake-game-banana",
  "snake-game-donut",
  "snake-game-grapes",
  "snake-game-orange",
  "snake-game-pizza",
  "snake-game-strawberry",
  "snake-game-watermelon",
];

export const snakeColors: SnakeColorsType[] = [
  { primary: "black", secondary: "pink" },
  { primary: "black", secondary: "yellow" },
  { primary: "blue", secondary: "blue" },
  { primary: "blue", secondary: "green" },
  { primary: "blue", secondary: "orange" },
  { primary: "blue", secondary: "purple" },
  { primary: "blue", secondary: "red" },
  { primary: "blue", secondary: "white" },
  { primary: "blue", secondary: "yellow" },
  { primary: "green", secondary: "green" },
  { primary: "green", secondary: "purple" },
  { primary: "green", secondary: "white" },
  { primary: "green", secondary: "yellow" },
  { primary: "orange", secondary: "blue" },
  { primary: "orange", secondary: "pink" },
  { primary: "orange", secondary: "purple" },
  { primary: "orange", secondary: "red" },
  { primary: "pink", secondary: "green" },
  { primary: "pink", secondary: "orange" },
  { primary: "pink", secondary: "purple" },
  { primary: "red", secondary: "black" },
  { primary: "red", secondary: "yellow" },
  { primary: "white", secondary: "aqua" },
  { primary: "white", secondary: "red" },
  { primary: "white", secondary: "yellow" },
];
