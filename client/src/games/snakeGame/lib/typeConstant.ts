import snakeHeadBlackPink from "../../../../public/snakeGameAssets/snake/snakeHeadBlackPink.png";
import snakeHeadBlackYellow from "../../../../public/snakeGameAssets/snake/snakeHeadBlackYellow.png";
import snakeHeadBlueBlue from "../../../../public/snakeGameAssets/snake/snakeHeadBlueBlue.png";
import snakeHeadBlueGreen from "../../../../public/snakeGameAssets/snake/snakeHeadBlueGreen.png";
import snakeHeadBlueOrange from "../../../../public/snakeGameAssets/snake/snakeHeadBlueOrange.png";
import snakeHeadBluePurple from "../../../../public/snakeGameAssets/snake/snakeHeadBluePurple.png";
import snakeHeadBlueRed from "../../../../public/snakeGameAssets/snake/snakeHeadBlueRed.png";
import snakeHeadBlueWhite from "../../../../public/snakeGameAssets/snake/snakeHeadBlueWhite.png";
import snakeHeadBlueYellow from "../../../../public/snakeGameAssets/snake/snakeHeadBlueYellow.png";
import snakeHeadGreenGreen from "../../../../public/snakeGameAssets/snake/snakeHeadGreenGreen.png";
import snakeHeadGreenPurple from "../../../../public/snakeGameAssets/snake/snakeHeadGreenPurple.png";
import snakeHeadGreenWhite from "../../../../public/snakeGameAssets/snake/snakeHeadGreenWhite.png";
import snakeHeadGreenYellow from "../../../../public/snakeGameAssets/snake/snakeHeadGreenYellow.png";
import snakeHeadOrangeBlue from "../../../../public/snakeGameAssets/snake/snakeHeadOrangeBlue.png";
import snakeHeadOrangePink from "../../../../public/snakeGameAssets/snake/snakeHeadOrangePink.png";
import snakeHeadOrangePurple from "../../../../public/snakeGameAssets/snake/snakeHeadOrangePurple.png";
import snakeHeadOrangeRed from "../../../../public/snakeGameAssets/snake/snakeHeadOrangeRed.png";
import snakeHeadPinkGreen from "../../../../public/snakeGameAssets/snake/snakeHeadPinkGreen.png";
import snakeHeadPinkOrange from "../../../../public/snakeGameAssets/snake/snakeHeadPinkOrange.png";
import snakeHeadPinkPurple from "../../../../public/snakeGameAssets/snake/snakeHeadPinkPurple.png";
import snakeHeadRedBlack from "../../../../public/snakeGameAssets/snake/snakeHeadRedBlack.png";
import snakeHeadRedYellow from "../../../../public/snakeGameAssets/snake/snakeHeadRedYellow.png";
import snakeHeadWhiteAqua from "../../../../public/snakeGameAssets/snake/snakeHeadWhiteAqua.png";
import snakeHeadWhiteRed from "../../../../public/snakeGameAssets/snake/snakeHeadWhiteRed.png";
import snakeHeadWhiteYellow from "../../../../public/snakeGameAssets/snake/snakeHeadWhiteYellow.png";

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

type ColorMapColors =
  | "black"
  | "blue"
  | "green"
  | "orange"
  | "pink"
  | "red"
  | "white";

export const colorMap: {
  [key in ColorMapColors]: {
    r: number;
    g: number;
    b: number;
  };
} = {
  black: { r: 0, g: 0, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  green: { r: 0, g: 128, b: 0 },
  orange: { r: 255, g: 165, b: 0 },
  pink: { r: 255, g: 192, b: 203 },
  red: { r: 255, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
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

export const snakeColorIconMap = {
  black: { pink: snakeHeadBlackPink, yellow: snakeHeadBlackYellow },
  blue: {
    blue: snakeHeadBlueBlue,
    green: snakeHeadBlueGreen,
    orange: snakeHeadBlueOrange,
    purple: snakeHeadBluePurple,
    red: snakeHeadBlueRed,
    white: snakeHeadBlueWhite,
    yellow: snakeHeadBlueYellow,
  },
  green: {
    green: snakeHeadGreenGreen,
    purple: snakeHeadGreenPurple,
    white: snakeHeadGreenWhite,
    yellow: snakeHeadGreenYellow,
  },
  orange: {
    blue: snakeHeadOrangeBlue,
    pink: snakeHeadOrangePink,
    purple: snakeHeadOrangePurple,
    red: snakeHeadOrangeRed,
  },
  pink: {
    green: snakeHeadPinkGreen,
    orange: snakeHeadPinkOrange,
    purple: snakeHeadPinkPurple,
  },
  red: {
    black: snakeHeadRedBlack,
    yellow: snakeHeadRedYellow,
  },
  white: {
    aqua: snakeHeadWhiteAqua,
    red: snakeHeadWhiteRed,
    yellow: snakeHeadWhiteYellow,
  },
};
