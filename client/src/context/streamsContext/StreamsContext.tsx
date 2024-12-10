import React, { createContext, useContext, useRef } from "react";
import {
  defaultAudioStreamEffects,
  RemoteDataStreamsType,
  RemoteStreamEffectsType,
  RemoteTracksMapType,
  UserDataStreamsType,
  UserMediaType,
  UserStreamEffectsType,
} from "./typeConstant";

export interface StreamsContextProviderProps {
  children: React.ReactNode;
}

export interface StreamsContextType {
  userMedia: React.MutableRefObject<UserMediaType>;
  userStreamEffects: React.MutableRefObject<UserStreamEffectsType>;
  remoteStreamEffects: React.MutableRefObject<RemoteStreamEffectsType>;
  remoteTracksMap: React.MutableRefObject<RemoteTracksMapType>;
  remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>;
  userDataStreams: React.MutableRefObject<UserDataStreamsType>;
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
  const userMedia = useRef<UserMediaType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: undefined,
  });
  const userStreamEffects = useRef<UserStreamEffectsType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: structuredClone(defaultAudioStreamEffects),
  });
  const remoteStreamEffects = useRef<RemoteStreamEffectsType>({});
  const remoteTracksMap = useRef<RemoteTracksMapType>({});
  const remoteDataStreams = useRef<RemoteDataStreamsType>({});
  const userDataStreams = useRef<UserDataStreamsType>({});

  return (
    <StreamsContext.Provider
      value={{
        userMedia,
        userStreamEffects,
        remoteStreamEffects,
        remoteTracksMap,
        remoteDataStreams,
        userDataStreams,
      }}
    >
      {children}
    </StreamsContext.Provider>
  );
}

export default StreamsContext;
