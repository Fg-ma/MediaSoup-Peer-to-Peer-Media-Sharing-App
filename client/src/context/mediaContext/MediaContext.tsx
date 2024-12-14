import React, { createContext, useContext, useRef } from "react";
import {
  RemoteDataStreamsType,
  RemoteTracksMapType,
  UserDataStreamsType,
  UserMediaType,
} from "./typeConstant";

export interface MediaContextProviderProps {
  children: React.ReactNode;
}

export interface MediaContextType {
  userMedia: React.MutableRefObject<UserMediaType>;
  remoteTracksMap: React.MutableRefObject<RemoteTracksMapType>;
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
    games: {},
  });
  const remoteTracksMap = useRef<RemoteTracksMapType>({});
  const remoteDataStreams = useRef<RemoteDataStreamsType>({});
  const userDataStreams = useRef<UserDataStreamsType>({});

  return (
    <MediaContext.Provider
      value={{
        userMedia,
        remoteTracksMap,
        remoteDataStreams,
        userDataStreams,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

export default MediaContext;
