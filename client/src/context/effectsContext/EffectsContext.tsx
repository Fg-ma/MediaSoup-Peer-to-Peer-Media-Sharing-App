import React, { createContext, useContext, useRef } from "react";
import {
  UserEffectsStylesType,
  defaultAudioEffectsStyles,
  RemoteEffectStylesType,
  UserEffectsType,
  RemoteEffectsType,
  defaultAudioEffects,
  CaptureEffectsType,
  CaptureEffectStylesType,
  defaultCaptureEffects,
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
  captureEffects: React.MutableRefObject<CaptureEffectsType>;
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
    audio: structuredClone(defaultAudioEffects),
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
  const captureEffects = useRef<CaptureEffectsType>(
    structuredClone(defaultCaptureEffects)
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
        captureEffects,
        captureEffectsStyles,
      }}
    >
      {children}
    </EffectsContext.Provider>
  );
}

export default EffectsContext;
