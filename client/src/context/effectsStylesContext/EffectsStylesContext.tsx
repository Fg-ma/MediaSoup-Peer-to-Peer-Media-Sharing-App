import React, { createContext, useContext, useRef } from "react";
import {
  UserEffectsStylesType,
  defaultAudioEffectsStyles,
  RemoteEffectStylesType,
} from "./typeConstant";

export interface EffectsStylesContextProviderProps {
  children: React.ReactNode;
}

export interface EffectsStylesContextType {
  userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>;
  remoteEffectsStyles: React.MutableRefObject<RemoteEffectStylesType>;
}

const EffectsStylesContext = createContext<
  EffectsStylesContextType | undefined
>(undefined);

export const useEffectsStylesContext = () => {
  const context = useContext(EffectsStylesContext);
  if (!context) {
    throw new Error(
      "useEffectsStylesContext must be used within an EffectsStylesContextProvider"
    );
  }
  return context;
};

export function EffectsStylesContextProvider({
  children,
}: EffectsStylesContextProviderProps) {
  const userEffectsStyles = useRef<UserEffectsStylesType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: structuredClone(defaultAudioEffectsStyles),
  });
  const remoteEffectsStyles = useRef<RemoteEffectStylesType>({});

  return (
    <EffectsStylesContext.Provider
      value={{
        userEffectsStyles,
        remoteEffectsStyles,
      }}
    >
      {children}
    </EffectsStylesContext.Provider>
  );
}

export default EffectsStylesContext;
