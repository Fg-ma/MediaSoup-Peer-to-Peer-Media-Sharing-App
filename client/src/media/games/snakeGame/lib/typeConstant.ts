const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const snakeHeadBlackPink =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadBlackPink.png";
const snakeHeadBlackYellow =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadBlackYellow.png";
const snakeHeadBlueBlue =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadBlueBlue.png";
const snakeHeadBlueGreen =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadBlueGreen.png";
const snakeHeadBlueOrange =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadBlueOrange.png";
const snakeHeadBluePurple =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadBluePurple.png";
const snakeHeadBlueRed =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadBlueRed.png";
const snakeHeadBlueWhite =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadBlueWhite.png";
const snakeHeadBlueYellow =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadBlueYellow.png";
const snakeHeadGreenGreen =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadGreenGreen.png";
const snakeHeadGreenPurple =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadGreenPurple.png";
const snakeHeadGreenWhite =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadGreenWhite.png";
const snakeHeadGreenYellow =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadGreenYellow.png";
const snakeHeadOrangeBlue =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadOrangeBlue.png";
const snakeHeadOrangePink =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadOrangePink.png";
const snakeHeadOrangePurple =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadOrangePurple.png";
const snakeHeadOrangeRed =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadOrangeRed.png";
const snakeHeadPinkGreen =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadPinkGreen.png";
const snakeHeadPinkOrange =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadPinkOrange.png";
const snakeHeadPinkPurple =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadPinkPurple.png";
const snakeHeadRedBlack =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadRedBlack.png";
const snakeHeadRedYellow =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadRedYellow.png";
const snakeHeadWhiteAqua =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadWhiteAqua.png";
const snakeHeadWhiteRed =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadWhiteRed.png";
const snakeHeadWhiteYellow =
  nginxAssetServerBaseUrl + "snakeGameAssets/snake/snakeHeadWhiteYellow.png";

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
