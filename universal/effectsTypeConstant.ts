import { z } from "zod";

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
export const CameraEffectTypesArray = [
  "pause",
  "postProcess",
  "hideBackground",
  "blur",
  "tint",
  "glasses",
  "beards",
  "mustaches",
  "masks",
  "hats",
  "pets",
] as const;

export type ScreenEffectTypes = "pause" | "postProcess" | "blur" | "tint";
export const ScreenEffectTypesArray = [
  "pause",
  "postProcess",
  "blur",
  "tint",
] as const;

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
export const AudioEffectTypesArray = [
  "robot",
  "echo",
  "alien",
  "underwater",
  "telephone",
  "space",
  "distortion",
  "vintage",
  "psychedelic",
  "deepBass",
  "highEnergy",
  "ambient",
  "glitch",
  "muffled",
  "crystal",
  "heavyMetal",
  "dreamy",
  "horror",
  "sciFi",
  "dystopian",
  "retroGame",
  "ghostly",
  "metallic",
  "hypnotic",
  "cyberpunk",
  "windy",
  "radio",
  "explosion",
  "whisper",
  "submarine",
  "windTunnel",
  "crushedBass",
  "ethereal",
  "electroSting",
  "heartbeat",
  "underworld",
  "sizzling",
  "staticNoise",
  "bubbly",
  "thunder",
  "echosOfThePast",
] as const;

export type VideoEffectTypes =
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

export type SvgEffectTypes =
  | "shadow"
  | "blur"
  | "grayscale"
  | "saturate"
  | "edgeDetection"
  | "colorOverlay"
  | "waveDistortion"
  | "crackedGlass"
  | "neonGlow";

export type ApplicationEffectTypes = "postProcess" | "blur" | "tint";

export type CaptureEffectTypes =
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

export type SoundClipEffectTypes =
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

export type UserEffectsType = {
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
};
export const UserEffectsSchema = z.object({
  camera: z.record(z.record(z.enum(CameraEffectTypesArray), z.boolean())),
  screen: z.record(z.record(z.enum(ScreenEffectTypesArray), z.boolean())),
  screenAudio: z.record(z.record(z.enum(AudioEffectTypesArray), z.boolean())),
  audio: z.record(z.enum(AudioEffectTypesArray), z.boolean()),
});

export type RemoteEffectsType = {
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

export type StaticContentEffectsType = {
  video: {
    [videoId: string]: {
      video: { [effectType in VideoEffectTypes]: boolean };
      audio: { [effectType in AudioEffectTypes]: boolean };
    };
  };
  image: {
    [imageId: string]: {
      [effectType in ImageEffectTypes]: boolean;
    };
  };
  svg: {
    [svgId: string]: {
      [effectType in SvgEffectTypes]: boolean;
    };
  };
  application: {
    [applicationId: string]: {
      [effectType in ApplicationEffectTypes]: boolean;
    };
  };
  soundClip: {
    [soundClipId: string]: { [effectType in AudioEffectTypes]: boolean };
  };
};

export type CaptureEffectsType = {
  [effectType in CaptureEffectTypes]: boolean;
};

export type PostProcessEffectTypes =
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
export const PostProcessEffectTypesArray = [
  "prismaColors",
  "blackAndWhite",
  "bubbleChromatic",
  "fisheye",
  "nightVision",
  "vintageTV",
  "motionblur",
  "pixelation",
  "old",
  "chromaticAberration",
  "colorSplash",
  "tonemap",
  "rays",
  "sharpen",
  "tiltShift",
  "cartoon",
] as const;
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
export const HideBackgroundEffectTypesArray = [
  "color",
  "beach",
  "brickWall",
  "butterflies",
  "cafe",
  "chalkBoard",
  "citySkyline",
  "cliffPalace",
  "eveningMcDonaldLake",
  "forest",
  "halfDomeAppleOrchard",
  "lake",
  "library",
  "milkyWay",
  "mountains",
  "ocean",
  "oldFaithfulGeyser",
  "railroad",
  "rollingHills",
  "seaSideHouses",
  "snowCoveredMoutains",
  "sunflowers",
  "sunset",
  "trees",
  "windingRoad",
] as const;
export type BeardsEffectTypes =
  | "classicalCurlyBeard"
  | "chinBeard"
  | "fullBeard";
export const BeardsEffectTypesArray = [
  "classicalCurlyBeard",
  "chinBeard",
  "fullBeard",
] as const;
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
export const GlassesEffectTypesArray = [
  "defaultGlasses",
  "aviatorGoggles",
  "bloodyGlasses",
  "eyeProtectionGlasses",
  "glasses1",
  "glasses2",
  "glasses3",
  "glasses4",
  "glasses5",
  "glasses6",
  "memeGlasses",
  "militaryTacticalGlasses",
  "shades",
  "steampunkGlasses",
  "threeDGlasses",
  "toyGlasses",
  "VRGlasses",
] as const;
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
export const MustachesEffectTypesArray = [
  "disguiseMustache",
  "fullMustache",
  "mustache1",
  "mustache2",
  "mustache3",
  "mustache4",
  "nicodemusMustache",
  "pencilMustache",
  "spongebobMustache",
  "tinyMustache",
  "wingedMustache",
] as const;
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
export const MasksEffectTypesArray = [
  "baseMask",
  "alienMask",
  "clownMask",
  "creatureMask",
  "cyberMask",
  "darkKnightMask",
  "demonMask",
  "gasMask1",
  "gasMask2",
  "gasMask3",
  "gasMask4",
  "masqueradeMask",
  "metalManMask",
  "oniMask",
  "plagueDoctorMask",
  "sixEyesMask",
  "tenguMask",
  "threeFaceMask",
  "weldingMask",
  "woodlandMask",
  "woodPaintedMask",
  "zombieMask",
] as const;
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
export const HatsEffectTypesArray = [
  "AsianConicalHat",
  "aviatorHelmet",
  "bicornHat",
  "bicycleHelmet",
  "captainsHat",
  "chefHat",
  "chickenHat",
  "deadManHat",
  "dogEars",
  "flatCap",
  "hardHat",
  "hopliteHelmet",
  "militaryHat",
  "rabbitEars",
  "santaHat",
  "seamanHat",
  "stylishHat",
  "ushankaHat",
  "vikingHelmet",
] as const;
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
export const PetsEffectTypesArray = [
  "angryHamster",
  "axolotl",
  "babyDragon",
  "beardedDragon",
  "bird1",
  "bird2",
  "boxer",
  "brain",
  "buddyHamster",
  "cat1",
  "cat2",
  "dodoBird",
  "happyHamster",
  "mechanicalGrasshopper",
  "panda1",
  "panda2",
  "petRock",
  "pig",
  "redFox1",
  "redFox2",
  "roboDog",
  "skeletonTRex",
  "snail",
  "spinosaurus",
  "TRex",
] as const;

export type CameraEffectStylesType = {
  tint: {
    color: string;
  };
  postProcess: {
    style: PostProcessEffectTypes;
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
export const cameraEffectStylesSchema = z.object({
  tint: z.object({
    color: z.string(),
  }),
  postProcess: z.object({
    style: z.enum(PostProcessEffectTypesArray),
  }),
  hideBackground: z.object({
    style: z.enum(HideBackgroundEffectTypesArray),
    color: z.string(),
  }),
  glasses: z.object({
    style: z.enum(GlassesEffectTypesArray),
  }),
  beards: z.object({
    style: z.enum(BeardsEffectTypesArray),
  }),
  mustaches: z.object({
    style: z.enum(MustachesEffectTypesArray),
  }),
  masks: z.object({
    style: z.enum(MasksEffectTypesArray),
  }),
  hats: z.object({
    style: z.enum(HatsEffectTypesArray),
  }),
  pets: z.object({
    style: z.enum(PetsEffectTypesArray),
  }),
});

export interface ScreenEffectStylesType {
  tint: {
    color: string;
  };
  postProcess: {
    style: PostProcessEffectTypes;
  };
}
export const screenEffectStylesSchema = z.object({
  tint: z.object({
    color: z.string(),
  }),
  postProcess: z.object({
    style: z.enum(PostProcessEffectTypesArray),
  }),
});

export type AudioEffectStylesType = object;
export const audioEffectStylesSchema = z.object({});

export type VideoEffectStylesType = {
  tint: {
    color: string;
  };
  postProcess: {
    style: PostProcessEffectTypes;
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
export const videoEffectStylesSchema = z.object({
  tint: z.object({
    color: z.string(),
  }),
  postProcess: z.object({
    style: z.enum(PostProcessEffectTypesArray),
  }),
  hideBackground: z.object({
    style: z.enum(HideBackgroundEffectTypesArray),
    color: z.string(),
  }),
  glasses: z.object({
    style: z.enum(GlassesEffectTypesArray),
  }),
  beards: z.object({
    style: z.enum(BeardsEffectTypesArray),
  }),
  mustaches: z.object({
    style: z.enum(MustachesEffectTypesArray),
  }),
  masks: z.object({
    style: z.enum(MasksEffectTypesArray),
  }),
  hats: z.object({
    style: z.enum(HatsEffectTypesArray),
  }),
  pets: z.object({
    style: z.enum(PetsEffectTypesArray),
  }),
});

export type ImageEffectStylesType = {
  tint: {
    color: string;
  };
  postProcess: {
    style: PostProcessEffectTypes;
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
export const imageEffectStylesSchema = z.object({
  tint: z.object({
    color: z.string(),
  }),
  postProcess: z.object({
    style: z.enum(PostProcessEffectTypesArray),
  }),
  hideBackground: z.object({
    style: z.enum(HideBackgroundEffectTypesArray),
    color: z.string(),
  }),
  glasses: z.object({
    style: z.enum(GlassesEffectTypesArray),
  }),
  beards: z.object({
    style: z.enum(BeardsEffectTypesArray),
  }),
  mustaches: z.object({
    style: z.enum(MustachesEffectTypesArray),
  }),
  masks: z.object({
    style: z.enum(MasksEffectTypesArray),
  }),
  hats: z.object({
    style: z.enum(HatsEffectTypesArray),
  }),
  pets: z.object({
    style: z.enum(PetsEffectTypesArray),
  }),
});

export type SvgEffectStylesType = {
  shadow: {
    shadowColor: string;
    strength: number;
    offsetX: number;
    offsetY: number;
  };
  blur: {
    strength: number;
  };
  grayscale: {
    scale: number;
  };
  saturate: {
    saturation: number;
  };
  colorOverlay: {
    overlayColor: string;
  };
  waveDistortion: {
    frequency: number;
    strength: number;
  };
  crackedGlass: {
    density: number;
    detail: number;
    strength: number;
  };
  neonGlow: {
    neonColor: string;
  };
};
export const svgEffectStylesSchema = z.object({
  shadow: z.object({
    shadowColor: z.string(),
    strength: z.number(),
    offsetX: z.number(),
    offsetY: z.number(),
  }),
  blur: z.object({
    strength: z.number(),
  }),
  grayscale: z.object({
    scale: z.number(),
  }),
  saturate: z.object({
    saturation: z.number(),
  }),
  colorOverlay: z.object({
    overlayColor: z.string(),
  }),
  waveDistortion: z.object({
    frequency: z.number(),
    strength: z.number(),
  }),
  crackedGlass: z.object({
    density: z.number(),
    detail: z.number(),
    strength: z.number(),
  }),
  neonGlow: z.object({
    neonColor: z.string(),
  }),
});

export type ApplicationEffectStylesType = {
  tint: {
    color: string;
  };
  postProcess: {
    style: PostProcessEffectTypes;
  };
};
export const applicationEffectStylesSchema = z.object({
  tint: z.object({
    color: z.string(),
  }),
  postProcess: z.object({
    style: z.enum(PostProcessEffectTypesArray),
  }),
});

export type CaptureEffectStylesType = {
  tint: {
    color: string;
  };
  postProcess: {
    style: PostProcessEffectTypes;
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
export const captureEffectStylesSchema = z.object({
  tint: z.object({
    color: z.string(),
  }),
  postProcess: z.object({
    style: z.enum(PostProcessEffectTypesArray),
  }),
  hideBackground: z.object({
    style: z.enum(HideBackgroundEffectTypesArray),
    color: z.string(),
  }),
  glasses: z.object({
    style: z.enum(GlassesEffectTypesArray),
  }),
  beards: z.object({
    style: z.enum(BeardsEffectTypesArray),
  }),
  mustaches: z.object({
    style: z.enum(MustachesEffectTypesArray),
  }),
  masks: z.object({
    style: z.enum(MasksEffectTypesArray),
  }),
  hats: z.object({
    style: z.enum(HatsEffectTypesArray),
  }),
  pets: z.object({
    style: z.enum(PetsEffectTypesArray),
  }),
});

export type TextEffectStylesType = {
  backgroundColor: string;
  textColor: string;
  indexColor: string;
  fontSize: string;
  fontStyle: string;
  letterSpacing: number;
};
export const textEffectStylesSchema = z.object({
  backgroundColor: z.string(),
  textColor: z.string(),
  indexColor: z.string(),
  fontSize: z.string(),
  fontStyle: z.string(),
  letterSpacing: z.number(),
});

export type BackgroundMusicTypes =
  | "adventureTime"
  | "bottledNoise"
  | "cacophony"
  | "cafeMusic"
  | "drumBeat"
  | "drunkOnFunk"
  | "findingHome"
  | "funk"
  | "futureSkies"
  | "hardRock"
  | "harmonica"
  | "highEnergyRock"
  | "lofi1"
  | "lofi2"
  | "mischief"
  | "money"
  | "motions"
  | "niceBeat"
  | "outWest"
  | "phonk"
  | "piano"
  | "reggae"
  | "retroGame"
  | "riskItAll"
  | "royalProcession"
  | "smoothRock"
  | "space"
  | "spookyPiano"
  | "stompingRock"
  | "ukulele"
  | "wacky";

export type AudioMixEffectsType =
  | "autoFilter"
  | "autoPanner"
  | "autoWah"
  | "bitCrusher"
  | "chebyshev"
  | "chorus"
  | "distortion"
  | "EQ"
  | "feedbackDelay"
  | "freeverb"
  | "JCReverb"
  | "phaser"
  | "pingPongDelay"
  | "pitchShift"
  | "reverb"
  | "stereoWidener"
  | "tremolo"
  | "vibrato";
export const AudioMixEffectsTypeArray = [
  "autoFilter",
  "autoPanner",
  "autoWah",
  "bitCrusher",
  "chebyshev",
  "chorus",
  "distortion",
  "EQ",
  "feedbackDelay",
  "freeverb",
  "JCReverb",
  "phaser",
  "pingPongDelay",
  "pitchShift",
  "reverb",
  "stereoWidener",
  "tremolo",
  "vibrato",
] as const;

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
};
export const UserEffectsStylesSchema = z.object({
  camera: z.record(cameraEffectStylesSchema),
  screen: z.record(screenEffectStylesSchema),
  screenAudio: z.record(audioEffectStylesSchema),
  audio: audioEffectStylesSchema,
});

export type RemoteEffectStylesType = {
  [username: string]: {
    [instance: string]: UserEffectsStylesType;
  };
};

export type StaticContentEffectsStylesType = {
  video: {
    [videoId: string]: {
      video: VideoEffectStylesType;
      audio: AudioEffectStylesType;
    };
  };
  image: {
    [imageId: string]: ImageEffectStylesType;
  };
  svg: {
    [svgId: string]: SvgEffectStylesType;
  };
  application: {
    [applicationId: string]: ApplicationEffectStylesType;
  };
  soundClip: {
    [soundClipId: string]: AudioEffectStylesType;
  };
  text: {
    [textId: string]: TextEffectStylesType;
  };
};

export const defaultAudioEffects: {
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

export const defaultCameraEffects: {
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

export const defaultScreenEffects: {
  [effect in ScreenEffectTypes]: boolean;
} = Object.freeze({
  postProcess: false,
  pause: false,
  blur: false,
  tint: false,
});

export const defaultVideoEffects: {
  [effect in VideoEffectTypes]: boolean;
} = Object.freeze({
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

export const defaultImageEffects: {
  [effect in ImageEffectTypes]: boolean;
} = Object.freeze({
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

export const defaultSvgEffects: {
  [effect in SvgEffectTypes]: boolean;
} = Object.freeze({
  shadow: false,
  blur: false,
  grayscale: false,
  saturate: false,
  edgeDetection: false,
  colorOverlay: false,
  waveDistortion: false,
  crackedGlass: false,
  neonGlow: false,
});

export const defaultApplicationEffects: {
  [effect in ApplicationEffectTypes]: boolean;
} = Object.freeze({
  postProcess: false,
  blur: false,
  tint: false,
});

export const defaultCaptureEffects: {
  [effect in CaptureEffectTypes]: boolean;
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

export const defaultPostProcess: PostProcessEffectTypes = "prismaColors";
export const defaultHideBackground: HideBackgroundEffectTypes = "beach";
export const defaultHideBackgroundColor = "#d40213";
export const defaultTintColor = "#d40213";
export const defaultBeard: BeardsEffectTypes = "classicalCurlyBeard";
export const defaultGlasses: GlassesEffectTypes = "defaultGlasses";
export const defaultMustache: MustachesEffectTypes = "mustache1";
export const defaultMask: MasksEffectTypes = "baseMask";
export const defaultHat: HatsEffectTypes = "stylishHat";
export const defaultPet: PetsEffectTypes = "beardedDragon";

export const defaultBackgroundMusic: BackgroundMusicTypes = "mischief";

export const defaultCameraEffectsStyles: CameraEffectStylesType = Object.freeze(
  {
    tint: Object.freeze({
      color: defaultTintColor,
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
    tint: Object.freeze({
      color: defaultTintColor,
    }),
    postProcess: Object.freeze({
      style: defaultPostProcess,
    }),
  }
);

export const defaultAudioEffectsStyles: AudioEffectStylesType = Object.freeze(
  {}
);

export const defaultVideoEffectsStyles: VideoEffectStylesType = Object.freeze({
  tint: Object.freeze({
    color: defaultTintColor,
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

export const defaultImageEffectsStyles: ImageEffectStylesType = Object.freeze({
  tint: Object.freeze({
    color: defaultTintColor,
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

export const defaultSvgEffectsStyles: SvgEffectStylesType = Object.freeze({
  shadow: Object.freeze({
    shadowColor: "#f2f2f2",
    strength: 0.75,
    offsetX: 0.25,
    offsetY: 0.5,
  }),
  blur: Object.freeze({
    strength: 2,
  }),
  grayscale: Object.freeze({
    scale: 0,
  }),
  saturate: Object.freeze({
    saturation: 2,
  }),
  edgeDetection: Object.freeze({}),
  colorOverlay: Object.freeze({
    overlayColor: "#d40213",
  }),
  waveDistortion: Object.freeze({
    frequency: 0.05,
    strength: 30,
  }),
  crackedGlass: Object.freeze({
    density: 0.2,
    detail: 2,
    strength: 15,
  }),
  neonGlow: Object.freeze({
    neonColor: "#d40213",
  }),
});

export const defaultApplicationEffectsStyles: ApplicationEffectStylesType =
  Object.freeze({
    tint: Object.freeze({
      color: defaultTintColor,
    }),
    postProcess: Object.freeze({
      style: defaultPostProcess,
    }),
  });

export const defaultTextEffectsStyles: TextEffectStylesType = Object.freeze({
  backgroundColor: "#090909",
  textColor: "#f2f2f2",
  indexColor: "#22c55e",
  fontSize: "16px",
  fontStyle: "K2D, sans",
  letterSpacing: 0,
});

export const defaultCaptureEffectsStyles: CaptureEffectStylesType =
  Object.freeze({
    tint: Object.freeze({
      color: defaultTintColor,
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
