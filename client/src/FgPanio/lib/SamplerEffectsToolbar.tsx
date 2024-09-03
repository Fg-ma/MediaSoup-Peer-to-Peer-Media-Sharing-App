import React, { useState } from "react";
import FgKnobButton, {
  KnobButtonOptions,
} from "../../fgKnobButton/FgKnobButton";
import ScrollingContainer from "../../scrollingContainer/ScrollingContainer";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../effects/audioEffects/AudioEffects";

import autoFilterIcon from "../../../public/svgs/audio/autoFilterIcon.svg";
import autoPannerIcon from "../../../public/svgs/audio/autoPannerIcon.svg";
import bitCrusherIcon from "../../../public/svgs/audio/bitCrusherIcon.svg";
import chorusIcon from "../../../public/svgs/audio/chorusIcon.svg";
import delayIcon from "../../../public/svgs/audio/delayIcon.svg";
import distortionIcon from "../../../public/svgs/audio/distortionIcon.svg";
import EQIcon from "../../../public/svgs/audio/EQIcon.svg";
import phaserIcon from "../../../public/svgs/audio/phaserIcon.svg";
import pitchShiftIcon from "../../../public/svgs/audio/pitchShiftIcon.svg";
import reverbIcon from "../../../public/svgs/audio/reverbIcon.svg";
import stereoWidenerIcon from "../../../public/svgs/audio/stereoWidenerIcon.svg";
import SamplerEffect from "./SamplerEffect";

export interface SamplerEffectType {
  labelIcon?: string;
  effectLabel: string;
  labelPlacement: "top" | "bottom";
  options: {
    [option in MixEffectsOptionsType]?: KnobButtonOptions;
  };
}

const samplerEffects: {
  [mixEffect in AudioMixEffectsType]: SamplerEffectType;
} = {
  autoFilter: {
    labelIcon: autoFilterIcon,
    effectLabel: "Auto filter",
    labelPlacement: "top",
    options: {
      frequency: {
        id: "autoFilter_frequency",
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
      baseFrequency: {
        id: "autoFilter_baseFrequency",
        bottomLabel: "base",
        ticks: 6,
        rangeMax: 10000,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
      octaves: {
        id: "autoFilter_octaves",
        bottomLabel: "oct",
        ticks: 5,
        rangeMax: 8,
        rangeMin: 0,
        units: "oct",
        initValue: 0,
      },
    },
  },
  autoPanner: {
    labelIcon: autoPannerIcon,
    effectLabel: "Auto pan",
    labelPlacement: "bottom",
    options: {
      frequency: {
        id: "autoPanner_frequency",
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
    },
  },
  autoWah: {
    effectLabel: "Auto wah",
    labelPlacement: "top",
    options: {
      baseFrequency: {
        id: "autoWah_baseFrequency",
        topLabel: "base",
        ticks: 6,
        rangeMax: 10000,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
      octaves: {
        id: "autoWah_octaves",
        bottomLabel: "oct",
        ticks: 5,
        rangeMax: 8,
        rangeMin: 0,
        units: "oct",
        initValue: 0,
      },
      sensitivity: {
        id: "autoWah_sensitivity",
        bottomLabel: "sens",
        ticks: 6,
        rangeMax: 0,
        rangeMin: -40,
        units: "dB",
        initValue: 0,
      },
    },
  },
  bitCrusher: {
    labelIcon: bitCrusherIcon,
    effectLabel: "Bit crusher",
    labelPlacement: "bottom",
    options: {
      bits: {
        id: "bitCrusher_bits",
        topLabel: "bits",
        ticks: 8,
        rangeMax: 8,
        rangeMin: 1,
        units: "bits",
        initValue: 1,
      },
    },
  },
  chebyshev: {
    effectLabel: "Chebyshev",
    labelPlacement: "top",
    options: {
      order: {
        id: "chebyshev_order",
        topLabel: "order",
        ticks: 6,
        rangeMax: 100,
        rangeMin: 0,
        units: "order",
        initValue: 0,
      },
    },
  },
  chorus: {
    labelIcon: chorusIcon,
    effectLabel: "Chorus",
    labelPlacement: "top",
    options: {
      frequency: {
        id: "chorus_frequency",
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
      delayTime: {
        id: "chorus_delayTime",
        bottomLabel: "delay",
        ticks: 6,
        rangeMax: 20,
        rangeMin: 0,
        units: "ms",
        initValue: 0,
      },
      depth: {
        id: "chorus_depth",
        bottomLabel: "depth",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
        initValue: 0,
      },
    },
  },
  distortion: {
    labelIcon: distortionIcon,
    effectLabel: "Distortion",
    labelPlacement: "top",
    options: {
      distortion: {
        id: "distortion_distortion",
        topLabel: "dist",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
        initValue: 0,
      },
      oversample: {
        id: "distortion_oversample",
        topLabel: "oversamp",
        ticks: 2,
        rangeMax: 4,
        rangeMin: 2,
        units: "x",
        snapToNearestTick: true,
        initValue: 2,
      },
    },
  },
  EQ: {
    labelIcon: EQIcon,
    effectLabel: "EQ",
    labelPlacement: "bottom",
    options: {
      high: {
        id: "EQ_high",
        topLabel: "high",
        ticks: 9,
        rangeMax: 24,
        rangeMin: -24,
        units: "dB",
        initValue: 0,
      },
      mid: {
        id: "EQ_mid",
        bottomLabel: "mid",
        ticks: 9,
        rangeMax: 24,
        rangeMin: -24,
        units: "dB",
        initValue: 0,
      },
      low: {
        id: "EQ_low",
        bottomLabel: "low",
        ticks: 9,
        rangeMax: 24,
        rangeMin: -24,
        units: "dB",
        initValue: 0,
      },
    },
  },
  feedbackDelay: {
    labelIcon: delayIcon,
    effectLabel: "Feedback delay",
    labelPlacement: "bottom",
    options: {
      delayTime: {
        id: "feedbackDelay_delayTime",
        topLabel: "delay",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "sec",
        initValue: 0,
      },
      feedback: {
        id: "feedbackDelay_feedback",
        bottomLabel: "feedback",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
        initValue: 0,
      },
    },
  },
  freeverb: {
    effectLabel: "Freeverb",
    labelPlacement: "top",
    options: {
      roomSize: {
        id: "freeverb_roomSize",
        topLabel: "size",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "size",
        initValue: 0,
      },
      dampening: {
        id: "freeverb_dampening",
        bottomLabel: "damp",
        ticks: 6,
        rangeMax: 10000,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
    },
  },
  JCReverb: {
    labelIcon: reverbIcon,
    effectLabel: "JC reverb",
    labelPlacement: "top",
    options: {
      roomSize: {
        id: "JCReverb_roomSize",
        topLabel: "size",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "size",
        initValue: 0,
      },
    },
  },
  phaser: {
    labelIcon: phaserIcon,
    effectLabel: "Phaser",
    labelPlacement: "bottom",
    options: {
      frequency: {
        id: "phaser_frequency",
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
      octaves: {
        id: "phaser_octaves",
        topLabel: "oct",
        ticks: 9,
        rangeMax: 8,
        rangeMin: 0,
        units: "Oct",
        snapToWholeNum: true,
        initValue: 0,
      },
      baseFrequency: {
        id: "phaser_baseFrequency",
        bottomLabel: "base",
        ticks: 6,
        rangeMax: 10000,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
    },
  },
  pingPongDelay: {
    labelIcon: delayIcon,
    effectLabel: "Ping pong delay",
    labelPlacement: "bottom",
    options: {
      delayTime: {
        id: "pingPongDelay_delayTime",
        topLabel: "delay",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "sec",
        initValue: 0,
      },
      feedback: {
        id: "pingPongDelay_feedback",
        bottomLabel: "feedback",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
        initValue: 0,
      },
    },
  },
  pitchShift: {
    labelIcon: pitchShiftIcon,
    effectLabel: "Pitch shift",
    labelPlacement: "bottom",
    options: {
      pitch: {
        id: "pitchShift_pitch",
        topLabel: "pitch",
        ticks: 9,
        rangeMax: 12,
        rangeMin: -12,
        units: "semi",
        snapToWholeNum: true,
        initValue: 0,
      },
    },
  },
  reverb: {
    labelIcon: reverbIcon,
    effectLabel: "Reverb",
    labelPlacement: "top",
    options: {
      decay: {
        id: "reverb_decay",
        topLabel: "decay",
        ticks: 4,
        rangeMax: 10,
        rangeMin: 1,
        units: "sec",
        initValue: 1,
      },
      preDelay: {
        id: "reverb_preDelay",
        bottomLabel: "pre",
        ticks: 6,
        rangeMax: 0.1,
        rangeMin: 0,
        precision: 3,
        units: "sec",
        initValue: 0,
      },
    },
  },
  stereoWidener: {
    labelIcon: stereoWidenerIcon,
    effectLabel: "Stereo wide",
    labelPlacement: "top",
    options: {
      width: {
        id: "stereoWidener_width",
        topLabel: "width",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "width",
        initValue: 0,
      },
    },
  },
  tremolo: {
    effectLabel: "Tremolo",
    labelPlacement: "bottom",
    options: {
      frequency: {
        id: "tremolo_frequency",
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
      depth: {
        id: "tremolo_depth",
        bottomLabel: "depth",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        precision: 2,
        units: "%",
        initValue: 0,
      },
    },
  },
  vibrato: {
    effectLabel: "Vibrato",
    labelPlacement: "top",
    options: {
      frequency: {
        id: "vibrato_frequency",
        topLabel: "freq",
        ticks: 6,
        rangeMax: 10,
        rangeMin: 0,
        units: "Hz",
        initValue: 0,
      },
      depth: {
        id: "vibrato_depth",
        bottomLabel: "depth",
        ticks: 6,
        rangeMax: 1,
        rangeMin: 0,
        units: "%",
        initValue: 0,
      },
    },
  },
};

export default function SamplerEffectsToolbar({ focus }: { focus: boolean }) {
  const [effects, setEffects] = useState<{
    [mixEffect in AudioMixEffectsType]: {
      active: boolean;
      values: {
        [option in MixEffectsOptionsType]?: number;
      };
    };
  }>({
    autoFilter: {
      active: false,
      values: {
        frequency: 0,
        baseFrequency: 0,
        octaves: 0,
      },
    },
    autoPanner: {
      active: false,
      values: {
        frequency: 0,
      },
    },
    autoWah: {
      active: false,
      values: {
        baseFrequency: 0,
        octaves: 0,
        sensitivity: 0,
      },
    },
    bitCrusher: {
      active: false,
      values: {
        bits: 1,
      },
    },
    chebyshev: {
      active: false,
      values: {
        order: 0,
      },
    },
    chorus: {
      active: false,
      values: {
        frequency: 0,
        delayTime: 0,
        depth: 0,
      },
    },
    distortion: {
      active: false,
      values: {
        frequency: 0,
        oversample: 2,
      },
    },
    EQ: {
      active: false,
      values: {
        high: 0,
        mid: 0,
        low: 0,
      },
    },
    feedbackDelay: {
      active: false,
      values: {
        delayTime: 0,
        feedback: 0,
      },
    },
    freeverb: {
      active: false,
      values: {
        roomSize: 0,
        dampening: 0,
      },
    },
    JCReverb: {
      active: false,
      values: {
        roomSize: 0,
      },
    },
    phaser: {
      active: false,
      values: {
        frequency: 0,
        octaves: 0,
        baseFrequency: 0,
      },
    },
    pingPongDelay: {
      active: false,
      values: {
        delayTime: 0,
        feedback: 0,
      },
    },
    pitchShift: {
      active: false,
      values: {
        pitch: 0,
      },
    },
    reverb: {
      active: false,
      values: {
        decay: 0,
        preDelay: 0,
      },
    },
    stereoWidener: {
      active: false,
      values: {
        width: 0,
      },
    },
    tremolo: {
      active: false,
      values: {
        frequency: 0,
        depth: 0,
      },
    },
    vibrato: {
      active: false,
      values: {
        frequency: 0,
        depth: 0,
      },
    },
  });

  return (
    <div className='px-2 mb-1'>
      <ScrollingContainer
        content={
          <div className='h-[7.25rem] flex px-3 items-center justify-center'>
            {Object.entries(samplerEffects).map((effect) => (
              <div
                key={effect[0]}
                className='flex items-center justify-center h-full'
              >
                <SamplerEffect
                  effectValue={effect[0] as AudioMixEffectsType}
                  effect={effect[1]}
                  effects={effects}
                  setEffects={setEffects}
                />
                {effect[0] !== "vibrato" && (
                  <div className='h-1/2 w-1 bg-fg-white-65 rounded-full mx-3'></div>
                )}
              </div>
            ))}
          </div>
        }
        buttonBackgroundColor={
          focus ? "rgba(255, 255, 255, 1)" : "rgba(243, 243, 243, 1)"
        }
      />
    </div>
  );
}
