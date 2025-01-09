export type CameraEffectTypes =
  | "pause"
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

export type ScreenEffectTypes = "pause" | "postProcess" | "blur" | "tint";

export type AudioEffectTypes =
  | "robot"
  | "echo"
  | "alien"
  | "underwater"
  | "telephone"
  | "space"
  | "distortion"
  | "vintage"
  | "psychedelic"
  | "deepBass"
  | "highEnergy"
  | "ambient"
  | "glitch"
  | "muffled"
  | "crystal"
  | "heavyMetal"
  | "dreamy"
  | "horror"
  | "sciFi"
  | "dystopian"
  | "retroGame"
  | "ghostly"
  | "metallic"
  | "hypnotic"
  | "cyberpunk"
  | "windy"
  | "radio"
  | "explosion"
  | "whisper"
  | "submarine"
  | "windTunnel"
  | "crushedBass"
  | "ethereal"
  | "electroSting"
  | "heartbeat"
  | "underworld"
  | "sizzling"
  | "staticNoise"
  | "bubbly"
  | "thunder"
  | "echosOfThePast";

export type VideoEffectTypes =
  | "pause"
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

export type UserStreamEffectsType = {
  camera: {
    [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
  };
  screen: {
    [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
  };
  screenAudio: {
    [screenAudioId: string]: { [effectType in AudioEffectTypes]: boolean };
  };
  audio: {
    [effectType in AudioEffectTypes]: boolean;
  };
  video: {
    [cameraId: string]: {
      video: { [effectType in VideoEffectTypes]: boolean };
      audio: { [effectType in AudioEffectTypes]: boolean };
    };
  };
};

export type RemoteStreamEffectsType = {
  [username: string]: {
    [instance: string]: {
      camera: {
        [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      screenAudio: {
        [screenAudioId: string]: {
          [effectType in AudioEffectTypes]: boolean;
        };
      };
      audio: { [effectType in AudioEffectTypes]: boolean };
    };
  };
};

export type CameraEffectStylesType = {
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
};

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

export type VideoEffectStylesType = {
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

export type UserEffectsStylesType = {
  camera: {
    [cameraId: string]: CameraEffectStylesType;
  };
  screen: {
    [screenId: string]: ScreenEffectStylesType;
  };
  screenAudio: {
    [screenAudioId: string]: AudioEffectStylesType;
  };
  audio: AudioEffectStylesType;
  video: {
    [videoId: string]: {
      video: VideoEffectStylesType;
      audio: AudioEffectStylesType;
    };
  };
};

export type RemoteEffectStylesType = {
  [username: string]: {
    [instance: string]: UserEffectsStylesType;
  };
};

export const defaultAudioStreamEffects: {
  [effect in AudioEffectTypes]: boolean;
} = Object.freeze({
  robot: false,
  echo: false,
  alien: false,
  underwater: false,
  telephone: false,
  space: false,
  distortion: false,
  vintage: false,
  psychedelic: false,
  deepBass: false,
  highEnergy: false,
  ambient: false,
  glitch: false,
  muffled: false,
  crystal: false,
  heavyMetal: false,
  dreamy: false,
  horror: false,
  sciFi: false,
  dystopian: false,
  retroGame: false,
  ghostly: false,
  metallic: false,
  hypnotic: false,
  cyberpunk: false,
  windy: false,
  radio: false,
  explosion: false,
  whisper: false,
  submarine: false,
  windTunnel: false,
  crushedBass: false,
  ethereal: false,
  electroSting: false,
  heartbeat: false,
  underworld: false,
  sizzling: false,
  staticNoise: false,
  bubbly: false,
  thunder: false,
  echosOfThePast: false,
});

export const defaultCameraStreamEffects: {
  [effect in CameraEffectTypes]: boolean;
} = Object.freeze({
  pause: false,
  postProcess: false,
  hideBackground: false,
  blur: false,
  tint: false,
  glasses: false,
  beards: false,
  mustaches: false,
  masks: false,
  hats: false,
  pets: false,
});

export const defaultScreenStreamEffects: {
  [effect in ScreenEffectTypes]: boolean;
} = Object.freeze({
  postProcess: false,
  pause: false,
  blur: false,
  tint: false,
});

export const defaultVideoStreamEffects: {
  [effect in VideoEffectTypes]: boolean;
} = Object.freeze({
  pause: false,
  postProcess: false,
  hideBackground: false,
  blur: false,
  tint: false,
  glasses: false,
  beards: false,
  mustaches: false,
  masks: false,
  hats: false,
  pets: false,
});

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

export const defaultCameraEffectsStyles: CameraEffectStylesType = Object.freeze(
  {
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
  }
);

export const defaultScreenEffectsStyles: ScreenEffectStylesType = Object.freeze(
  {
    postProcess: Object.freeze({
      style: defaultPostProcess,
    }),
  }
);

export const defaultAudioEffectsStyles: AudioEffectStylesType = Object.freeze(
  {}
);

export const defaultVideoEffectsStyles: VideoEffectStylesType = Object.freeze({
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
