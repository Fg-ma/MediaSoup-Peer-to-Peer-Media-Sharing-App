import Animation from "./Animation";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const horseSheet = nginxAssetServerBaseUrl + "spriteSheets/horse/horse.png";

export type SpriteType = {
  positioning: {
    position: { top: number; left: number };
    scale: { x: number; y: number };
    rotation: number;
    flip: boolean;
  };
  animations: {
    currentAnimation: SpriteAnimationsTypes;
    coreAnimations: {
      idle: {
        core: Animation;
        alt?: { [alt: string]: Animation };
      };
      walk: { core: Animation; alt?: { [alt: string]: Animation } };
    };
    optionalAnimations: {
      [optionalSpriteAnimationsType in OptionalSpriteAnimationsTypes]?: {
        core: Animation;
        alt?: { [alt: string]: Animation };
      };
    };
  };
};

export type SpriteAnimationsTypes = "run" | "walk" | "idle";
export type CoreSpriteAnimationsTypes = "walk" | "idle";
export type OptionalSpriteAnimationsTypes = "run";

export const coreAnimations = ["walk", "idle"];

export type TableLittleBuddiesTypes = "horse";

export const spirteSheetsMeta: {
  [tableLittleBuddy in TableLittleBuddiesTypes]: {
    url: string;
    frameHeight: number;
    frameWidth: number;
    walkSpeed: number;
    runSpeed: number;
    animations: {
      core: {
        idle: { core: number[]; alt?: { [alt: string]: number[] } };
        walk: { core: number[]; alt?: { [alt: string]: number[] } };
      };
      alt: {
        run?: { core: number[]; alt?: { [alt: string]: number[] } };
      };
    };
  };
} = {
  horse: {
    url: horseSheet,
    frameHeight: 33,
    frameWidth: 60,
    walkSpeed: 0.2,
    runSpeed: 0.5,
    animations: {
      core: {
        idle: {
          core: [0],
          alt: {
            alt1: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
            alt2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          },
        },
        walk: { core: [39, 40, 41, 42, 43, 44, 45, 46] },
      },
      alt: {
        run: { core: [26, 27, 28, 29, 30, 31] },
      },
    },
  },
};
