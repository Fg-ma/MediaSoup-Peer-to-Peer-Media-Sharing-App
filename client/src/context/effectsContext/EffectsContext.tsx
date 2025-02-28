import React, { createContext, useContext, useRef } from "react";
import {
  UserEffectsStylesType,
  defaultAudioEffectsStyles,
  RemoteEffectStylesType,
  UserStreamEffectsType,
  RemoteStreamEffectsType,
  defaultAudioStreamEffects,
  CaptureStreamEffectsType,
  CaptureEffectStylesType,
  defaultCaptureStreamEffects,
  defaultCaptureEffectsStyles,
} from "./typeConstant";

export interface EffectsContextProviderProps {
  children: React.ReactNode;
}

export interface EffectsContextType {
  userStreamEffects: React.MutableRefObject<UserStreamEffectsType>;
  remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>;
  userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>;
  remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>;
  captureStreamEffects: React.MutableRefObject<CaptureStreamEffectsType>;
  captureEffectsStyles: React.MutableRefObject<CaptureEffectStylesType>;
}

const EffectsContext = createContext<EffectsContextType | undefined>(undefined);

export const useEffectsContext = () => {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error(
      "useEffectsContext must be used within an EffectsContextProvider"
    );
  }
  return context;
};

export function EffectsContextProvider({
  children,
}: EffectsContextProviderProps) {
  const userStreamEffects = useRef<UserStreamEffectsType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: structuredClone(defaultAudioStreamEffects),
    video: {},
    image: {},
    application: {},
    soundClip: {},
  });
  const remoteStreamEffects = useRef<RemoteStreamEffectsType>({});
  const userEffectsStyles = useRef<UserEffectsStylesType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: structuredClone(defaultAudioEffectsStyles),
    video: {},
    image: {},
    application: {},
    soundClip: {},
  });
  const remoteEffectsStyles = useRef<RemoteEffectStylesType>({});
  const captureStreamEffects = useRef<CaptureStreamEffectsType>(
    structuredClone(defaultCaptureStreamEffects)
  );
  const captureEffectsStyles = useRef<CaptureEffectStylesType>(
    structuredClone(defaultCaptureEffectsStyles)
  );

  return (
    <EffectsContext.Provider
      value={{
        userStreamEffects,
        remoteStreamEffects,
        userEffectsStyles,
        remoteEffectsStyles,
        captureStreamEffects,
        captureEffectsStyles,
      }}
    >
      {children}
    </EffectsContext.Provider>
  );
}

export default EffectsContext;
