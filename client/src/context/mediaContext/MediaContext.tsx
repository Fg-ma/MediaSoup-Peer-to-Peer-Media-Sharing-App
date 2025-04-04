import React, { createContext, useContext, useRef } from "react";
import {
  RemoteDataStreamsType,
  RemoteMediaType,
  UserDataStreamsType,
  UserMediaType,
} from "./typeConstant";

export interface MediaContextProviderProps {
  children: React.ReactNode;
}

export interface MediaContextType {
  userMedia: React.MutableRefObject<UserMediaType>;
  remoteMedia: React.MutableRefObject<RemoteMediaType>;
  remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>;
  userDataStreams: React.MutableRefObject<UserDataStreamsType>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const useMediaContext = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error(
      "useMediaContext must be used within an MediaContextProvider"
    );
  }
  return context;
};

export function MediaContextProvider({ children }: MediaContextProviderProps) {
  const userMedia = useRef<UserMediaType>({
    camera: {},
    screen: {},
    screenAudio: {},
    audio: undefined,
    video: { all: {}, instances: {} },
    image: { all: {}, instances: {} },
    svg: { all: {}, instances: {} },
    application: { all: {}, instances: {} },
    text: { all: {}, instances: {} },
    soundClip: { all: {}, instances: {} },
    gamesSignaling: undefined,
    games: {},
  });
  const remoteMedia = useRef<RemoteMediaType>({});
  const remoteDataStreams = useRef<RemoteDataStreamsType>({});
  const userDataStreams = useRef<UserDataStreamsType>({});

  return (
    <MediaContext.Provider
      value={{
        userMedia,
        remoteMedia,
        remoteDataStreams,
        userDataStreams,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export default MediaContext;
