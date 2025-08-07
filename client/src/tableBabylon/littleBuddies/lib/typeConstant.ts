import Animation from "./Animation";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const horse = nginxAssetServerBaseUrl + "spriteSheets/horse/horse.png";
const horseIcon = nginxAssetServerBaseUrl + "spriteSheets/horse/horseIcon.png";
const poring = nginxAssetServerBaseUrl + "spriteSheets/poring/poring.png";
const poringIcon =
  nginxAssetServerBaseUrl + "spriteSheets/poring/poringIcon.png";
const toucan =
  nginxAssetServerBaseUrl + "spriteSheets/openPixelProject/toucan/toucan.png";
const toucanIcon =
  nginxAssetServerBaseUrl +
  "spriteSheets/openPixelProject/toucan/toucanIcon.png";
const wasp =
  nginxAssetServerBaseUrl + "spriteSheets/openPixelProject/wasp/wasp.png";
const waspIcon =
  nginxAssetServerBaseUrl + "spriteSheets/openPixelProject/wasp/waspIcon.png";
const leafBug =
  nginxAssetServerBaseUrl + "spriteSheets/openPixelProject/leafBug/leafBug.png";
const leafBugIcon =
  nginxAssetServerBaseUrl +
  "spriteSheets/openPixelProject/leafBug/leafBugIcon.png";
const skeleton =
  nginxAssetServerBaseUrl +
  "spriteSheets/openPixelProject/skeleton/skeleton.png";
const skeletonIcon =
  nginxAssetServerBaseUrl +
  "spriteSheets/openPixelProject/skeleton/skeletonIcon.png";
const blueBird = nginxAssetServerBaseUrl + "spriteSheets/birds/blueBird.png";
const blueBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/blueBirdIcon.png";
const greenBird = nginxAssetServerBaseUrl + "spriteSheets/birds/greenBird.png";
const greenBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/greenBirdIcon.png";
const whiteBird = nginxAssetServerBaseUrl + "spriteSheets/birds/whiteBird.png";
const whiteBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/whiteBirdIcon.png";
const blackBird = nginxAssetServerBaseUrl + "spriteSheets/birds/blackBird.png";
const blackBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/blackBirdIcon.png";
const fireBird = nginxAssetServerBaseUrl + "spriteSheets/birds/fireBird.png";
const fireBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/fireBirdIcon.png";
const flameBird = nginxAssetServerBaseUrl + "spriteSheets/birds/flameBird.png";
const flameBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/flameBirdIcon.png";
const sickBird = nginxAssetServerBaseUrl + "spriteSheets/birds/sickBird.png";
const sickBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/sickBirdIcon.png";
const deadBird = nginxAssetServerBaseUrl + "spriteSheets/birds/deadBird.png";
const deadBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/deadBirdIcon.png";
const technoBird =
  nginxAssetServerBaseUrl + "spriteSheets/birds/technoBird.png";
const technoBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/technoBirdIcon.png";
const redBird = nginxAssetServerBaseUrl + "spriteSheets/birds/redBird.png";
const redBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/redBirdIcon.png";
const rainbowBird =
  nginxAssetServerBaseUrl + "spriteSheets/birds/rainbowBird.png";
const rainbowBirdIcon =
  nginxAssetServerBaseUrl + "spriteSheets/birds/rainbowBirdIcon.png";
const angel = nginxAssetServerBaseUrl + "spriteSheets/angel/angel.png";
const angelIcon = nginxAssetServerBaseUrl + "spriteSheets/angel/angelIcon.png";
const redDemon = nginxAssetServerBaseUrl + "spriteSheets/redDemon/redDemon.png";
const redDemonIcon =
  nginxAssetServerBaseUrl + "spriteSheets/redDemon/redDemonIcon.png";
const whiteDemon =
  nginxAssetServerBaseUrl + "spriteSheets/whiteDemon/whiteDemon.png";
const whiteDemonIcon =
  nginxAssetServerBaseUrl + "spriteSheets/whiteDemon/whiteDemonIcon.png";
const chicken = nginxAssetServerBaseUrl + "spriteSheets/chicken/chicken.png";
const chickenIcon =
  nginxAssetServerBaseUrl + "spriteSheets/chicken/chickenIcon.png";
const pig = nginxAssetServerBaseUrl + "spriteSheets/pig/pig.png";
const pigIcon = nginxAssetServerBaseUrl + "spriteSheets/pig/pigIcon.png";
const boar = nginxAssetServerBaseUrl + "spriteSheets/boar/boar.png";
const boarIcon = nginxAssetServerBaseUrl + "spriteSheets/boar/boarIcon.png";
const bunny = nginxAssetServerBaseUrl + "spriteSheets/bunny/bunny.png";
const bunnyIcon = nginxAssetServerBaseUrl + "spriteSheets/bunny/bunnyIcon.png";
const redBat = nginxAssetServerBaseUrl + "spriteSheets/bats/redBat.png";
const redBatIcon = nginxAssetServerBaseUrl + "spriteSheets/bats/redBatIcon.png";
const purpleBat = nginxAssetServerBaseUrl + "spriteSheets/bats/purpleBat.png";
const purpleBatIcon =
  nginxAssetServerBaseUrl + "spriteSheets/bats/purpleBatIcon.png";

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
    position: { y: number; x: number };
    scale: { x: number; y: number };
    rotation: number;
    flip: boolean;
  };
  animations: SpriteAnimations;
  active: boolean;
  aspect: number;
  selected: boolean;
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
  | "bunny"
  | "redBat"
  | "purpleBat";

export const littleBuddySemanticKeywords: Record<LittleBuddiesTypes, string[]> =
  {
    horse: ["animal", "ride", "fast"],
    poring: ["slime", "cute", "bouncy"],
    toucan: ["bird", "colorful", "jungle"],
    wasp: ["insect", "sting", "bug"],
    leafBug: ["bug", "leaf", "green"],
    skeleton: ["bones", "undead", "scary"],
    blueBird: ["bird", "blue"],
    greenBird: ["bird", "green"],
    blackBird: ["bird", "black"],
    whiteBird: ["bird", "white"],
    sickBird: ["bird", "sick", "ill"],
    deadBird: ["bird", "dead", "ghost"],
    fireBird: ["bird", "fire", "flame", "red"],
    flameBird: ["bird", "fire", "flame"],
    technoBird: ["bird", "robot", "techno"],
    redBird: ["bird", "red", "angry"],
    rainbowBird: ["bird", "rainbow", "colorful"],
    angel: ["holy", "wings", "heaven"],
    redDemon: ["demon", "fire", "red", "evil"],
    whiteDemon: ["demon", "white", "ghost", "evil"],
    chicken: ["bird", "farm", "egg"],
    pig: ["animal", "farm", "pink"],
    boar: ["animal", "wild", "tusk"],
    bunny: ["animal", "cute", "rabbit"],
    redBat: ["animal", "bat"],
    purpleBat: ["animal", "bat"],
  };

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

export type SpriteMetadata = {
  title: string;
  url: string;
  iconUrl: string;
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
  [tableLittleBuddy in LittleBuddiesTypes]: SpriteMetadata;
} = {
  horse: {
    title: "Horse",
    url: horse,
    iconUrl: horseIcon,
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
    title: "Poring",
    url: poring,
    iconUrl: poringIcon,
    frameHeight: 372,
    frameWidth: 372,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
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
    title: "Toucan",
    url: toucan,
    iconUrl: toucanIcon,
    frameHeight: 64,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
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
    title: "Wasp",
    url: wasp,
    iconUrl: waspIcon,
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
          speed: 0.15,
        },
        walk: { core: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], speed: 0.2 },
      },
      alt: {},
    },
  },
  leafBug: {
    title: "Leaf bug",
    url: leafBug,
    iconUrl: leafBugIcon,
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
    title: "Skeleton",
    url: skeleton,
    iconUrl: skeletonIcon,
    frameHeight: 72,
    frameWidth: 74,
    walkSpeed: 0.1,
    runSpeed: 0.1,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
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
    title: "Blue bird",
    url: blueBird,
    iconUrl: blueBirdIcon,
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
    title: "Green bird",
    url: greenBird,
    iconUrl: greenBirdIcon,
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
    title: "Black bird",
    url: blackBird,
    iconUrl: blackBirdIcon,
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
    title: "White bird",
    url: whiteBird,
    iconUrl: whiteBirdIcon,
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
    title: "Techno bird",
    url: technoBird,
    iconUrl: technoBirdIcon,
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
    title: "Dead bird",
    url: deadBird,
    iconUrl: deadBirdIcon,
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
    title: "Sick bird",
    url: sickBird,
    iconUrl: sickBirdIcon,
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
    title: "Fire bird",
    url: fireBird,
    iconUrl: fireBirdIcon,
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
    title: "Flame bird",
    url: flameBird,
    iconUrl: flameBirdIcon,
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
    title: "Red bird",
    url: redBird,
    iconUrl: redBirdIcon,
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
    title: "Rainbow bird",
    url: rainbowBird,
    iconUrl: rainbowBirdIcon,
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
    title: "Angel",
    url: angel,
    iconUrl: angelIcon,
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
    title: "Red demon",
    url: redDemon,
    iconUrl: redDemonIcon,
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
    title: "White demon",
    url: whiteDemon,
    iconUrl: whiteDemonIcon,
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
    title: "Chicken",
    url: chicken,
    iconUrl: chickenIcon,
    frameHeight: 32,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
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
    title: "Pig",
    url: pig,
    iconUrl: pigIcon,
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
    title: "Boar",
    url: boar,
    iconUrl: boarIcon,
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
    title: "Bunny",
    url: bunny,
    iconUrl: bunnyIcon,
    frameHeight: 36,
    frameWidth: 36,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: true,
    pixelated: true,
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
  redBat: {
    title: "Red bat",
    url: redBat,
    iconUrl: redBatIcon,
    frameHeight: 64,
    frameWidth: 48,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0, 1, 2],
          speed: 0.1125,
        },
        walk: {
          core: [3, 4, 5],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  purpleBat: {
    title: "Purple bat",
    url: purpleBat,
    iconUrl: purpleBatIcon,
    frameHeight: 64,
    frameWidth: 48,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0, 1, 2],
          speed: 0.1125,
        },
        walk: {
          core: [3, 4, 5],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
};
