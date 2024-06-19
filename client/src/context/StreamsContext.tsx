import React, { ReactNode, createContext, useContext, useRef } from "react";

export type EffectTypes = "blur" | "tint" | "ears" | "glasses" | "beard";

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
  userUneffectedStreams: React.MutableRefObject<{
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
        [webcamId: string]: boolean;
      };
      screen?: {
        [screenId: string]: boolean;
      };
      audio?: boolean;
    };
  }>;
  userStopStreamEffects: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
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
  const userUneffectedStreams = useRef<{
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
        [webcamId: string]: boolean;
      };
      screen?: {
        [screenId: string]: boolean;
      };
      audio?: boolean;
    };
  }>({
    blur: { webcam: {}, screen: {} },
    tint: { webcam: {}, screen: {} },
    ears: { webcam: {} },
    glasses: { webcam: {} },
    beard: { webcam: {} },
  });
  const userStopStreamEffects = useRef<{
    webcam: {
      [webcamId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
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
        userUneffectedStreams,
        userCameraCount,
        userScreenCount,
        userStreamEffects,
        userStopStreamEffects,
        remoteTracksMap,
      }}
    >
      {children}
    </StreamsContext.Provider>
  );
}

export default StreamsContext;
