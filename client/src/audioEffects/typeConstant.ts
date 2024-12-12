import {
  Filter,
  Panner,
  AutoFilter,
  AutoPanner,
  AutoWah,
  Chorus,
  Distortion,
  EQ3,
  FeedbackDelay,
  Freeverb,
  JCReverb,
  Phaser,
  PingPongDelay,
  PitchShift,
  Reverb,
  StereoWidener,
  Tremolo,
  Vibrato,
  BitCrusher,
  Chebyshev,
} from "tone";

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

export type AutoFilterOptionsType = "frequency" | "baseFrequency" | "octaves";
export type AutoPannerOptionsType = "frequency";
export type AutoWahOptionsType = "baseFrequency" | "octaves" | "sensitivity";
export type BitCrusherType = "bits";
export type ChebyshevType = "order";
export type ChorusOptionsType = "frequency" | "delayTime" | "depth";
export type DistortionOptionsType = "distortion" | "oversample";
export type EQOptionsType = "high" | "mid" | "low";
export type FeedbackDelayOptionsType = "delayTime" | "feedback";
export type FreeverbOptionsType = "roomSize" | "dampening";
export type JCReverbOptionsType = "roomSize";
export type PhaserOptionsType = "frequency" | "octaves" | "baseFrequency";
export type PingPongDelayOptionsType = "delayTime" | "feedback";
export type PitchShiftOptionsType = "pitch";
export type ReverbOptionsType = "decay" | "preDelay";
export type StereoWidenerOptionsType = "width";
export type TremoloOptionsType = "frequency" | "depth";
export type VibratoOptionsType = "frequency" | "depth";

export type MixEffectsOptionsType =
  | AutoFilterOptionsType
  | AutoPannerOptionsType
  | AutoWahOptionsType
  | BitCrusherType
  | ChebyshevType
  | ChorusOptionsType
  | DistortionOptionsType
  | EQOptionsType
  | FeedbackDelayOptionsType
  | FreeverbOptionsType
  | JCReverbOptionsType
  | PhaserOptionsType
  | PingPongDelayOptionsType
  | PitchShiftOptionsType
  | ReverbOptionsType
  | StereoWidenerOptionsType
  | TremoloOptionsType
  | VibratoOptionsType;

export type ToneEffectsType =
  | Filter
  | Panner
  | AutoFilter
  | AutoPanner
  | AutoWah
  | BitCrusher
  | Chebyshev
  | Chorus
  | Distortion
  | EQ3
  | FeedbackDelay
  | Freeverb
  | JCReverb
  | Phaser
  | PingPongDelay
  | PitchShift
  | Reverb
  | StereoWidener
  | Tremolo
  | Vibrato;
