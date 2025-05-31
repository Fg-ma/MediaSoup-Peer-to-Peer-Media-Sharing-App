import React, { createContext, useContext, useRef } from "react";
import {
  RemoteDataStreamsType,
  RemoteMediaType,
  StaticContentMediaType,
  UserDataStreamsType,
  UserMediaType,
} from "./lib/typeConstant";

export interface MediaContextProviderProps {
  children: React.ReactNode;
}

export interface MediaContextType {
  userMedia: React.MutableRefObject<UserMediaType>;
  remoteMedia: React.MutableRefObject<RemoteMediaType>;
  staticContentMedia: React.MutableRefObject<StaticContentMediaType>;
  remoteDataStreams: React.MutableRefObject<RemoteDataStreamsType>;
  userDataStreams: React.MutableRefObject<UserDataStreamsType>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const useMediaContext = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error(
      "useMediaContext must be used within an MediaContextProvider",
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
  });
  const remoteMedia = useRef<RemoteMediaType>({});
  const staticContentMedia = useRef<StaticContentMediaType>({
    video: { user: {}, table: {}, tableInstances: {} },
    image: { user: {}, table: {}, tableInstances: {} },
    svg: { user: {}, table: {}, tableInstances: {} },
    application: { user: {}, table: {}, tableInstances: {} },
    text: { user: {}, table: {}, tableInstances: {} },
    soundClip: { user: {}, table: {}, tableInstances: {} },
    gamesSignaling: undefined,
    games: {},
  });
  const remoteDataStreams = useRef<RemoteDataStreamsType>({});
  const userDataStreams = useRef<UserDataStreamsType>({});

  return (
    <MediaContext.Provider
      value={{
        userMedia,
        remoteMedia,
        staticContentMedia,
        remoteDataStreams,
        userDataStreams,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export default MediaContext;
