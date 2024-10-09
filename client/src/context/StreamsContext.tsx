import React, { createContext, useContext, useRef } from "react";
import CameraMedia from "../lib/CameraMedia";
import ScreenMedia from "../lib/ScreenMedia";
import AudioMedia from "../lib/AudioMedia";

export const defaultAudioStreamEffects: {
  [effect in AudioEffectTypes]: boolean;
} = {
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
};

export const defaultCameraStreamEffects: {
  [effect in CameraEffectTypes]: boolean;
} = {
  pause: false,
  hideBackground: false,
  blur: false,
  tint: false,
  glasses: false,
  beards: false,
  mustaches: false,
  masks: false,
  hats: false,
  pets: false,
};

export const defaultScreenStreamEffects: {
  [effect in ScreenEffectTypes]: boolean;
} = {
  pause: false,
  blur: false,
  tint: false,
};

export type CameraEffectTypes =
  | "pause"
  | "hideBackground"
  | "blur"
  | "tint"
  | "glasses"
  | "beards"
  | "mustaches"
  | "masks"
  | "hats"
  | "pets";

export type ScreenEffectTypes = "pause" | "blur" | "tint";

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

export interface StreamsContextProviderProps {
  children: React.ReactNode;
}

export interface StreamsContextType {
  userCameraCount: React.MutableRefObject<number>;
  userScreenCount: React.MutableRefObject<number>;
  userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;
  userStreamEffects: React.MutableRefObject<{
    camera: {
      [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
    };
    screen: {
      [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
    };
    audio: { [effectType in AudioEffectTypes]: boolean };
  }>;
  remoteStreamEffects: React.MutableRefObject<{
    [username: string]: {
      [instance: string]: {
        camera: {
          [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
        };
        screen: {
          [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
        };
        audio: { [effectType in AudioEffectTypes]: boolean };
      };
    };
  }>;
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      [instance: string]: {
        camera?:
          | {
              [cameraId: string]: MediaStreamTrack;
            }
          | undefined;
        screen?:
          | {
              [screenId: string]: MediaStreamTrack;
            }
          | undefined;
        audio?: MediaStreamTrack | undefined;
      };
    };
  }>;
}

const StreamsContext = createContext<StreamsContextType | undefined>(undefined);

export const useStreamsContext = () => {
  const context = useContext(StreamsContext);
  if (!context) {
    throw new Error(
      "useStreamsContext must be used within an StreamsContextProvider"
    );
  }
  return context;
};

export function StreamsContextProvider({
  children,
}: StreamsContextProviderProps) {
  const userCameraCount = useRef(0);
  const userScreenCount = useRef(0);
  const userMedia = useRef<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: { [screenId: string]: ScreenMedia };
    audio: AudioMedia | undefined;
  }>({ camera: {}, screen: {}, audio: undefined });
  const userStreamEffects = useRef<{
    camera: {
      [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
    };
    screen: {
      [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
    };
    audio: { [effectType in AudioEffectTypes]: boolean };
  }>({
    camera: {},
    screen: {},
    audio: defaultAudioStreamEffects,
  });
  const remoteStreamEffects = useRef<{
    [username: string]: {
      [instance: string]: {
        camera: {
          [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
        };
        screen: {
          [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
        };
        audio: { [effectType in AudioEffectTypes]: boolean };
      };
    };
  }>({});
  const remoteTracksMap = useRef<{
    [username: string]: {
      [instance: string]: {
        camera?: { [cameraId: string]: MediaStreamTrack };
        screen?: { [screenId: string]: MediaStreamTrack };
        audio?: MediaStreamTrack;
      };
    };
  }>({});

  return (
    <StreamsContext.Provider
      value={{
        userCameraCount,
        userScreenCount,
        userMedia,
        userStreamEffects,
        remoteStreamEffects,
        remoteTracksMap,
      }}
    >
      {children}
    </StreamsContext.Provider>
  );
}

export default StreamsContext;
