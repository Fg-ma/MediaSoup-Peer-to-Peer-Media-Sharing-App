import Animation from "./Animation";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const horseSheet = nginxAssetServerBaseUrl + "spriteSheets/horse/horse.png";
const poring = nginxAssetServerBaseUrl + "spriteSheets/poring/poring.png";
const toucan =
  nginxAssetServerBaseUrl + "spriteSheets/openPixelProject/toucan/toucan.png";
const wasp =
  nginxAssetServerBaseUrl + "spriteSheets/openPixelProject/wasp/wasp.png";
const leafBug =
  nginxAssetServerBaseUrl + "spriteSheets/openPixelProject/leafBug/leafBug.png";
const skeleton =
  nginxAssetServerBaseUrl +
  "spriteSheets/openPixelProject/skeleton/skeleton.png";
const blueBird = nginxAssetServerBaseUrl + "spriteSheets/birds/blueBird.png";
const greenBird = nginxAssetServerBaseUrl + "spriteSheets/birds/greenBird.png";
const whiteBird = nginxAssetServerBaseUrl + "spriteSheets/birds/whiteBird.png";
const blackBird = nginxAssetServerBaseUrl + "spriteSheets/birds/blackBird.png";
const fireBird = nginxAssetServerBaseUrl + "spriteSheets/birds/fireBird.png";
const flameBird = nginxAssetServerBaseUrl + "spriteSheets/birds/flameBird.png";
const sickBird = nginxAssetServerBaseUrl + "spriteSheets/birds/sickBird.png";
const deadBird = nginxAssetServerBaseUrl + "spriteSheets/birds/deadBird.png";
const technoBird =
  nginxAssetServerBaseUrl + "spriteSheets/birds/technoBird.png";
const redBird = nginxAssetServerBaseUrl + "spriteSheets/birds/redBird.png";
const rainbowBird =
  nginxAssetServerBaseUrl + "spriteSheets/birds/rainbowBird.png";
const angel = nginxAssetServerBaseUrl + "spriteSheets/angel/angel.png";
const redDemon = nginxAssetServerBaseUrl + "spriteSheets/redDemon/redDemon.png";
const whiteDemon =
  nginxAssetServerBaseUrl + "spriteSheets/whiteDemon/whiteDemon.png";
const chicken = nginxAssetServerBaseUrl + "spriteSheets/chicken/chicken.png";
const pig = nginxAssetServerBaseUrl + "spriteSheets/pig/pig.png";
const boar = nginxAssetServerBaseUrl + "spriteSheets/boar/boar.png";
const bunny = nginxAssetServerBaseUrl + "spriteSheets/bunny/bunny.png";

export const coreAnimations = ["walk", "idle"];

export type SpriteAnimationsTypes = "run" | "walk" | "idle";
export type CoreSpriteAnimationsTypes = "walk" | "idle";
export type AltSpriteAnimationsTypes = "run";

export type SpriteAnimations = {
  currentAnimation: { core: SpriteAnimationsTypes; alt: string | undefined };
  coreAnimations: {
    idle: {
      core: Animation;
      alt?: { [alt: string]: Animation };
    };
    walk: { core: Animation; alt?: { [alt: string]: Animation } };
  };
  altAnimations: {
    [optionalSpriteAnimationsType in AltSpriteAnimationsTypes]?: {
      core: Animation;
      alt?: { [alt: string]: Animation };
    };
  };
};

export type SpriteType = {
  rotatable: boolean;
  flipTextures: boolean;
  positioning: {
    position: { top: number; left: number };
    scale: { x: number; y: number };
    rotation: number;
    flip: boolean;
  };
  animations: SpriteAnimations;
  active: boolean;
  aspect: number;
};

export type LittleBuddiesTypes =
  | "horse"
  | "poring"
  | "toucan"
  | "wasp"
  | "leafBug"
  | "skeleton"
  | "blueBird"
  | "greenBird"
  | "blackBird"
  | "whiteBird"
  | "sickBird"
  | "deadBird"
  | "fireBird"
  | "flameBird"
  | "technoBird"
  | "redBird"
  | "rainbowBird"
  | "angel"
  | "redDemon"
  | "whiteDemon"
  | "chicken"
  | "pig"
  | "boar"
  | "bunny";

export type MetaAnimation = {
  core: number[];
  speed: number | null;
  alt?: {
    [alt: string]: {
      animation: number[];
      loop: boolean;
      speed?: number | null;
    };
  };
};

export type SpriteMetaData = {
  url: string;
  frameHeight: number;
  frameWidth: number;
  walkSpeed: number;
  runSpeed: number;
  rotatable: boolean;
  flipTextures: boolean;
  pixelated: boolean;
  animations: {
    core: {
      idle: MetaAnimation;
      walk: MetaAnimation;
    };
    alt: {
      run?: MetaAnimation;
      death?: MetaAnimation;
      speak?: MetaAnimation;
      jump?: MetaAnimation;
    };
  };
};

export const spirteSheetsMeta: {
  [tableLittleBuddy in LittleBuddiesTypes]: SpriteMetaData;
} = {
  horse: {
    url: horseSheet,
    frameHeight: 33,
    frameWidth: 60,
    walkSpeed: 0.2,
    runSpeed: 0.5,
    rotatable: true,
    flipTextures: false,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [0],
          alt: {
            horseProd: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
              loop: false,
              speed: 0.2,
            },
            horseEat: {
              animation: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
              loop: false,
              speed: 0.2,
            },
          },
          speed: null,
        },
        walk: { core: [39, 40, 41, 42, 43, 44, 45, 46], speed: 0.1 },
      },
      alt: {
        run: { core: [26, 27, 28, 29, 30, 31], speed: 0.1 },
      },
    },
  },
  poring: {
    url: poring,
    frameHeight: 372,
    frameWidth: 372,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [18, 19, 20, 21],
          speed: 0.35,
        },
        walk: { core: [22, 23, 24, 25, 26, 27, 28], speed: 0.2 },
      },
      alt: {
        death: {
          core: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1,
        },
      },
    },
  },
  toucan: {
    url: toucan,
    frameHeight: 64,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [4],
          speed: null,
          alt: {
            toucanDown: {
              animation: [4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.2,
            },
            toucanUp: {
              animation: [18, 19, 20, 21, 22, 23],
              loop: false,
              speed: 0.2,
            },
          },
        },
        walk: { core: [0, 1, 2, 3], speed: 0.175 },
      },
      alt: {
        jump: {
          core: [10, 11, 12, 13, 14],
          speed: 0.1,
        },
        speak: {
          core: [15, 16, 17],
          speed: 0.1,
        },
      },
    },
  },
  wasp: {
    url: wasp,
    frameHeight: 96,
    frameWidth: 96,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          speed: 0.2,
        },
        walk: { core: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], speed: 0.2 },
      },
      alt: {},
    },
  },
  leafBug: {
    url: leafBug,
    frameHeight: 64,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
          alt: {
            alert: {
              animation: [0, 1, 2, 3],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: { core: [4, 5, 6, 7, 8, 9], speed: 0.2 },
      },
      alt: {},
    },
  },
  skeleton: {
    url: skeleton,
    frameHeight: 72,
    frameWidth: 74,
    walkSpeed: 0.1,
    runSpeed: 0.1,
    rotatable: false,
    flipTextures: true,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
        },
        walk: { core: [0, 1, 2, 3, 4, 5, 6, 7], speed: 0.2 },
      },
      alt: {},
    },
  },
  blueBird: {
    url: blueBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  greenBird: {
    url: greenBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  blackBird: {
    url: blackBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  whiteBird: {
    url: whiteBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  technoBird: {
    url: technoBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  deadBird: {
    url: deadBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  sickBird: {
    url: sickBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  fireBird: {
    url: fireBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  flameBird: {
    url: flameBird,
    frameHeight: 27,
    frameWidth: 27,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  redBird: {
    url: redBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  rainbowBird: {
    url: rainbowBird,
    frameHeight: 16,
    frameWidth: 15,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3],
          speed: null,
        },
        walk: { core: [0, 1, 2], speed: 0.2 },
      },
      alt: { jump: { core: [6], speed: 0.2 } },
    },
  },
  angel: {
    url: angel,
    frameHeight: 256,
    frameWidth: 256,
    walkSpeed: 0.2,
    runSpeed: 0.35,
    rotatable: false,
    flipTextures: true,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [24],
          speed: null,
        },
        walk: {
          core: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
          speed: 0.075,
        },
      },
      alt: {
        jump: { core: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], speed: 0.075 },
        run: {
          core: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          speed: 0.075,
        },
      },
    },
  },
  redDemon: {
    url: redDemon,
    frameHeight: 330,
    frameWidth: 270,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [4],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          speed: 0.075,
        },
      },
      alt: {},
    },
  },
  whiteDemon: {
    url: whiteDemon,
    frameHeight: 330,
    frameWidth: 270,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [4],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          speed: 0.075,
        },
      },
      alt: {},
    },
  },
  chicken: {
    url: chicken,
    frameHeight: 32,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [10],
          speed: null,
        },
        walk: {
          core: [9, 10, 11],
          speed: 0.1375,
        },
      },
      alt: {},
    },
  },
  pig: {
    url: pig,
    frameHeight: 64,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [10],
          speed: null,
        },
        walk: {
          core: [9, 10, 11],
          speed: 0.1375,
        },
      },
      alt: {},
    },
  },
  boar: {
    url: boar,
    frameHeight: 64,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [10],
          speed: null,
        },
        walk: {
          core: [9, 10, 11],
          speed: 0.1375,
        },
      },
      alt: {},
    },
  },
  bunny: {
    url: bunny,
    frameHeight: 36,
    frameWidth: 36,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: false,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6, 7],
          speed: 0.125,
        },
      },
      alt: {},
    },
  },
};
