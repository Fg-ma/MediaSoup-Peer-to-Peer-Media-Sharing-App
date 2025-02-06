import React, { createContext, useContext, useRef } from "react";
import {
  UserEffectsStylesType,
  defaultAudioEffectsStyles,
  RemoteEffectStylesType,
  UserStreamEffectsType,
  RemoteStreamEffectsType,
  defaultAudioStreamEffects,
} from "./typeConstant";

export interface EffectsContextProviderProps {
  children: React.ReactNode;
}

export interface EffectsContextType {
  userStreamEffects: React.MutableRefObject<UserStreamEffectsType>;
  remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>;
  userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>;
  remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>;
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
  });
  const remoteStreamEffects = useRef<RemoteStreamEffectsType>({});
  const userEffectsStyles = useRef<UserEffectsStylesType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: structuredClone(defaultAudioEffectsStyles),
    video: {},
    image: {},
  });
  const remoteEffectsStyles = useRef<RemoteEffectStylesType>({});

  return (
    <EffectsContext.Provider
      value={{
        userStreamEffects,
        remoteStreamEffects,
        userEffectsStyles,
        remoteEffectsStyles,
      }}
    >
      {children}
    </EffectsContext.Provider>
  );
}

export default EffectsContext;
