import * as Tone from "tone";

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
export type BitCrusher = "bits";
export type Chebyshev = "order";
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
  | BitCrusher
  | Chebyshev
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
  | Tone.Filter
  | Tone.Panner
  | Tone.AutoFilter
  | Tone.AutoPanner
  | Tone.AutoWah
  | Tone.BitCrusher
  | Tone.Chebyshev
  | Tone.Chorus
  | Tone.Distortion
  | Tone.EQ3
  | Tone.FeedbackDelay
  | Tone.Freeverb
  | Tone.JCReverb
  | Tone.Phaser
  | Tone.PingPongDelay
  | Tone.PitchShift
  | Tone.Reverb
  | Tone.StereoWidener
  | Tone.Tremolo
  | Tone.Vibrato;
