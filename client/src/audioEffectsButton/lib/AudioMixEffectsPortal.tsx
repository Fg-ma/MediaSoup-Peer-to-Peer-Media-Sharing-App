import React, { useState, useRef } from "react";
import isEqual from "lodash/isEqual";
import { useStreamsContext } from "../../context/StreamsContext";
import AudioMixEffect from "./AudioMixEffect";
import ScrollingContainer from "../../scrollingContainer/ScrollingContainer";
import ScrollingContainerButton from "../../scrollingContainer/lib/ScrollingContainerButton";
import FgPanel from "../../fgPanel/FgPanel";
import { SliderChangeEvent, SliderOptions } from "../../fgSlider/FgSlider";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../effects/audioEffects/AudioEffects";

import backgroundTex1 from "../../../public/backgroundTexs/backgroundTex1.jpg";
import backgroundTex2 from "../../../public/backgroundTexs/backgroundTex2.jpg";
import backgroundTex3 from "../../../public/backgroundTexs/backgroundTex3.jpg";
import backgroundTex4 from "../../../public/backgroundTexs/backgroundTex4.jpg";
import backgroundTex5 from "../../../public/backgroundTexs/backgroundTex5.jpg";
import backgroundTex6 from "../../../public/backgroundTexs/backgroundTex6.jpg";
import backgroundTex7 from "../../../public/backgroundTexs/backgroundTex7.jpg";

import autoFilterIcon from "../../../public/svgs/audioEffects/autoFilterIcon.svg";
import autoPannerIcon from "../../../public/svgs/audioEffects/autoPannerIcon.svg";
import bitCrusherIcon from "../../../public/svgs/audioEffects/bitCrusherIcon.svg";
import chorusIcon from "../../../public/svgs/audioEffects/chorusIcon.svg";
import delayIcon from "../../../public/svgs/audioEffects/delayIcon.svg";
import distortionIcon from "../../../public/svgs/audioEffects/distortionIcon.svg";
import EQIcon from "../../../public/svgs/audioEffects/EQIcon.svg";
import phaserIcon from "../../../public/svgs/audioEffects/phaserIcon.svg";
import pitchShiftIcon from "../../../public/svgs/audioEffects/pitchShiftIcon.svg";
import reverbIcon from "../../../public/svgs/audioEffects/reverbIcon.svg";
import stereoWidenerIcon from "../../../public/svgs/audioEffects/stereoWidenerIcon.svg";

const oneSliderPossibleSizes: PossibleSizesType = {
  vertical: [108, 240],
  horizontal: [240, 108],
};

const twoSlidersPossibleSizes: PossibleSizesType = {
  vertical: [172, 240],
  horizontal: [240, 172],
};

const threeSlidersPossibleSizes: PossibleSizesType = {
  vertical: [236, 240],
  horizontal: [240, 236],
};

type PossibleSizesType = {
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

const staticMixEffects: {
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

export default function AudioMixEffectsPortal({
  audioMixEffectsButtonRef,
  closeCallback,
}: {
  audioMixEffectsButtonRef: React.RefObject<HTMLButtonElement>;
  closeCallback: () => void;
}) {
  const { userMedia } = useStreamsContext();

  const [rerender, setRerender] = useState(false);
  const [focus, setFocus] = useState(true);
  const dynamicMixEffects = useRef<{
    [mixEffect in AudioMixEffectsType]: DynamicMixEffect;
  }>({
    autoFilter: {
      values: {
        frequency: 0,
        baseFrequency: 0,
        octaves: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    autoPanner: {
      values: {
        frequency: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    autoWah: {
      values: {
        baseFrequency: 0,
        octaves: 0,
        sensitivity: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    bitCrusher: {
      values: {
        bits: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    chebyshev: {
      values: {
        order: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    chorus: {
      values: {
        frequency: 0,
        delayTime: 0,
        depth: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    freeverb: {
      values: {
        roomSize: 0,
        dampening: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    JCReverb: {
      values: {
        roomSize: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    pingPongDelay: {
      values: {
        delayTime: 0,
        feedback: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    stereoWidener: {
      values: {
        width: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    tremolo: {
      values: {
        frequency: 0,
        depth: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    vibrato: {
      values: {
        frequency: 0,
        depth: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    distortion: {
      values: {
        distortion: 0,
        oversample: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    EQ: {
      values: {
        high: 0,
        mid: 0,
        low: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    feedbackDelay: {
      values: {
        delayTime: 0,
        feedback: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    phaser: {
      values: {
        frequency: 0,
        octaves: 0,
        baseFrequency: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    pitchShift: {
      values: {
        pitch: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    reverb: {
      values: {
        decay: 1,
        preDelay: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
  });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPackedPositions = (containerWidth: number, padding: number) => {
    const positions: { x: number; y: number }[] = [];
    const occupiedSpaces: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];

    const activeRectangles = Object.entries(dynamicMixEffects.current)
      .filter(([, rect]) => rect.active)
      .map(([key, rect]) => ({
        key,
        ...rect,
        possibleSizes:
          staticMixEffects[key as AudioMixEffectsType].possibleSizes,
      }));

    // Sort rectangles by their largest possible size (width * height)
    activeRectangles.sort((a, b) => {
      const maxSizeA = Math.max(
        ...Object.values(a.possibleSizes).map(([w, h]) => w * h)
      );
      const maxSizeB = Math.max(
        ...Object.values(b.possibleSizes).map(([w, h]) => w * h)
      );
      return maxSizeB - maxSizeA;
    });

    const fitsInContainer = (
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      return (
        x + width + padding <= containerWidth &&
        y + height + padding <= Number.MAX_SAFE_INTEGER
      );
    };

    for (const rect of activeRectangles) {
      let placed = false;

      for (const [orientation, [width, height]] of Object.entries(
        rect.possibleSizes
      )) {
        if (placed) break;

        for (let y = 0; !placed; y++) {
          for (let x = 0; x + width + padding <= containerWidth; x++) {
            if (fitsInContainer(x, y, width, height)) {
              const doesOverlap = occupiedSpaces.some(
                (space) =>
                  x < space.x + space.width + padding &&
                  x + width + padding > space.x &&
                  y < space.y + space.height + padding &&
                  y + height + padding > space.y
              );

              if (!doesOverlap) {
                positions.push({ x, y });
                occupiedSpaces.push({
                  x,
                  y,
                  width,
                  height,
                });
                rect.orientation = orientation as "horizontal" | "vertical";
                rect.width = width;
                rect.height = height;
                placed = true;
                break;
              }
            }
          }
        }
      }
    }

    const newDynamicMixEffects = { ...dynamicMixEffects.current };
    activeRectangles.forEach((rect, index) => {
      if (positions[index]) {
        newDynamicMixEffects[rect.key as AudioMixEffectsType] = {
          ...rect,
          x: positions[index].x + 12,
          y: positions[index].y,
        };
      }
    });

    dynamicMixEffects.current = newDynamicMixEffects;
  };

  const mixEffectChange = (active: boolean, effect?: string) => {
    if (!effect) {
      return;
    }

    dynamicMixEffects.current = {
      ...dynamicMixEffects.current,
      [effect]: {
        ...dynamicMixEffects.current[effect as AudioMixEffectsType],
        active,
      },
    };

    if (!dynamicMixEffects.current[effect as AudioMixEffectsType].active) {
      userMedia.current.audio?.removeMixEffects([
        effect as AudioMixEffectsType,
      ]);
    }

    if (portalRef.current) {
      getPackedPositions(
        portalRef.current.getBoundingClientRect().width - 28,
        28
      );
    }

    setRerender((prev) => !prev);
  };

  const updateMixEffectsValues = (event: SliderChangeEvent) => {
    const [effect, option] = event.id.split("_");

    if (
      dynamicMixEffects.current[effect as AudioMixEffectsType] &&
      dynamicMixEffects.current[effect as AudioMixEffectsType].values
    ) {
      dynamicMixEffects.current[effect as AudioMixEffectsType].values[
        option as MixEffectsOptionsType
      ] = event.value;
    }

    const effects = [
      {
        type: effect as AudioMixEffectsType,
        updates: [
          { option: option as MixEffectsOptionsType, value: event.value },
        ],
      },
    ];

    userMedia.current.audio?.mixEffects(effects);
  };

  return (
    <FgPanel
      content={
        <div
          ref={portalRef}
          className='font-K2D text-md min-w-[18rem] min-h-[18.75rem] h-full w-full overflow-y-auto'
        >
          <div className='h-max mb-4 mt-1'>
            <ScrollingContainer
              content={
                <div className='flex items-center justify-start space-x-3 p-1'>
                  {Object.entries(staticMixEffects).map(
                    ([effect, staticMixEffect]) => {
                      return (
                        <ScrollingContainerButton
                          key={effect}
                          content={staticMixEffect.effectLabel}
                          id={effect}
                          callbackFunction={mixEffectChange}
                        />
                      );
                    }
                  )}
                </div>
              }
              buttonBackgroundColor={
                focus ? "rgba(255, 255, 255, 1)" : "rgba(243, 243, 243, 1)"
              }
            />
          </div>
          <div className='relative'>
            {Object.entries(dynamicMixEffects.current).map(
              ([effect, dynamicMixEffect]) => {
                if (dynamicMixEffect.active) {
                  return (
                    <AudioMixEffect
                      key={effect}
                      effect={effect as AudioMixEffectsType}
                      staticMixEffect={
                        staticMixEffects[effect as AudioMixEffectsType]
                      }
                      dynamicMixEffect={dynamicMixEffect}
                      effectLabel={
                        staticMixEffects[effect as AudioMixEffectsType]
                          .effectLabel
                      }
                      labelPlacement={
                        staticMixEffects[effect as AudioMixEffectsType]
                          .labelPlacement[
                          dynamicMixEffect.orientation ?? "vertical"
                        ]
                      }
                      updateMixEffectsValues={updateMixEffectsValues}
                    />
                  );
                }
              }
            )}
          </div>
        </div>
      }
      initPosition={{
        x: undefined,
        y: undefined,
        referenceElement: audioMixEffectsButtonRef.current
          ? audioMixEffectsButtonRef.current
          : undefined,
        placement: "below",
        padding: 12,
      }}
      initWidth={"600px"}
      initHeight={"384px"}
      minWidth={340}
      minHeight={350}
      resizeCallback={() => {
        if (portalRef.current) {
          const previous = JSON.parse(
            JSON.stringify(dynamicMixEffects.current)
          );
          getPackedPositions(
            portalRef.current.getBoundingClientRect().width - 28,
            28
          );
          if (!isEqual(dynamicMixEffects.current, previous)) {
            setRerender((prev) => !prev);
          }
        }
      }}
      closeCallback={() => closeCallback()}
      closePosition='topRight'
      focusCallback={(newFocus) => setFocus(newFocus)}
      shadow={{ top: true, bottom: true }}
    />
  );
}
