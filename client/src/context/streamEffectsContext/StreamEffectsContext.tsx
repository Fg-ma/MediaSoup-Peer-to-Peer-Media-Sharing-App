import React, { createContext, useContext, useRef } from "react";
import {
  UserEffectsStylesType,
  defaultAudioEffectsStyles,
  RemoteEffectStylesType,
  UserStreamEffectsType,
  RemoteStreamEffectsType,
  defaultAudioStreamEffects,
} from "./typeConstant";

export interface StreamEffectsContextProviderProps {
  children: React.ReactNode;
}

export interface StreamEffectsContextType {
  userStreamEffects: React.MutableRefObject<UserStreamEffectsType>;
  remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>;
  userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>;
  remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>;
}

const StreamEffectsContext = createContext<
  StreamEffectsContextType | undefined
>(undefined);

export const useStreamEffectsContext = () => {
  const context = useContext(StreamEffectsContext);
  if (!context) {
    throw new Error(
      "useStreamEffectsContext must be used within an StreamEffectsContextProvider"
    );
  }
  return context;
};

export function StreamEffectsContextProvider({
  children,
}: StreamEffectsContextProviderProps) {
  const userStreamEffects = useRef<UserStreamEffectsType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: structuredClone(defaultAudioStreamEffects),
  });
  const remoteStreamEffects = useRef<RemoteStreamEffectsType>({});
  const userEffectsStyles = useRef<UserEffectsStylesType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: structuredClone(defaultAudioEffectsStyles),
  });
  const remoteEffectsStyles = useRef<RemoteEffectStylesType>({});

  return (
    <StreamEffectsContext.Provider
      value={{
        userStreamEffects,
        remoteStreamEffects,
        userEffectsStyles,
        remoteEffectsStyles,
      }}
    >
      {children}
    </StreamEffectsContext.Provider>
  );
}

export default StreamEffectsContext;
