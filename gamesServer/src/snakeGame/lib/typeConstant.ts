export type Directions = "up" | "down" | "left" | "right";

export type Snake = {
  position: { x: number; y: number }[];
  direction: Directions;
  color: SnakeColorsType;
};

export type GameState = {
  snakes: { [username: string]: { [instance: string]: Snake } };
  food: { x: number; y: number; class: string }[];
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
