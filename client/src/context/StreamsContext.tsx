import React, { ReactNode, createContext, useContext, useRef } from "react";

export type EffectTypes = "blur";

export interface StreamsContextProviderProps {
  children: ReactNode;
}

export interface StreamsContextType {
  userStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>;

  userCameraCount: React.MutableRefObject<number>;
  userScreenCount: React.MutableRefObject<number>;
  userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      webcam?: {
        [webcamId: string]: { active: boolean; stopFunction: () => void };
      };
      screen?: {
        [screenId: string]: { active: boolean; stopFunction: () => void };
      };
      audio?: { active: boolean; stopFunction: () => void };
    };
  }>;
  userUneffectedStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>;
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?:
        | {
            [webcamId: string]: MediaStreamTrack;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: MediaStreamTrack;
          }
        | undefined;
      audio?: MediaStreamTrack | undefined;
    };
  }>;
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
  const userStreams = useRef<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: { [screenId: string]: MediaStream };
    audio: MediaStream | undefined;
  }>({ webcam: {}, screen: {}, audio: undefined });
  const userCameraCount = useRef(0);
  const userScreenCount = useRef(0);
  const userStreamEffects = useRef<{
    [effectType in EffectTypes]: {
      webcam?: {
        [webcamId: string]: { active: boolean; stopFunction: () => void };
      };
      screen?: {
        [screenId: string]: { active: boolean; stopFunction: () => void };
      };
      audio?: { active: boolean; stopFunction: () => void };
    };
  }>({ blur: { webcam: {}, screen: {} } });
  const userUneffectedStreams = useRef<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: { [screenId: string]: MediaStream };
    audio: MediaStream | undefined;
  }>({ webcam: {}, screen: {}, audio: undefined });
  const remoteTracksMap = useRef<{
    [username: string]: {
      webcam?: { [webcamId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack;
    };
  }>({});

  return (
    <StreamsContext.Provider
      value={{
        userStreams,
        userCameraCount,
        userScreenCount,
        userStreamEffects,
        userUneffectedStreams,
        remoteTracksMap,
      }}
    >
      {children}
    </StreamsContext.Provider>
  );
}

export default StreamsContext;
