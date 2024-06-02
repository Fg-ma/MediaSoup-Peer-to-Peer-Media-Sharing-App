import React, { ReactNode, createContext, useContext, useRef } from "react";

export interface StreamsContextProviderProps {
  children: ReactNode;
}

export interface StreamsContextType {
  userCameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>;
  userCameraCount: React.MutableRefObject<number>;
  userScreenStreams: React.MutableRefObject<{
    [screenId: string]: MediaStream;
  }>;
  userScreenCount: React.MutableRefObject<number>;
  userAudioStream: React.MutableRefObject<MediaStream | undefined>;
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
  const userCameraStreams = useRef<{ [webcamId: string]: MediaStream }>({});
  const userCameraCount = useRef(0);
  const userScreenStreams = useRef<{ [screenId: string]: MediaStream }>({});
  const userScreenCount = useRef(0);
  const userAudioStream = useRef<MediaStream>();
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
        userCameraStreams,
        userCameraCount,
        userScreenStreams,
        userScreenCount,
        userAudioStream,
        remoteTracksMap,
      }}
    >
      {children}
    </StreamsContext.Provider>
  );
}

export default StreamsContext;
