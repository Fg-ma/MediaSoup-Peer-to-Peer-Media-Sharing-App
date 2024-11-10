export interface CameraEffectStylesType {
  pause: {
    style: "";
  };
  blur: {
    style: "";
  };
  tint: {
    style: "";
  };
  postProcess: {
    style: PostProcessEffects;
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
}

export type PostProcessEffects =
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
  | "AmericaGlasses"
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

export interface ScreenEffectStylesType {
  postProcess: {
    style: PostProcessEffects;
  };
}

export type AudioEffectStylesType = object;

export type BackgroundMusicTypes =
  | "adventureTime"
  | "cacophony"
  | "drumBeat"
  | "funk"
  | "harmonica"
  | "mischief"
  | "outWest"
  | "piano"
  | "retroGame"
  | "royalProcession"
  | "space"
  | "ukulele"
  | "wacky";

export interface EffectStylesType {
  camera: {
    [id: string]: CameraEffectStylesType;
  };
  screen: {
    [id: string]: ScreenEffectStylesType;
  };
  audio: AudioEffectStylesType;
}

export const defaultPostProcess: PostProcessEffects = "prismaColors";
export const defaultHideBackground: HideBackgroundEffectTypes = "beach";
export const defaultHideBackgroundColor = "#F56114";
export const defaultBeard: BeardsEffectTypes = "classicalCurlyBeard";
export const defaultGlasses: GlassesEffectTypes = "defaultGlasses";
export const defaultMustache: MustachesEffectTypes = "mustache1";
export const defaultMask: MasksEffectTypes = "baseMask";
export const defaultHat: HatsEffectTypes = "stylishHat";
export const defaultPet: PetsEffectTypes = "beardedDragon";

export const defaultBackgroundMusic: BackgroundMusicTypes = "mischief";

export const defaultCameraCurrentEffectsStyles: CameraEffectStylesType =
  Object.freeze({
    pause: Object.freeze({
      style: "",
    }),
    blur: Object.freeze({
      style: "",
    }),
    tint: Object.freeze({
      style: "",
    }),
    postProcess: Object.freeze({
      style: defaultPostProcess,
    }),
    hideBackground: Object.freeze({
      style: defaultHideBackground,
      color: defaultHideBackgroundColor,
    }),
    glasses: Object.freeze({
      style: defaultGlasses,
    }),
    beards: Object.freeze({
      style: defaultBeard,
    }),
    mustaches: Object.freeze({
      style: defaultMustache,
    }),
    masks: Object.freeze({
      style: defaultMask,
    }),
    hats: Object.freeze({
      style: defaultHat,
    }),
    pets: Object.freeze({
      style: defaultPet,
    }),
  });

export const defaultScreenCurrentEffectsStyles: ScreenEffectStylesType =
  Object.freeze({
    postProcess: Object.freeze({
      style: defaultPostProcess,
    }),
  });

export const defaultAudioCurrentEffectsStyles: AudioEffectStylesType =
  Object.freeze({});
