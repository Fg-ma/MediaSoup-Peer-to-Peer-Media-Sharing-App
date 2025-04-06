import { AudioEffectTypes } from "../../../../universal/effectsTypeConstant";

export interface TableSoundClipsType {
  tid: string;
  sid: string;
  m: string;
  n: string;
  s: number[];
  i: {
    siid: string;
    p: {
      p: {
        l: number;
        t: number;
      };
      s: {
        x: number;
        y: number;
      };
      r: number;
    };
    e: number[];
  }[];
}

export const soundClipEffectEncodingMap: Record<AudioEffectTypes, number> = {
  robot: 0,
  echo: 1,
  alien: 2,
  underwater: 3,
  telephone: 4,
  space: 5,
  distortion: 6,
  vintage: 7,
  psychedelic: 8,
  deepBass: 9,
  highEnergy: 10,
  ambient: 11,
  glitch: 12,
  muffled: 13,
  crystal: 14,
  heavyMetal: 15,
  dreamy: 16,
  horror: 17,
  sciFi: 18,
  dystopian: 19,
  retroGame: 20,
  ghostly: 21,
  metallic: 22,
  hypnotic: 23,
  cyberpunk: 24,
  windy: 24,
  radio: 25,
  explosion: 26,
  whisper: 27,
  submarine: 28,
  windTunnel: 29,
  crushedBass: 30,
  ethereal: 31,
  electroSting: 32,
  heartbeat: 33,
  underworld: 34,
  sizzling: 35,
  staticNoise: 36,
  bubbly: 37,
  thunder: 38,
  echosOfThePast: 39,
};
