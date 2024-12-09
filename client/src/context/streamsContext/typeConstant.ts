import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import { DataProducer } from "mediasoup-client/lib/DataProducer";
import AudioMedia from "src/lib/AudioMedia";
import CameraMedia from "src/lib/CameraMedia";
import ScreenAudioMedia from "src/lib/ScreenAudioMedia";
import ScreenMedia from "src/lib/ScreenMedia";

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

export type DataStreamTypes = "positionScaleRotation";

export type UserMediaType = {
  camera: {
    [cameraId: string]: CameraMedia;
  };
  screen: { [screenId: string]: ScreenMedia };
  screenAudio: { [screenAudioId: string]: ScreenAudioMedia };
  audio: AudioMedia | undefined;
};

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

export type RemoteTracksMapType = {
  [username: string]: {
    [instance: string]: {
      camera?: { [cameraId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      screenAudio?: { [screenAudioId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack;
    };
  };
};

export type RemoteDataStreamsType = {
  [username: string]: {
    [instance: string]: {
      positionScaleRotation?: DataConsumer;
    };
  };
};

export type UserDataStreamsType = {
  positionScaleRotation?: DataProducer;
};
