export type ImageEffectTypes =
  | "postProcess"
  | "hideBackground"
  | "blur"
  | "tint"
  | "glasses"
  | "beards"
  | "mustaches"
  | "masks"
  | "hats"
  | "pets";

export type ImageEffectStylesType = {
  postProcess: {
    style: PostProcessEffectsTypes;
  };
  hideBackground: {
    style: HideBackgroundEffectTypes;
    color: string;
  };
  glasses: {
    style: GlassesEffectTypes;
  };
  beards: {
    style: BeardsEffectTypes;
  };
  mustaches: {
    style: MustachesEffectTypes;
  };
  masks: {
    style: MasksEffectTypes;
  };
  hats: {
    style: HatsEffectTypes;
  };
  pets: {
    style: PetsEffectTypes;
  };
};

export const imageEffectStylesEncodingMap = {
  postProcess: 0,
  hideBackground: 1,
  glasses: 2,
  beards: 3,
  mustaches: 4,
  masks: 5,
  hats: 6,
  pets: 7,
};

export type PostProcessEffectsTypes =
  | "prismaColors"
  | "blackAndWhite"
  | "bubbleChromatic"
  | "fisheye"
  | "nightVision"
  | "vintageTV"
  | "motionblur"
  | "pixelation"
  | "old"
  | "chromaticAberration"
  | "colorSplash"
  | "tonemap"
  | "rays"
  | "sharpen"
  | "tiltShift"
  | "cartoon";
export type HideBackgroundEffectTypes =
  | "color"
  | "beach"
  | "brickWall"
  | "butterflies"
  | "cafe"
  | "chalkBoard"
  | "citySkyline"
  | "cliffPalace"
  | "eveningMcDonaldLake"
  | "forest"
  | "halfDomeAppleOrchard"
  | "lake"
  | "library"
  | "milkyWay"
  | "mountains"
  | "ocean"
  | "oldFaithfulGeyser"
  | "railroad"
  | "rollingHills"
  | "seaSideHouses"
  | "snowCoveredMoutains"
  | "sunflowers"
  | "sunset"
  | "trees"
  | "windingRoad";
export type BeardsEffectTypes =
  | "classicalCurlyBeard"
  | "chinBeard"
  | "fullBeard";
export type GlassesEffectTypes =
  | "defaultGlasses"
  | "aviatorGoggles"
  | "bloodyGlasses"
  | "eyeProtectionGlasses"
  | "glasses1"
  | "glasses2"
  | "glasses3"
  | "glasses4"
  | "glasses5"
  | "glasses6"
  | "memeGlasses"
  | "militaryTacticalGlasses"
  | "shades"
  | "steampunkGlasses"
  | "threeDGlasses"
  | "toyGlasses"
  | "VRGlasses";
export type MustachesEffectTypes =
  | "disguiseMustache"
  | "fullMustache"
  | "mustache1"
  | "mustache2"
  | "mustache3"
  | "mustache4"
  | "nicodemusMustache"
  | "pencilMustache"
  | "spongebobMustache"
  | "tinyMustache"
  | "wingedMustache";
export type MasksEffectTypes =
  | "baseMask"
  | "alienMask"
  | "clownMask"
  | "creatureMask"
  | "cyberMask"
  | "darkKnightMask"
  | "demonMask"
  | "gasMask1"
  | "gasMask2"
  | "gasMask3"
  | "gasMask4"
  | "masqueradeMask"
  | "metalManMask"
  | "oniMask"
  | "plagueDoctorMask"
  | "sixEyesMask"
  | "tenguMask"
  | "threeFaceMask"
  | "weldingMask"
  | "woodlandMask"
  | "woodPaintedMask"
  | "zombieMask";
export type HatsEffectTypes =
  | "AsianConicalHat"
  | "aviatorHelmet"
  | "bicornHat"
  | "bicycleHelmet"
  | "captainsHat"
  | "chefHat"
  | "chickenHat"
  | "deadManHat"
  | "dogEars"
  | "flatCap"
  | "hardHat"
  | "hopliteHelmet"
  | "militaryHat"
  | "rabbitEars"
  | "santaHat"
  | "seamanHat"
  | "stylishHat"
  | "ushankaHat"
  | "vikingHelmet";
export type PetsEffectTypes =
  | "angryHamster"
  | "axolotl"
  | "babyDragon"
  | "beardedDragon"
  | "bird1"
  | "bird2"
  | "boxer"
  | "brain"
  | "buddyHamster"
  | "cat1"
  | "cat2"
  | "dodoBird"
  | "happyHamster"
  | "mechanicalGrasshopper"
  | "panda1"
  | "panda2"
  | "petRock"
  | "pig"
  | "redFox1"
  | "redFox2"
  | "roboDog"
  | "skeletonTRex"
  | "snail"
  | "spinosaurus"
  | "TRex";

export const postProcessEffectsEncodingMap = {
  prismaColors: 0,
  blackAndWhite: 1,
  bubbleChromatic: 2,
  fisheye: 3,
  nightVision: 4,
  vintageTV: 5,
  motionblur: 6,
  pixelation: 7,
  old: 8,
  chromaticAberration: 9,
  colorSplash: 10,
  tonemap: 11,
  rays: 12,
  sharpen: 13,
  tiltShift: 14,
  cartoon: 15,
};
export const hideBackgroundEffectEncodingMap = {
  color: 0,
  beach: 1,
  brickWall: 2,
  butterflies: 3,
  cafe: 4,
  chalkBoard: 5,
  citySkyline: 6,
  cliffPalace: 7,
  eveningMcDonaldLake: 8,
  forest: 9,
  halfDomeAppleOrchard: 10,
  lake: 11,
  library: 12,
  milkyWay: 13,
  mountains: 14,
  ocean: 15,
  oldFaithfulGeyser: 16,
  railroad: 17,
  rollingHills: 18,
  seaSideHouses: 19,
  snowCoveredMoutains: 20,
  sunflowers: 21,
  sunset: 22,
  trees: 23,
  windingRoad: 24,
};
export const beardsEffectEncodingMap = {
  classicalCurlyBeard: 0,
  chinBeard: 1,
  fullBeard: 2,
};
export const glassesEffectEncodingMap = {
  defaultGlasses: 0,
  aviatorGoggles: 1,
  bloodyGlasses: 2,
  eyeProtectionGlasses: 3,
  glasses1: 4,
  glasses2: 5,
  glasses3: 6,
  glasses4: 7,
  glasses5: 8,
  glasses6: 9,
  memeGlasses: 10,
  militaryTacticalGlasses: 11,
  shades: 12,
  steampunkGlasses: 13,
  threeDGlasses: 14,
  toyGlasses: 15,
  VRGlasses: 16,
};
export const mustachesEffectEncodingMap = {
  disguiseMustache: 0,
  fullMustache: 1,
  mustache1: 2,
  mustache2: 3,
  mustache3: 4,
  mustache4: 5,
  nicodemusMustache: 6,
  pencilMustache: 7,
  spongebobMustache: 8,
  tinyMustache: 9,
  wingedMustache: 10,
};
export const masksEffectEncodingMap = {
  baseMask: 0,
  alienMask: 1,
  clownMask: 2,
  creatureMask: 3,
  cyberMask: 4,
  darkKnightMask: 5,
  demonMask: 6,
  gasMask1: 7,
  gasMask2: 8,
  gasMask3: 9,
  gasMask4: 10,
  masqueradeMask: 11,
  metalManMask: 12,
  oniMask: 13,
  plagueDoctorMask: 14,
  sixEyesMask: 15,
  tenguMask: 16,
  threeFaceMask: 17,
  weldingMask: 18,
  woodlandMask: 19,
  woodPaintedMask: 20,
  zombieMask: 21,
};
export const hatsEffectEncodingMap = {
  AsianConicalHat: 0,
  aviatorHelmet: 1,
  bicornHat: 2,
  bicycleHelmet: 3,
  captainsHat: 4,
  chefHat: 5,
  chickenHat: 6,
  deadManHat: 7,
  dogEars: 8,
  flatCap: 9,
  hardHat: 10,
  hopliteHelmet: 11,
  militaryHat: 12,
  rabbitEars: 13,
  santaHat: 14,
  seamanHat: 15,
  stylishHat: 16,
  ushankaHat: 17,
  vikingHelmet: 18,
};
export const petsEffectEncodingMap = {
  angryHamster: 0,
  axolotl: 1,
  babyDragon: 2,
  beardedDragon: 3,
  bird1: 4,
  bird2: 5,
  boxer: 6,
  brain: 7,
  buddyHamster: 8,
  cat1: 9,
  cat2: 10,
  dodoBird: 11,
  happyHamster: 12,
  mechanicalGrasshopper: 13,
  panda1: 14,
  panda2: 15,
  petRock: 16,
  pig: 17,
  redFox1: 18,
  redFox2: 19,
  roboDog: 20,
  skeletonTRex: 21,
  snail: 22,
  spinosaurus: 23,
  TRex: 24,
};
