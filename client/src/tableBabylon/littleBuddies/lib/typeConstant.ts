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
const wildPig = nginxAssetServerBaseUrl + "spriteSheets/wildPig/wildPig.png";
const wildPigIcon =
  nginxAssetServerBaseUrl + "spriteSheets/wildPig/wildPigIcon.png";
const bunny = nginxAssetServerBaseUrl + "spriteSheets/bunny/bunny.png";
const bunnyIcon = nginxAssetServerBaseUrl + "spriteSheets/bunny/bunnyIcon.png";
const redBat = nginxAssetServerBaseUrl + "spriteSheets/bats/redBat.png";
const redBatIcon = nginxAssetServerBaseUrl + "spriteSheets/bats/redBatIcon.png";
const purpleBat = nginxAssetServerBaseUrl + "spriteSheets/bats/purpleBat.png";
const purpleBatIcon =
  nginxAssetServerBaseUrl + "spriteSheets/bats/purpleBatIcon.png";
const hero = nginxAssetServerBaseUrl + "spriteSheets/hero/hero.png";
const heroIcon = nginxAssetServerBaseUrl + "spriteSheets/hero/heroIcon.png";
const blackBeardDwarf =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/blackBeardDwarf.png";
const blackBeardDwarfIcon =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/blackBeardDwarfIcon.png";
const blueDwarf =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/blueDwarf.png";
const blueDwarfIcon =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/blueDwarfIcon.png";
const greenDwarf =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/greenDwarf.png";
const greenDwarfIcon =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/greenDwarfIcon.png";
const lumberjackDwarf =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/lumberjackDwarf.png";
const lumberjackDwarfIcon =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/lumberjackDwarfIcon.png";
const redBeardDwarf =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/redBeardDwarf.png";
const redBeardDwarfIcon =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/redBeardDwarfIcon.png";
const redDwarf = nginxAssetServerBaseUrl + "spriteSheets/dwarves/redDwarf.png";
const redDwarfIcon =
  nginxAssetServerBaseUrl + "spriteSheets/dwarves/redDwarfIcon.png";
const goblinAssassin =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinAssassin.png";
const goblinAssassinIcon =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinAssassinIcon.png";
const goblinGuard =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinGuard.png";
const goblinGuardIcon =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinGuardIcon.png";
const goblinLord =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinLord.png";
const goblinLordIcon =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinLordIcon.png";
const goblinMage =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinMage.png";
const goblinMageIcon =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinMageIcon.png";
const goblinPeasant =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinPeasant.png";
const goblinPeasantIcon =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinPeasantIcon.png";
const goblinSamurai =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinSamurai.png";
const goblinSamuraiIcon =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinSamuraiIcon.png";
const goblinSoldier =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinSoldier.png";
const goblinSoldierIcon =
  nginxAssetServerBaseUrl + "spriteSheets/goblins/goblinSoldierIcon.png";
const knight = nginxAssetServerBaseUrl + "spriteSheets/knight/knight.png";
const knightIcon =
  nginxAssetServerBaseUrl + "spriteSheets/knight/knightIcon.png";
const baldric =
  nginxAssetServerBaseUrl + "spriteSheets/magicalCharacters/baldric.png";
const baldricIcon =
  nginxAssetServerBaseUrl + "spriteSheets/magicalCharacters/baldricIcon.png";
const mage =
  nginxAssetServerBaseUrl + "spriteSheets/magicalCharacters/mage.png";
const mageIcon =
  nginxAssetServerBaseUrl + "spriteSheets/magicalCharacters/mageIcon.png";
const musketCaptain =
  nginxAssetServerBaseUrl + "spriteSheets/musketCaptain/musketCaptain.png";
const musketCaptainIcon =
  nginxAssetServerBaseUrl + "spriteSheets/musketCaptain/musketCaptainIcon.png";
const ninja = nginxAssetServerBaseUrl + "spriteSheets/ninja/ninja.png";
const ninjaIcon = nginxAssetServerBaseUrl + "spriteSheets/ninja/ninjaIcon.png";
const orc = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters1/orc.png";
const orcIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters1/orcIcon.png";
const soldier =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters1/soldier.png";
const soldierIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters1/soldierIcon.png";
const shieldMaiden =
  nginxAssetServerBaseUrl + "spriteSheets/shieldMaiden/shieldMaiden.png";
const shieldMaidenIcon =
  nginxAssetServerBaseUrl + "spriteSheets/shieldMaiden/shieldMaidenIcon.png";
const bear = nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/bear.png";
const bearIcon =
  nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/bearIcon.png";
const boar = nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/boar.png";
const boarIcon =
  nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/boarIcon.png";
const deer = nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/deer.png";
const deerIcon =
  nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/deerIcon.png";
const fox = nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/fox.png";
const foxIcon =
  nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/foxIcon.png";
const rabbit = nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/rabbit.png";
const rabbitIcon =
  nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/rabbitIcon.png";
const wolf = nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/wolf.png";
const wolfIcon =
  nginxAssetServerBaseUrl + "spriteSheets/wildAnimals/wolfIcon.png";
const beetle = nginxAssetServerBaseUrl + "spriteSheets/beetle/beetle.png";
const beetleIcon =
  nginxAssetServerBaseUrl + "spriteSheets/beetle/beetleIcon.png";
const armedBones = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/armedBones.png";
const armedBonesIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/armedBonesIcon.png";
const bones = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/bones.png";
const bonesIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/bonesIcon.png";
const eyeBat = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/eyeBat.png";
const eyeBatIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/eyeBatIcon.png";
const fang = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/fang.png";
const fangIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/fangIcon.png";
const  giant= nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/giant.png";
const giantIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/giantIcon.png";
const goo = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/goo.png";
const gooIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/gooIcon.png";
const hoodfang = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/hoodfang.png";
const hoodfangIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/hoodfangIcon.png";
const horns = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/horns.png";
const hornsIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/hornsIcon.png";
const spider = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/spider.png";
const spiderIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/spiderIcon.png";
const vampireBat = nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/vampireBat.png";
const vampireBatIcon =
  nginxAssetServerBaseUrl + "spriteSheets/rpgCharacters2/vampireBatIcon.png";
const cow = nginxAssetServerBaseUrl + "spriteSheets/cow/cow.png";
const cowIcon =
  nginxAssetServerBaseUrl + "spriteSheets/cow/cowIcon.png";
const fly = nginxAssetServerBaseUrl + "spriteSheets/fly/fly.png";
const flyIcon =
  nginxAssetServerBaseUrl + "spriteSheets/fly/flyIcon.png";
const frogman = nginxAssetServerBaseUrl + "spriteSheets/frogman/frogman.png";
const frogmanIcon =
  nginxAssetServerBaseUrl + "spriteSheets/frogman/frogmanIcon.png";
const gumBotBlue = nginxAssetServerBaseUrl + "spriteSheets/gumBot/gumBotBlue.png";
const gumBotBlueIcon =
  nginxAssetServerBaseUrl + "spriteSheets/gumBot/gumBotBlueIcon.png";
const gumBotGreen = nginxAssetServerBaseUrl + "spriteSheets/gumBot/gumBotGreen.png";
const gumBotGreenIcon =
  nginxAssetServerBaseUrl + "spriteSheets/gumBot/gumBotGreenIcon.png";
const gumBotPink = nginxAssetServerBaseUrl + "spriteSheets/gumBot/gumBotPink.png";
const gumBotPinkIcon =
  nginxAssetServerBaseUrl + "spriteSheets/gumBot/gumBotPinkIcon.png";
const gumBotRed = nginxAssetServerBaseUrl + "spriteSheets/gumBot/gumBotRed.png";
const gumBotRedIcon =
  nginxAssetServerBaseUrl + "spriteSheets/gumBot/gumBotRedIcon.png";
const llama = nginxAssetServerBaseUrl + "spriteSheets/llama/llama.png";
const llamaIcon =
  nginxAssetServerBaseUrl + "spriteSheets/llama/llamaIcon.png";
const bee = nginxAssetServerBaseUrl + "spriteSheets/monsters/bee.png";
const beeIcon =
  nginxAssetServerBaseUrl + "spriteSheets/monsters/beeIcon.png";
const eyeball = nginxAssetServerBaseUrl + "spriteSheets/monsters/eyeball.png";
const eyeballIcon =
  nginxAssetServerBaseUrl + "spriteSheets/monsters/eyeballIcon.png";
const ghost = nginxAssetServerBaseUrl + "spriteSheets/monsters/ghost.png";
const ghostIcon =
  nginxAssetServerBaseUrl + "spriteSheets/monsters/ghostIcon.png";
const manEatingFlower = nginxAssetServerBaseUrl + "spriteSheets/monsters/manEatingFlower.png";
const manEatingFlowerIcon =
  nginxAssetServerBaseUrl + "spriteSheets/monsters/manEatingFlowerIcon.png";
const pumpking = nginxAssetServerBaseUrl + "spriteSheets/monsters/pumpking.png";
const pumpkingIcon =
  nginxAssetServerBaseUrl + "spriteSheets/monsters/pumpkingIcon.png";
const pirateCaptain = nginxAssetServerBaseUrl + "spriteSheets/pirates/pirateCaptain.png";
const pirateCaptainIcon =
  nginxAssetServerBaseUrl + "spriteSheets/pirates/pirateCaptainIcon.png";
const sheep = nginxAssetServerBaseUrl + "spriteSheets/sheep/sheep.png";
const sheepIcon =
  nginxAssetServerBaseUrl + "spriteSheets/sheep/sheepIcon.png";
const blueSlime = nginxAssetServerBaseUrl + "spriteSheets/slimes/blueSlime.png";
const blueSlimeIcon =
  nginxAssetServerBaseUrl + "spriteSheets/slimes/blueSlimeIcon.png";
const greenSlime = nginxAssetServerBaseUrl + "spriteSheets/slimes/greenSlime.png";
const greenSlimeIcon =
  nginxAssetServerBaseUrl + "spriteSheets/slimes/greenSlimeIcon.png";
const limeSlime = nginxAssetServerBaseUrl + "spriteSheets/slimes/limeSlime.png";
const limeSlimeIcon =
  nginxAssetServerBaseUrl + "spriteSheets/slimes/limeSlimeIcon.png";
const pinkSlime = nginxAssetServerBaseUrl + "spriteSheets/slimes/pinkSlime.png";
const pinkSlimeIcon =
  nginxAssetServerBaseUrl + "spriteSheets/slimes/pinkSlimeIcon.png";
const wizard = nginxAssetServerBaseUrl + "spriteSheets/wizard/wizard.png";
const wizardIcon =
  nginxAssetServerBaseUrl + "spriteSheets/wizard/wizardIcon.png";
const bloodyZombie = nginxAssetServerBaseUrl + "spriteSheets/zombies/bloodyZombie.png";
const bloodyZombieIcon =
  nginxAssetServerBaseUrl + "spriteSheets/zombies/bloodyZombieIcon.png";
const headlessZombie = nginxAssetServerBaseUrl + "spriteSheets/zombies/headlessZombie.png";
const headlessZombieIcon =
  nginxAssetServerBaseUrl + "spriteSheets/zombies/headlessZombieIcon.png";
const rottingZombie = nginxAssetServerBaseUrl + "spriteSheets/zombies/rottingZombie.png";
const rottingZombieIcon =
  nginxAssetServerBaseUrl + "spriteSheets/zombies/rottingZombieIcon.png";
const zombie = nginxAssetServerBaseUrl + "spriteSheets/zombies/zombie.png";
const zombieIcon =
  nginxAssetServerBaseUrl + "spriteSheets/zombies/zombieIcon.png";

export const coreAnimations = ["walk", "idle"];

export type SpriteAnimationsTypes =
  | "run"
  | "walk"
  | "idle"
  | "jump"
  | "swim"
  | "attack"
  | "damaged"
  | "die";
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
  | "wildPig"
  | "bunny"
  | "redBat"
  | "purpleBat"
  | "hero"
  | "blackBeardDwarf"
  | "blueDwarf"
  | "greenDwarf"
  | "lumberjackDwarf"
  | "redBeardDwarf"
  | "redDwarf"
  | "goblinAssassin"
  | "goblinGuard"
  | "goblinLord"
  | "goblinMage"
  | "goblinPeasant"
  | "goblinSamurai"
  | "goblinSoldier"
  | "knight"
  | "baldric"
  | "mage"
  | "musketCaptain"
  | "ninja"
  | "orc"
  | "soldier"
  | "shieldMaiden"
  | "bear"
  | "boar"
  | "deer"
  | "fox"
  | "rabbit"
  | "wolf"
  | "beetle"
  | "armedBones"
  | "bones"
  | "eyeBat"
  | "fang"
  | "giant"
  | "goo"
  | "hoodfang"
  | "horns"
  | "spider"
  | "vampireBat"
  | "cow"
  | "fly"
  | "frogman"
  | "gumBotBlue"
  | "gumBotGreen"
  | "gumBotPink"
  | "gumBotRed"
  | "llama"
  | "bee"
  | "eyeball"
  | "ghost"
  | "manEatingFlower"
  | "pumpking"
  | "pirateCaptain"
  | "sheep"
  | "blueSlime"
  | "greenSlime"
  | "limeSlime"
  | "pinkSlime"
  | "wizard"
  | "bloodyZombie"
  | "headlessZombie"
  | "rottingZombie"
  | "zombie";

export const littleBuddySemanticKeywords: Record<LittleBuddiesTypes, string[]> =
  {
    horse: ["animal", "ride", "fast", "mane", "hoof", "stable"],
    poring: ["slime", "cute", "bouncy", "jelly", "simple", "blob"],
    toucan: ["bird", "colorful", "jungle", "beak", "tropical", "loud"],
    wasp: ["insect", "sting", "bug", "buzz", "aggressive", "flying"],
    leafBug: ["bug", "leaf", "green", "camouflage", "insect", "nature"],
    skeleton: ["bones", "undead", "scary", "death", "dark", "grave"],
    blueBird: ["bird", "blue", "sky", "chirp", "small"],
    greenBird: ["bird", "green", "forest", "feathers", "perch"],
    blackBird: ["bird", "black", "ominous", "feathers", "mystery"],
    whiteBird: ["bird", "white", "pure", "light", "graceful"],
    sickBird: ["bird", "sick", "ill", "weak", "infected"],
    deadBird: ["bird", "dead", "ghost", "spirit", "haunted"],
    fireBird: ["bird", "fire", "flame", "red", "phoenix", "burning"],
    flameBird: ["bird", "fire", "flame", "embers", "hot"],
    technoBird: ["bird", "robot", "techno", "mechanical", "cyber", "wires"],
    redBird: ["bird", "red", "angry", "bright", "loud"],
    rainbowBird: ["bird", "rainbow", "colorful", "magical", "vibrant"],
    angel: ["holy", "wings", "heaven", "light", "divine", "halo"],
    redDemon: ["demon", "fire", "red", "evil", "horns", "hell"],
    whiteDemon: ["demon", "white", "ghost", "evil", "phantom", "curse"],
    chicken: ["bird", "farm", "egg", "cluck", "feathers", "coop"],
    pig: ["animal", "farm", "pink", "mud", "snout", "oink"],
    wildPig: ["animal", "wild", "tusk", "boar", "aggressive", "forest"],
    bunny: ["animal", "cute", "rabbit", "ears", "hop", "soft"],
    redBat: ["animal", "bat", "red", "nocturnal", "fangs", "cave"],
    purpleBat: ["animal", "bat", "purple", "dark", "night", "wings"],
    hero: ["brave", "leader", "fighter", "savior", "quest", "legend"],
    blackBeardDwarf: [
      "dwarf",
      "black beard",
      "miner",
      "axe",
      "bearded",
      "stout",
    ],
    blueDwarf: ["dwarf", "blue", "armor", "miner", "sturdy", "clan"],
    greenDwarf: ["dwarf", "green", "earth", "miner", "tough", "nature"],
    lumberjackDwarf: ["dwarf", "lumberjack", "axe", "trees", "strong", "plaid"],
    redBeardDwarf: [
      "dwarf",
      "red beard",
      "warrior",
      "hammer",
      "gruff",
      "stout",
    ],
    redDwarf: ["dwarf", "red", "fiery", "stubborn", "mountain", "strong"],
    goblinAssassin: [
      "goblin",
      "stealth",
      "dagger",
      "sneaky",
      "shadow",
      "quick",
    ],
    goblinGuard: ["goblin", "guard", "armor", "patrol", "shield", "watchful"],
    goblinLord: ["goblin", "lord", "leader", "crown", "evil", "command"],
    goblinMage: ["goblin", "mage", "magic", "spell", "robe", "arcane"],
    goblinPeasant: [
      "goblin",
      "peasant",
      "simple",
      "weak",
      "villager",
      "common",
    ],
    goblinSamurai: ["goblin", "samurai", "katana", "armor", "honor", "warrior"],
    goblinSoldier: ["goblin", "soldier", "weapon", "battle", "grunt", "army"],
    knight: ["armor", "sword", "chivalry", "shield", "honor", "battle"],
    baldric: ["armor", "sash", "noble", "fighter", "hero", "regal"],
    mage: ["magic", "staff", "robe", "arcane", "spell", "mana"],
    musketCaptain: ["gun", "captain", "military", "powder", "command", "aim"],
    ninja: ["stealth", "shuriken", "black", "agile", "silent", "assassin"],
    orc: ["orc", "green", "brute", "strong", "warrior", "rage"],
    soldier: ["army", "battle", "uniform", "march", "weapon", "combat"],
    shieldMaiden: ["shield", "female", "warrior", "viking", "brave", "armor"],
    bear: ["animal", "forest", "strong", "claws", "growl", "fur"],
    boar: ["animal", "tusk", "wild", "charge", "forest", "gruff"],
    deer: ["animal", "graceful", "antlers", "forest", "swift", "nature"],
    fox: ["animal", "clever", "red", "sly", "forest", "tail"],
    rabbit: ["animal", "cute", "ears", "hop", "burrow", "soft"],
    wolf: ["animal", "howl", "pack", "fur", "predator", "forest"],
    beetle: ["insect", "shell", "hard", "antennae", "crawl", "bug"],
    armedBones: ["skeleton", "armor", "undead", "weapon", "bones", "warrior"],
    bones: ["skeleton", "bones", "undead", "grave", "spooky", "death"],
    eyeBat: ["bat", "eye", "flying", "creepy", "night", "monster"],
    fang: ["tooth", "sharp", "bite", "predator", "beast", "danger"],
    giant: ["huge", "tall", "strength", "monster", "colossus", "big"],
    goo: ["slime", "sticky", "blob", "gelatinous", "ooze", "gross"],
    hoodfang: ["wolf", "hood", "fangs", "predator", "mystery", "dark"],
    horns: ["horns", "beast", "ram", "charge", "animal", "headbutt"],
    spider: ["arachnid", "web", "eight legs", "crawl", "creepy", "fangs"],
    vampireBat: ["bat", "vampire", "fangs", "blood", "night", "nocturnal"],
    cow: ["animal", "farm", "milk", "moo", "pasture", "bovine"],
    fly: ["insect", "wings", "buzz", "small", "pest", "air"],
    frogman: ["amphibian", "frog", "humanoid", "swamp", "leap", "green"],
    gumBotBlue: ["robot", "blue", "gum", "machine", "mechanical", "toy"],
    gumBotGreen: ["robot", "green", "gum", "machine", "mechanical", "toy"],
    gumBotPink: ["robot", "pink", "gum", "machine", "mechanical", "toy"],
    gumBotRed: ["robot", "red", "gum", "machine", "mechanical", "toy"],
    llama: ["animal", "wool", "spit", "mountain", "long neck", "pack"],
    bee: ["insect", "hive", "honey", "sting", "buzz", "yellow"],
    eyeball: ["eye", "floating", "creepy", "monster", "gaze", "pupil"],
    ghost: ["spirit", "haunted", "invisible", "ethereal", "specter", "spooky"],
    manEatingFlower: ["plant", "carnivorous", "teeth", "trap", "jungle", "danger"],
    pumpking: ["pumpkin", "king", "halloween", "vine", "gourd", "scary"],
    pirateCaptain: ["pirate", "captain", "ship", "treasure", "sword", "sea"],
    sheep: ["animal", "wool", "farm", "flock", "baa", "pasture"],
    blueSlime: ["slime", "blue", "blob", "jelly", "cute", "bounce"],
    greenSlime: ["slime", "green", "blob", "jelly", "goo", "bounce"],
    limeSlime: ["slime", "lime", "blob", "jelly", "goo", "springy"],
    pinkSlime: ["slime", "pink", "blob", "jelly", "cute", "bounce"],
    wizard: ["magic", "staff", "robe", "spell", "arcane", "sage"],
    bloodyZombie: ["zombie", "blood", "undead", "gore", "horror", "rotting"],
    headlessZombie: ["zombie", "headless", "undead", "scary", "decapitated", "horror"],
    rottingZombie: ["zombie", "rotting", "decay", "undead", "smelly", "horror"],
    zombie: ["zombie", "undead", "scary", "horror", "monster", "grave"],
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
      die?: MetaAnimation;
      speak?: MetaAnimation;
      jump?: MetaAnimation;
      swim?: MetaAnimation;
      attack?: MetaAnimation;
      damaged?: MetaAnimation;
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
        die: {
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
    pixelated: true,
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
          core: [8],
          speed: null,
          alt: {
            eat: {
              animation: [20, 21, 23, 24],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [4, 5, 6, 7],
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
          core: [8],
          speed: null,
          alt: {
            eat: {
              animation: [20, 21, 23, 24],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [4, 5, 6, 7],
          speed: 0.1375,
        },
      },
      alt: {},
    },
  },
  wildPig: {
    title: "Wild pig",
    url: wildPig,
    iconUrl: wildPigIcon,
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
  hero: {
    title: "Hero",
    url: hero,
    iconUrl: heroIcon,
    frameHeight: 16,
    frameWidth: 16,
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
          core: [6, 7, 8, 9, 10, 11],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  blackBeardDwarf: {
    title: "Black beard dwarf",
    url: blackBeardDwarf,
    iconUrl: blackBeardDwarfIcon,
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
          core: [7],
          speed: null,
        },
        walk: {
          core: [3, 4, 5],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  blueDwarf: {
    title: "Blue dwarf",
    url: blueDwarf,
    iconUrl: blueDwarfIcon,
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
          core: [7],
          speed: null,
        },
        walk: {
          core: [3, 4, 5],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  greenDwarf: {
    title: "Green dwarf",
    url: greenDwarf,
    iconUrl: greenDwarfIcon,
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
          core: [7],
          speed: null,
        },
        walk: {
          core: [3, 4, 5],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  lumberjackDwarf: {
    title: "Lumberjack dwarf",
    url: lumberjackDwarf,
    iconUrl: lumberjackDwarfIcon,
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
          core: [7],
          speed: null,
        },
        walk: {
          core: [3, 4, 5],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  redBeardDwarf: {
    title: "Red beard dwarf",
    url: redBeardDwarf,
    iconUrl: redBeardDwarfIcon,
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
          core: [7],
          speed: null,
        },
        walk: {
          core: [3, 4, 5],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  redDwarf: {
    title: "Red dwarf",
    url: redDwarf,
    iconUrl: redDwarfIcon,
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
          core: [7],
          speed: null,
        },
        walk: {
          core: [3, 4, 5],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  goblinAssassin: {
    title: "Goblin assassin",
    url: goblinAssassin,
    iconUrl: goblinAssassinIcon,
    frameHeight: 64,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  goblinGuard: {
    title: "Goblin Guard",
    url: goblinGuard,
    iconUrl: goblinGuardIcon,
    frameHeight: 64,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  goblinLord: {
    title: "Goblin lord",
    url: goblinLord,
    iconUrl: goblinLordIcon,
    frameHeight: 64,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  goblinMage: {
    title: "Goblin mage",
    url: goblinMage,
    iconUrl: goblinMageIcon,
    frameHeight: 64,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  goblinPeasant: {
    title: "Goblin peasant",
    url: goblinPeasant,
    iconUrl: goblinPeasantIcon,
    frameHeight: 64,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  goblinSamurai: {
    title: "Goblin samurai",
    url: goblinSamurai,
    iconUrl: goblinSamuraiIcon,
    frameHeight: 64,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  goblinSoldier: {
    title: "Goblin soldier",
    url: goblinSoldier,
    iconUrl: goblinSoldierIcon,
    frameHeight: 64,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
        },
        walk: {
          core: [0, 1, 2, 3, 4, 5, 6],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  knight: {
    title: "Knight",
    url: knight,
    iconUrl: knightIcon,
    frameHeight: 80,
    frameWidth: 120,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [64, 65, 66, 67],
          speed: 0.1125,
        },
        walk: {
          core: [80, 81, 82, 83],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  baldric: {
    title: "Baldric",
    url: baldric,
    iconUrl: baldricIcon,
    frameHeight: 64,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [23],
          speed: null,
        },
        walk: {
          core: [9, 10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  mage: {
    title: "Mage",
    url: mage,
    iconUrl: mageIcon,
    frameHeight: 64,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [23],
          speed: null,
        },
        walk: {
          core: [9, 10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  musketCaptain: {
    title: "Musket captain",
    url: musketCaptain,
    iconUrl: musketCaptainIcon,
    frameHeight: 28,
    frameWidth: 20,
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
          core: [6, 7, 8, 9, 10, 11, 12, 13],
          speed: 0.1125,
        },
      },
      alt: {},
    },
  },
  ninja: {
    title: "Ninja",
    url: ninja,
    iconUrl: ninjaIcon,
    frameHeight: 29,
    frameWidth: 40,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0, 1, 2, 3],
          speed: 0.1125,
        },
        walk: {
          core: [4, 5, 6, 7, 8, 9],
          speed: 0.1125,
        },
      },
      alt: {
        jump: { core: [10, 11, 12, 13], speed: 0.1125 },
        attack: { core: [14, 15, 16], speed: 0.1125 },
        swim: { core: [17, 18, 19, 20, 21, 22], speed: 0.1125 },
      },
    },
  },
  orc: {
    title: "Orc",
    url: orc,
    iconUrl: orcIcon,
    frameHeight: 50,
    frameWidth: 50,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0, 1, 2, 3, 4],
          speed: 0.1125,
        },
        walk: {
          core: [5, 6, 7, 8, 9, 10, 11, 12],
          speed: 0.1125,
        },
      },
      alt: {
        attack: {
          core: [13, 14, 15, 16, 17, 18, 19],
          speed: 0.1125,
        },
        damaged: {
          core: [27, 28, 29],
          speed: 0.1125,
        },
        die: {
          core: [30, 31, 32, 33],
          speed: 0.1125,
        },
      },
    },
  },
  soldier: {
    title: "Soldier",
    url: soldier,
    iconUrl: soldierIcon,
    frameHeight: 60,
    frameWidth: 60,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0, 1, 2, 3, 4],
          speed: 0.1125,
        },
        walk: {
          core: [5, 6, 7, 8, 9, 10, 11, 12, 13],
          speed: 0.1125,
        },
      },
      alt: {
        attack: {
          core: [14, 15, 16, 17, 18, 19],
          speed: 0.1125,
        },
        damaged: {
          core: [36, 37, 38],
          speed: 0.1125,
        },
        die: {
          core: [39, 40, 41, 42],
          speed: 0.1125,
        },
      },
    },
  },
  shieldMaiden: {
    title: "Shield maiden",
    url: shieldMaiden,
    iconUrl: shieldMaidenIcon,
    frameHeight: 29,
    frameWidth: 40,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [3, 4, 5, 6],
          speed: 0.1125,
        },
        walk: {
          core: [13, 14, 15, 16, 17, 18],
          speed: 0.1125,
        },
      },
      alt: {
        jump: {
          core: [6, 7, 8, 9, 10, 11],
          speed: 0.1125,
        },
        swim: {
          core: [19, 20, 21, 22, 23, 24],
          speed: 0.1125,
        },
      },
    },
  },
  bear: {
    title: "Bear",
    url: bear,
    iconUrl: bearIcon,
    frameHeight: 33,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            sniff: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [12, 13, 14, 15, 16, 17, 18, 19],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [20, 21, 22, 23, 24],
          speed: 0.1125,
        },
      },
    },
  },
  boar: {
    title: "Boar",
    url: boar,
    iconUrl: boarIcon,
    frameHeight: 40,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            tailWag: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [8, 9, 10, 11, 12, 13, 14, 15],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [16, 17, 18, 19, 20, 21],
          speed: 0.1125,
        },
      },
    },
  },
  deer: {
    title: "Deer",
    url: deer,
    iconUrl: deerIcon,
    frameHeight: 52,
    frameWidth: 72,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            graze: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },
  fox: {
    title: "Fox",
    url: fox,
    iconUrl: foxIcon,
    frameHeight: 36,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0, 1, 2, 3, 4, 5],
          speed: 0.15,
        },
        walk: {
          core: [6, 7, 8, 9, 10, 11, 12, 13],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [14, 15, 16, 17, 18, 19],
          speed: 0.1125,
        },
      },
    },
  },
  rabbit: {
    title: "Rabbit",
    url: rabbit,
    iconUrl: rabbitIcon,
    frameHeight: 26,
    frameWidth: 32,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            sniff: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [20, 21, 22, 23, 24, 25],
          speed: 0.1125,
        },
      },
    },
  },
  wolf: {
    title: "Wolf",
    url: wolf,
    iconUrl: wolfIcon,
    frameHeight: 40,
    frameWidth: 64,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },
  beetle: {
    title: "Beetle",
    url: beetle,
    iconUrl: beetleIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },armedBones: {
    title: "Armed bones",
    url: armedBones,
    iconUrl: armedBonesIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },bones: {
    title: "Bones",
    url: bones,
    iconUrl: bonesIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },eyeBat: {
    title: "Eyeball bat",
    url: eyeBat,
    iconUrl: eyeBatIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },fang: {
    title: "Fang",
    url: fang,
    iconUrl: fangIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },giant: {
    title: "Giant",
    url: giant,
    iconUrl: giantIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },goo: {
    title: "Goo",
    url: goo,
    iconUrl: gooIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },hoodfang: {
    title: "Hoodfang",
    url: hoodfang,
    iconUrl: hoodfangIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },horns: {
    title: "Horns",
    url: horns,
    iconUrl: hornsIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },spider: {
    title: "Spider",
    url: spider,
    iconUrl: spiderIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },vampireBat: {
    title: "Vampire bat",
    url: vampireBat,
    iconUrl: vampireBatIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },cow: {
    title: "Cow",
    url: cow,
    iconUrl: cowIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },fly: {
    title: "Fly",
    url: fly,
    iconUrl: flyIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },frogman: {
    title: "Frogman",
    url: frogman,
    iconUrl: frogmanIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },gumBotBlue: {
    title: "Gum bot - blue",
    url: gumBotBlue,
    iconUrl: gumBotBlueIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },gumBotGreen: {
    title: "Gum bot - green",
    url: gumBotGreen,
    iconUrl: gumBotGreenIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },gumBotPink: {
    title: "Gum bot - pink",
    url: gumBotPink,
    iconUrl: gumBotPinkIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },gumBotRed: {
    title: "Gum bot - red",
    url: gumBotRed,
    iconUrl: gumBotRedIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },llama: {
    title: "Llama",
    url: llama,
    iconUrl: llamaIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },bee: {
    title: "Bee",
    url: bee,
    iconUrl: beeIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },eyeball: {
    title: "Eyeball",
    url: eyeball,
    iconUrl: eyeballIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },ghost: {
    title: "Ghost",
    url: ghost,
    iconUrl: ghostIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },manEatingFlower: {
    title: "Man eating flower",
    url: manEatingFlower,
    iconUrl: manEatingFlowerIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },pumpking: {
    title: "Pumpking",
    url: pumpking,
    iconUrl: pumpkingIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },pirateCaptain: {
    title: "Pirate captain",
    url: pirateCaptain,
    iconUrl: pirateCaptainIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },sheep: {
    title: "Sheep",
    url: sheep,
    iconUrl: sheepIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },blueSlime: {
    title: "Blue slime",
    url: blueSlime,
    iconUrl: blueSlimeIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },greenSlime: {
    title: "Green slime",
    url: greenSlime,
    iconUrl: greenSlimeIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },limeSlime: {
    title: "Lime slime",
    url: limeSlime,
    iconUrl: limeSlimeIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },pinkSlime: {
    title: "Pink slime",
    url: pinkSlime,
    iconUrl: pinkSlimeIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },wizard: {
    title: "Wizard",
    url: wizard,
    iconUrl: wizardIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },bloodyZombie: {
    title: "Bloody zombie",
    url: bloodyZombie,
    iconUrl: bloodyZombieIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },headlessZombie: {
    title: "Headless zombie",
    url: headlessZombie,
    iconUrl: headlessZombieIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },rottingZombie: {
    title: "Rotting zombie",
    url: rottingZombie,
    iconUrl: rottingZombieIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },zombie: {
    title: "Zombie",
    url: zombie,
    iconUrl: zombieIcon,
    frameHeight: ,
    frameWidth: ,
    walkSpeed: 0.2,
    runSpeed: 0.3,
    rotatable: false,
    flipTextures: false,
    pixelated: true,
    animations: {
      core: {
        idle: {
          core: [0],
          speed: null,
          alt: {
            howl: {
              animation: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
              loop: false,
              speed: 0.15,
            },
          },
        },
        walk: {
          core: [10, 11, 12, 13, 14, 15, 16, 17],
          speed: 0.1125,
        },
      },
      alt: {
        run: {
          core: [18, 19, 20, 21, 22, 23],
          speed: 0.1125,
        },
      },
    },
  },
};
