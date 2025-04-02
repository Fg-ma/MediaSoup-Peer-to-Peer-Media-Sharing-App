import React, { createContext, useContext, useRef } from "react";
import {
  UserEffectsStylesType,
  defaultAudioEffectsStyles,
  RemoteEffectStylesType,
  UserEffectsType,
  RemoteEffectsType,
  defaultAudioStreamEffects,
  CaptureStreamEffectsType,
  CaptureEffectStylesType,
  defaultCaptureStreamEffects,
  defaultCaptureEffectsStyles,
} from "../../../../universal/effectsTypeConstant";

export interface EffectsContextProviderProps {
  children: React.ReactNode;
}

export interface EffectsContextType {
  userEffects: React.MutableRefObject<UserEffectsType>;
  remoteEffects: React.MutableRefObject<RemoteEffectsType>;
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
  const userEffects = useRef<UserEffectsType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: structuredClone(defaultAudioStreamEffects),
    video: {},
    image: {},
    svg: {},
    application: {},
    soundClip: {},
  });
  const remoteEffects = useRef<RemoteEffectsType>({});
  const userEffectsStyles = useRef<UserEffectsStylesType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: structuredClone(defaultAudioEffectsStyles),
    video: {},
    image: {},
    svg: {},
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
        userEffects,
        remoteEffects,
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
