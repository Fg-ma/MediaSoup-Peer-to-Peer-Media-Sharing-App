import { SliderOptions } from "../../fgElements/fgSlider/FgSlider";
import { AudioEffectTypes } from "../../context/effectsContext/typeConstant";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../audioEffects/typeConstant";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const backgroundTex1 =
  nginxAssetSeverBaseUrl + "backgroundTexs/backgroundTex1.jpg";
const backgroundTex2 =
  nginxAssetSeverBaseUrl + "backgroundTexs/backgroundTex2.jpg";
const backgroundTex3 =
  nginxAssetSeverBaseUrl + "backgroundTexs/backgroundTex3.jpg";
const backgroundTex4 =
  nginxAssetSeverBaseUrl + "backgroundTexs/backgroundTex4.jpg";
const backgroundTex5 =
  nginxAssetSeverBaseUrl + "backgroundTexs/backgroundTex5.jpg";
const backgroundTex6 =
  nginxAssetSeverBaseUrl + "backgroundTexs/backgroundTex6.jpg";
const backgroundTex7 =
  nginxAssetSeverBaseUrl + "backgroundTexs/backgroundTex7.jpg";

const autoFilterIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/autoFilterIcon.svg";
const autoPannerIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/autoPannerIcon.svg";
const bitCrusherIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/bitCrusherIcon.svg";
const chorusIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/chorusIcon.svg";
const delayIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/delayIcon.svg";
const distortionIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/distortionIcon.svg";
const EQIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/EQIcon.svg";
const phaserIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/phaserIcon.svg";
const pitchShiftIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/pitchShiftIcon.svg";
const reverbIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/reverbIcon.svg";
const stereoWidenerIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/stereoWidenerIcon.svg";

const robotIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/robotIcon.svg";
const robotOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/robotOffIcon.svg";
const echoIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/echoIcon.svg";
const echoOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/echoOffIcon.svg";
const alienIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/alienIcon.svg";
const alienOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/alienOffIcon.svg";
const underwaterIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/underwaterIcon.svg";
const underwaterOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/underwaterOffIcon.svg";
const telephoneIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/telephoneIcon.svg";
const telephoneOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/telephoneOffIcon.svg";
const spaceIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/spaceIcon.svg";
const spaceOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/spaceOffIcon.svg";
const distortionOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/distortionOffIcon.svg";
const vintageIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/vintageIcon.svg";
const vintageOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/vintageOffIcon.svg";
const psychedelicIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/psychedelicIcon.svg";
const psychedelicOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/psychedelicOffIcon.svg";
const deepBassIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/deepBassIcon.svg";
const deepBassOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/deepBassOffIcon.svg";
const highEnergyIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/highEnergyIcon.svg";
const highEnergyOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/highEnergyOffIcon.svg";
const ambientIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/ambientIcon.svg";
const ambientOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/ambientOffIcon.svg";
const glitchIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/glitchIcon.svg";
const glitchOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/glitchOffIcon.svg";
const muffledIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/muffledIcon.svg";
const muffledOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/muffledOffIcon.svg";
const crystalIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/crystalIcon.svg";
const crystalOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/crystalOffIcon.svg";
const heavyMetalIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/heavyMetalIcon.svg";
const heavyMetalOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/heavyMetalOffIcon.svg";
const dreamyIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/dreamyIcon.svg";
const dreamyOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/dreamyOffIcon.svg";
const horrorIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/horrorIcon.svg";
const horrorOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/horrorOffIcon.svg";
const sciFiIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/sciFiIcon.svg";
const sciFiOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/sciFiOffIcon.svg";
const dystopianIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/dystopianIcon.svg";
const dystopianOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/dystopianOffIcon.svg";
const retroGameIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/retroGameIcon.svg";
const retroGameOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/retroGameOffIcon.svg";
const ghostlyIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/ghostlyIcon.svg";
const ghostlyOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/ghostlyOffIcon.svg";
const metallicIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/metallicIcon.svg";
const metallicOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/metallicOffIcon.svg";
const hypnoticIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/hypnoticIcon.svg";
const hypnoticOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/hypnoticOffIcon.svg";
const cyberpunkIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/cyberpunkIcon.svg";
const cyberpunkOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/cyberpunkOffIcon.svg";
const windyIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/windyIcon.svg";
const windyOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/windyOffIcon.svg";
const radioIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/radioIcon.svg";
const radioOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/radioOffIcon.svg";
const explosionIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/explosionIcon.svg";
const explosionOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/explosionOffIcon.svg";
const whisperIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/whisperIcon.svg";
const whisperOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/whisperOffIcon.svg";
const submarineIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/submarineIcon.svg";
const submarineOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/submarineOffIcon.svg";
const windTunnelIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/windTunnelIcon.svg";
const windTunnelOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/windTunnelOffIcon.svg";
const crushedBassIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/crushedBassIcon.svg";
const crushedBassOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/crushedBassOffIcon.svg";
const etherealIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/etherealIcon.svg";
const etherealOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/etherealOffIcon.svg";
const electroStingIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/electroStingIcon.svg";
const electroStingOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/electroStingOffIcon.svg";
const heartbeatIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/heartbeatIcon.svg";
const heartbeatOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/heartbeatOffIcon.svg";
const underworldIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/underworldIcon.svg";
const underworldOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/underworldOffIcon.svg";
const sizzlingIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/sizzlingIcon.svg";
const sizzlingOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/sizzlingOffIcon.svg";
const staticNoiseIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/staticNoiseIcon.svg";
const staticNoiseOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/staticNoiseOffIcon.svg";
const bubblyIcon = nginxAssetSeverBaseUrl + "svgs/audioEffects/bubblyIcon.svg";
const bubblyOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/bubblyOffIcon.svg";
const thunderIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/thunderIcon.svg";
const thunderOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/thunderOffIcon.svg";
const echosOfThePastIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/echosOfThePastIcon.svg";
const echosOfThePastOffIcon =
  nginxAssetSeverBaseUrl + "svgs/audioEffects/echosOfThePastOffIcon.svg";

export type PossibleSizesType = {
  vertical: [number, number];
  horizontal: [number, number];
};

export type LabelPlacementType =
  | {
      side: "left" | "right";
      sidePlacement: "top" | "middle" | "bottom";
    }
  | {
      side: "top" | "bottom";
      sidePlacement: "left" | "center" | "right";
    };

export interface StaticMixEffect {
  possibleSizes: { vertical: [number, number]; horizontal: [number, number] };
  options: {
    [option in MixEffectsOptionsType]?: SliderOptions;
  };
  backgroundColor: string;
  backgroundImage?: string;
  labelIcon?: string;
  effectLabel: string;
  labelPlacement: {
    vertical: LabelPlacementType;
    horizontal: LabelPlacementType;
  };
}

export interface DynamicMixEffect {
  values: {
    [option in MixEffectsOptionsType]?: number;
  };
  active: boolean;
  orientation?: "vertical" | "horizontal";
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export type AudioEffectTemplate = {
  icon: string;
  offIcon: string;
  attributes: {
    key: string;
    value: string;
    activityDependentValue?: {
      active: string;
      deactive: string;
    };
    id?: string;
  }[];
  hoverContent: {
    active: string;
    deactive: string;
  };
};

export type AudioEffectTemplates = {
  [audioEffectType in AudioEffectTypes]: AudioEffectTemplate;
};

export const oneSliderPossibleSizes: PossibleSizesType = {
  vertical: [108, 240],
  horizontal: [240, 108],
};

export const twoSlidersPossibleSizes: PossibleSizesType = {
  vertical: [172, 240],
  horizontal: [240, 172],
};

export const threeSlidersPossibleSizes: PossibleSizesType = {
  vertical: [236, 240],
  horizontal: [240, 236],
};

export const staticMixEffects: {
  [mixEffect in AudioMixEffectsType]: StaticMixEffect;
} = {
  autoFilter: {
    possibleSizes: {
      vertical: threeSlidersPossibleSizes.vertical,
      horizontal: threeSlidersPossibleSizes.horizontal,
    },
    options: {
      frequency: {
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
      },
      baseFrequency: {
        bottomLabel: "base freq",
        ticks: 6,
        rangeMax: 10000,
        rangeMin: 0,
        units: "Hz",
      },
      octaves: {
        bottomLabel: "oct",
        ticks: 5,
        rangeMax: 8,
        rangeMin: 0,
        units: "oct",
      },
    },
    backgroundColor: "#8076b7",
    backgroundImage: backgroundTex1,
    labelIcon: autoFilterIcon,
    effectLabel: "Auto filter",
    labelPlacement: {
      vertical: {
        side: "left",
        sidePlacement: "top",
      },
      horizontal: {
        side: "bottom",
        sidePlacement: "center",
      },
    },
  },
  autoPanner: {
    possibleSizes: {
      vertical: oneSliderPossibleSizes.vertical,
      horizontal: oneSliderPossibleSizes.horizontal,
    },
    options: {
      frequency: {
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
      },
    },
    backgroundColor: "#a53f57",
    backgroundImage: backgroundTex4,
    labelIcon: autoPannerIcon,
    effectLabel: "Auto panner",
    labelPlacement: {
      vertical: {
        side: "right",
        sidePlacement: "top",
      },
      horizontal: {
        side: "bottom",
        sidePlacement: "left",
      },
    },
  },
  autoWah: {
    possibleSizes: {
      horizontal: threeSlidersPossibleSizes.horizontal,
      vertical: threeSlidersPossibleSizes.vertical,
    },
    options: {
      baseFrequency: {
        topLabel: "base freq",
        ticks: 6,
        rangeMax: 10000,
        rangeMin: 0,
        units: "Hz",
      },
      octaves: {
        bottomLabel: "oct",
        ticks: 5,
        rangeMax: 8,
        rangeMin: 0,
        units: "octaves",
      },
      sensitivity: {
        bottomLabel: "sensitivity",
        ticks: 6,
        rangeMax: 0,
        rangeMin: -40,
        units: "dB",
      },
    },
    backgroundColor: "#aed0f6",
    backgroundImage: backgroundTex7,
    effectLabel: "Auto wah",
    labelPlacement: {
      vertical: {
        side: "top",
        sidePlacement: "right",
      },
      horizontal: {
        side: "bottom",
        sidePlacement: "left",
      },
    },
  },
  bitCrusher: {
    possibleSizes: {
      vertical: oneSliderPossibleSizes.vertical,
      horizontal: oneSliderPossibleSizes.horizontal,
    },
    options: {
      bits: {
        topLabel: "bits",
        ticks: 8,
        rangeMax: 8,
        rangeMin: 1,
        units: "bits",
      },
    },
    backgroundColor: "#fa7453",
    backgroundImage: backgroundTex3,
    labelIcon: bitCrusherIcon,
    effectLabel: "Bit crusher",
    labelPlacement: {
      vertical: {
        side: "right",
        sidePlacement: "middle",
      },
      horizontal: {
        side: "top",
        sidePlacement: "center",
      },
    },
  },
  chebyshev: {
    possibleSizes: {
      horizontal: oneSliderPossibleSizes.horizontal,
      vertical: oneSliderPossibleSizes.vertical,
    },
    options: {
      order: {
        topLabel: "order",
        ticks: 6,
        rangeMax: 100,
        rangeMin: 0,
        units: "order",
      },
    },
    backgroundColor: "#02e5aa",
    backgroundImage: backgroundTex2,
    effectLabel: "Chebyshev",
    labelPlacement: {
      vertical: {
        side: "left",
        sidePlacement: "bottom",
      },
      horizontal: {
        side: "top",
        sidePlacement: "right",
      },
    },
  },
  chorus: {
    possibleSizes: {
      horizontal: threeSlidersPossibleSizes.horizontal,
      vertical: threeSlidersPossibleSizes.vertical,
    },
    options: {
      frequency: {
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
      },
      delayTime: {
        bottomLabel: "delay",
        ticks: 6,
        rangeMax: 20,
        rangeMin: 0,
        units: "ms",
      },
      depth: {
        bottomLabel: "depth",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
      },
    },
    backgroundColor: "#d8bd9a",
    backgroundImage: backgroundTex6,
    labelIcon: chorusIcon,
    effectLabel: "Chorus",
    labelPlacement: {
      vertical: {
        side: "right",
        sidePlacement: "bottom",
      },
      horizontal: {
        side: "bottom",
        sidePlacement: "right",
      },
    },
  },
  distortion: {
    possibleSizes: {
      horizontal: twoSlidersPossibleSizes.horizontal,
      vertical: twoSlidersPossibleSizes.vertical,
    },
    options: {
      distortion: {
        topLabel: "dist",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
      },
      oversample: {
        topLabel: "oversample",
        ticks: 2,
        rangeMax: 4,
        rangeMin: 2,
        units: "x",
        snapToNearestTick: true,
      },
    },
    backgroundColor: "#e7c47d",
    backgroundImage: backgroundTex5,
    labelIcon: distortionIcon,
    effectLabel: "Distortion",
    labelPlacement: {
      vertical: { side: "right", sidePlacement: "top" },
      horizontal: { side: "top", sidePlacement: "right" },
    },
  },
  EQ: {
    possibleSizes: {
      vertical: threeSlidersPossibleSizes.vertical,
      horizontal: threeSlidersPossibleSizes.horizontal,
    },
    options: {
      high: {
        topLabel: "high",
        ticks: 9,
        rangeMax: 24,
        rangeMin: -24,
        units: "dB",
      },
      mid: {
        bottomLabel: "mid",
        ticks: 9,
        rangeMax: 24,
        rangeMin: -24,
        units: "dB",
      },
      low: {
        bottomLabel: "low",
        ticks: 9,
        rangeMax: 24,
        rangeMin: -24,
        units: "dB",
      },
    },
    backgroundColor: "#888097",
    backgroundImage: backgroundTex2,
    labelIcon: EQIcon,
    effectLabel: "EQ",
    labelPlacement: {
      vertical: { side: "top", sidePlacement: "left" },
      horizontal: { side: "left", sidePlacement: "top" },
    },
  },
  feedbackDelay: {
    possibleSizes: {
      horizontal: twoSlidersPossibleSizes.horizontal,
      vertical: twoSlidersPossibleSizes.vertical,
    },
    options: {
      delayTime: {
        topLabel: "delay",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "sec",
      },
      feedback: {
        bottomLabel: "feedback",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
      },
    },
    backgroundColor: "#c5cfd0",
    backgroundImage: backgroundTex2,
    labelIcon: delayIcon,
    effectLabel: "Feedback delay",
    labelPlacement: {
      vertical: { side: "bottom", sidePlacement: "right" },
      horizontal: { side: "top", sidePlacement: "left" },
    },
  },
  freeverb: {
    possibleSizes: {
      horizontal: twoSlidersPossibleSizes.horizontal,
      vertical: twoSlidersPossibleSizes.vertical,
    },
    options: {
      roomSize: {
        topLabel: "room size",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "size",
      },
      dampening: {
        bottomLabel: "dampening",
        ticks: 6,
        rangeMax: 10000,
        rangeMin: 0,
        units: "Hz",
      },
    },
    backgroundColor: "#fe7b88",
    backgroundImage: backgroundTex1,
    effectLabel: "Freeverb",
    labelPlacement: {
      vertical: {
        side: "left",
        sidePlacement: "middle",
      },
      horizontal: {
        side: "bottom",
        sidePlacement: "left",
      },
    },
  },
  JCReverb: {
    possibleSizes: {
      horizontal: oneSliderPossibleSizes.horizontal,
      vertical: oneSliderPossibleSizes.vertical,
    },
    options: {
      roomSize: {
        topLabel: "room size",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "size",
      },
    },
    backgroundColor: "#6b76fe",
    backgroundImage: backgroundTex6,
    labelIcon: reverbIcon,
    effectLabel: "JC reverb",
    labelPlacement: {
      vertical: {
        side: "left",
        sidePlacement: "top",
      },
      horizontal: {
        side: "bottom",
        sidePlacement: "center",
      },
    },
  },
  phaser: {
    possibleSizes: {
      vertical: threeSlidersPossibleSizes.vertical,
      horizontal: threeSlidersPossibleSizes.horizontal,
    },
    options: {
      frequency: {
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
      },
      octaves: {
        topLabel: "oct",
        ticks: 9,
        rangeMax: 8,
        rangeMin: 0,
        units: "Oct",
        snapToWholeNum: true,
      },
      baseFrequency: {
        bottomLabel: "base freq",
        ticks: 6,
        rangeMax: 10000,
        rangeMin: 0,
        units: "Hz",
      },
    },
    backgroundColor: "#d03818",
    backgroundImage: backgroundTex3,
    labelIcon: phaserIcon,
    effectLabel: "Phaser",
    labelPlacement: {
      vertical: { side: "left", sidePlacement: "top" },
      horizontal: { side: "top", sidePlacement: "left" },
    },
  },
  pingPongDelay: {
    possibleSizes: {
      vertical: twoSlidersPossibleSizes.vertical,
      horizontal: twoSlidersPossibleSizes.horizontal,
    },
    options: {
      delayTime: {
        topLabel: "delay",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "sec",
      },
      feedback: {
        bottomLabel: "feedback",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
      },
    },
    backgroundColor: "#733f87",
    backgroundImage: backgroundTex4,
    labelIcon: delayIcon,
    effectLabel: "Ping pong",
    labelPlacement: {
      vertical: {
        side: "left",
        sidePlacement: "top",
      },
      horizontal: {
        side: "top",
        sidePlacement: "left",
      },
    },
  },
  pitchShift: {
    possibleSizes: {
      horizontal: oneSliderPossibleSizes.horizontal,
      vertical: oneSliderPossibleSizes.vertical,
    },
    options: {
      pitch: {
        topLabel: "pitch",
        ticks: 9,
        rangeMax: 12,
        rangeMin: -12,
        units: "semitones",
        snapToWholeNum: true,
      },
    },
    backgroundColor: "#cacaca",
    backgroundImage: backgroundTex5,
    labelIcon: pitchShiftIcon,
    effectLabel: "Pitch shift",
    labelPlacement: {
      vertical: { side: "left", sidePlacement: "bottom" },
      horizontal: { side: "bottom", sidePlacement: "left" },
    },
  },
  reverb: {
    possibleSizes: {
      vertical: twoSlidersPossibleSizes.vertical,
      horizontal: twoSlidersPossibleSizes.horizontal,
    },
    options: {
      decay: {
        topLabel: "decay",
        ticks: 4,
        rangeMax: 10,
        rangeMin: 1,
        units: "sec",
      },
      preDelay: {
        bottomLabel: "pre-delay",
        ticks: 6,
        rangeMax: 0.1,
        rangeMin: 0,
        precision: 3,
        units: "sec",
      },
    },
    backgroundColor: "#858585",
    backgroundImage: backgroundTex7,
    labelIcon: reverbIcon,
    effectLabel: "Reverb",
    labelPlacement: {
      vertical: { side: "left", sidePlacement: "bottom" },
      horizontal: { side: "bottom", sidePlacement: "left" },
    },
  },
  stereoWidener: {
    possibleSizes: {
      vertical: oneSliderPossibleSizes.vertical,
      horizontal: oneSliderPossibleSizes.horizontal,
    },
    options: {
      width: {
        topLabel: "width",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "width",
      },
    },
    backgroundColor: "#f9d8e9",
    backgroundImage: backgroundTex4,
    labelIcon: stereoWidenerIcon,
    effectLabel: "Stereo wide",
    labelPlacement: {
      vertical: {
        side: "right",
        sidePlacement: "bottom",
      },
      horizontal: {
        side: "bottom",
        sidePlacement: "right",
      },
    },
  },
  tremolo: {
    possibleSizes: {
      vertical: twoSlidersPossibleSizes.vertical,
      horizontal: twoSlidersPossibleSizes.horizontal,
    },
    options: {
      frequency: {
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
      },
      depth: {
        bottomLabel: "depth",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
      },
    },
    backgroundColor: "#d1cdc7",
    backgroundImage: backgroundTex5,
    effectLabel: "Tremolo",
    labelPlacement: {
      vertical: {
        side: "right",
        sidePlacement: "middle",
      },
      horizontal: {
        side: "left",
        sidePlacement: "middle",
      },
    },
  },
  vibrato: {
    possibleSizes: {
      horizontal: twoSlidersPossibleSizes.horizontal,
      vertical: twoSlidersPossibleSizes.vertical,
    },
    options: {
      frequency: {
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
      },
      depth: {
        bottomLabel: "depth",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        units: "%",
      },
    },
    backgroundColor: "#c09f76",
    backgroundImage: backgroundTex7,
    effectLabel: "Vibrato",
    labelPlacement: {
      vertical: {
        side: "right",
        sidePlacement: "bottom",
      },
      horizontal: {
        side: "left",
        sidePlacement: "top",
      },
    },
  },
};

export const audioEffectTemplates: AudioEffectTemplates = {
  robot: {
    icon: robotIcon,
    offIcon: robotOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
      {
        key: "fill",
        id: "eyes",
        value: "red",
        activityDependentValue: { active: "", deactive: "red" },
      },
    ],
    hoverContent: { active: "Robot effect", deactive: "Remove robot effect" },
  },
  echo: {
    icon: echoIcon,
    offIcon: echoOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "stroke", value: "white" },
      {
        key: "fill",
        value: "white",
        activityDependentValue: { active: "none", deactive: "white" },
      },
    ],
    hoverContent: { active: "Echo effect", deactive: "Remove echo effect" },
  },
  alien: {
    icon: alienIcon,
    offIcon: alienOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: { active: "Alien effect", deactive: "Remove alien effect" },
  },
  underwater: {
    icon: underwaterIcon,
    offIcon: underwaterOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Underwater effect",
      deactive: "Remove underwater effect",
    },
  },
  telephone: {
    icon: telephoneIcon,
    offIcon: telephoneOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Telephone effect",
      deactive: "Remove telephone effect",
    },
  },
  space: {
    icon: spaceIcon,
    offIcon: spaceOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Space effect",
      deactive: "Remove space effect",
    },
  },
  distortion: {
    icon: distortionIcon,
    offIcon: distortionOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Distortion effect",
      deactive: "Remove distortion effect",
    },
  },
  vintage: {
    icon: vintageIcon,
    offIcon: vintageOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
      {
        key: "fill",
        id: "center",
        value: "#f56114",
        activityDependentValue: { active: "none", deactive: "#f56114" },
      },
    ],
    hoverContent: {
      active: "Vintage effect",
      deactive: "Remove vintage effect",
    },
  },
  psychedelic: {
    icon: psychedelicIcon,
    offIcon: psychedelicOffIcon,
    attributes: [
      { key: "width", value: "100%" },
      { key: "height", value: "100%" },
    ],
    hoverContent: {
      active: "Psychedelic effect",
      deactive: "Remove psychedelic effect",
    },
  },
  deepBass: {
    icon: deepBassIcon,
    offIcon: deepBassOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "stroke", value: "white" },
      {
        id: "innerEllipse",
        key: "fill",
        value: "white",
        activityDependentValue: { active: "white", deactive: "white" },
      },
    ],
    hoverContent: {
      active: "Deep bass effect",
      deactive: "Remove deep bass effect",
    },
  },
  highEnergy: {
    icon: highEnergyIcon,
    offIcon: highEnergyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "High energy effect",
      deactive: "Remove high energy effect",
    },
  },
  ambient: {
    icon: ambientIcon,
    offIcon: ambientOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Ambient effect",
      deactive: "Remove ambient effect",
    },
  },
  glitch: {
    icon: glitchIcon,
    offIcon: glitchOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Glitch effect",
      deactive: "Remove glitch effect",
    },
  },
  muffled: {
    icon: muffledIcon,
    offIcon: muffledOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Muffled effect",
      deactive: "Remove muffled effect",
    },
  },
  crystal: {
    icon: crystalIcon,
    offIcon: crystalOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Crystal effect",
      deactive: "Remove crystal effect",
    },
  },
  heavyMetal: {
    icon: heavyMetalIcon,
    offIcon: heavyMetalOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Heavy metal effect",
      deactive: "Remove heavy metal effect",
    },
  },
  dreamy: {
    icon: dreamyIcon,
    offIcon: dreamyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Dreamy effect",
      deactive: "Remove dreamy effect",
    },
  },
  horror: {
    icon: horrorIcon,
    offIcon: horrorOffIcon,
    attributes: [
      { key: "width", value: "100%" },
      { key: "height", value: "100%" },
    ],
    hoverContent: {
      active: "Horror effect",
      deactive: "Remove horror effect",
    },
  },
  sciFi: {
    icon: sciFiIcon,
    offIcon: sciFiOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Sci-fi effect",
      deactive: "Remove sci-fi effect",
    },
  },
  dystopian: {
    icon: dystopianIcon,
    offIcon: dystopianOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Dystopian effect",
      deactive: "Remove dystopian effect",
    },
  },
  retroGame: {
    icon: retroGameIcon,
    offIcon: retroGameOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Retro game effect",
      deactive: "Remove retro game effect",
    },
  },
  ghostly: {
    icon: ghostlyIcon,
    offIcon: ghostlyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Ghostly effect",
      deactive: "Remove ghostly effect",
    },
  },
  metallic: {
    icon: metallicIcon,
    offIcon: metallicOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Metallic effect",
      deactive: "Remove metallic effect",
    },
  },
  hypnotic: {
    icon: hypnoticIcon,
    offIcon: hypnoticOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Hypnotic effect",
      deactive: "Remove hypnotic effect",
    },
  },
  cyberpunk: {
    icon: cyberpunkIcon,
    offIcon: cyberpunkOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Cyberpunk effect",
      deactive: "Remove cyberpunk effect",
    },
  },
  windy: {
    icon: windyIcon,
    offIcon: windyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Windy effect",
      deactive: "Remove windy effect",
    },
  },
  radio: {
    icon: radioIcon,
    offIcon: radioOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Radio effect",
      deactive: "Remove radio effect",
    },
  },
  explosion: {
    icon: explosionIcon,
    offIcon: explosionOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Explosion effect",
      deactive: "Remove explosion effect",
    },
  },
  whisper: {
    icon: whisperIcon,
    offIcon: whisperOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Whisper effect",
      deactive: "Remove whisper effect",
    },
  },
  submarine: {
    icon: submarineIcon,
    offIcon: submarineOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Submarine effect",
      deactive: "Remove submarine effect",
    },
  },
  windTunnel: {
    icon: windTunnelIcon,
    offIcon: windTunnelOffIcon,
    attributes: [
      { key: "width", value: "100%" },
      { key: "height", value: "100%" },
    ],
    hoverContent: {
      active: "Wind tunnel effect",
      deactive: "Remove wind tunnel effect",
    },
  },
  crushedBass: {
    icon: crushedBassIcon,
    offIcon: crushedBassOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Crushed bass effect",
      deactive: "Remove crushed bass effect",
    },
  },
  ethereal: {
    icon: etherealIcon,
    offIcon: etherealOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Ethereal effect",
      deactive: "Remove ethereal effect",
    },
  },
  electroSting: {
    icon: electroStingIcon,
    offIcon: electroStingOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Electro sting effect",
      deactive: "Remove electro sting effect",
    },
  },
  heartbeat: {
    icon: heartbeatIcon,
    offIcon: heartbeatOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Heartbeat effect",
      deactive: "Remove heartbeat effect",
    },
  },
  underworld: {
    icon: underworldIcon,
    offIcon: underworldOffIcon,
    attributes: [
      { key: "width", value: "100%" },
      { key: "height", value: "100%" },
    ],
    hoverContent: {
      active: "Underworld effect",
      deactive: "Remove underworld effect",
    },
  },
  sizzling: {
    icon: sizzlingIcon,
    offIcon: sizzlingOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Sizzling effect",
      deactive: "Remove sizzling effect",
    },
  },
  staticNoise: {
    icon: staticNoiseIcon,
    offIcon: staticNoiseOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Static noise effect",
      deactive: "Remove static noise effect",
    },
  },
  bubbly: {
    icon: bubblyIcon,
    offIcon: bubblyOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Bubbly effect",
      deactive: "Remove bubbly effect",
    },
  },
  thunder: {
    icon: thunderIcon,
    offIcon: thunderOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
      { key: "fill", value: "white" },
      { key: "stroke", value: "white" },
    ],
    hoverContent: {
      active: "Thunder effect",
      deactive: "Remove thunder effect",
    },
  },
  echosOfThePast: {
    icon: echosOfThePastIcon,
    offIcon: echosOfThePastOffIcon,
    attributes: [
      { key: "width", value: "90%" },
      { key: "height", value: "90%" },
    ],
    hoverContent: {
      active: "Echos of the past effect",
      deactive: "Remove echos of the past effect",
    },
  },
};
