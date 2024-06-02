import React from "react";
import { Socket } from "socket.io-client";
import * as mediasoup from "mediasoup-client";

const onProducerDisconnected = (
  event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId: string;
  },
  username: React.MutableRefObject<string>,
  roomName: React.MutableRefObject<string>,
  socket: React.MutableRefObject<Socket>,
  userCameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>,
  userScreenStreams: React.MutableRefObject<{
    [screenId: string]: MediaStream;
  }>,
  userAudioStream: React.MutableRefObject<MediaStream | undefined>,
  handleDisableEnableBtns: (disabled: boolean) => void,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?: { [webcamId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack | undefined;
    };
  }>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  muteAudio: () => void,
  isWebcam: React.MutableRefObject<boolean>,
  setWebcamActive: React.Dispatch<React.SetStateAction<boolean>>,
  isScreen: React.MutableRefObject<boolean>,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  setBundles: React.Dispatch<
    React.SetStateAction<
      | {
          [username: string]: React.JSX.Element;
        }
      | undefined
    >
  >
) => {
  if (event.producerUsername === username.current) {
    if (event.producerType === "webcam") {
      userCameraStreams.current[event.producerId]
        ?.getTracks()
        .forEach((track) => track.stop());
      delete userCameraStreams.current[event.producerId];
    } else if (event.producerType === "screen") {
      userScreenStreams.current[event.producerId]
        ?.getTracks()
        .forEach((track) => track.stop());
      delete userScreenStreams.current[event.producerId];
    } else if (event.producerType === "audio") {
      userAudioStream.current?.getTracks().forEach((track) => track.stop());
      userAudioStream.current = undefined;
    }

    if (
      (!userCameraStreams.current ||
        Object.keys(userCameraStreams.current).length === 0) &&
      (!userScreenStreams.current ||
        Object.keys(userScreenStreams.current).length === 0) &&
      !userAudioStream.current
    ) {
      setBundles((prev) => {
        const newBundles = prev;
        if (newBundles) {
          delete newBundles[event.producerUsername];
        }
        return newBundles;
      });
      producerTransport.current = undefined;
    }
    if (Object.keys(userCameraStreams.current).length === 0) {
      isWebcam.current = false;
      setWebcamActive(false);
    } else {
      isWebcam.current = true;
      setWebcamActive(true);
    }
    if (Object.keys(userScreenStreams.current).length === 0) {
      isScreen.current = false;
      setScreenActive(false);
    } else {
      isScreen.current = true;
      setScreenActive(true);
    }
    handleDisableEnableBtns(false);
  } else {
    if (
      event.producerType === "webcam" &&
      remoteTracksMap.current[event.producerUsername]?.webcam?.[
        event.producerId
      ]
    ) {
      delete remoteTracksMap.current[event.producerUsername]?.webcam?.[
        event.producerId
      ];
    } else if (
      event.producerType === "screen" &&
      remoteTracksMap.current[event.producerUsername]?.screen?.[
        event.producerId
      ]
    ) {
      delete remoteTracksMap.current[event.producerUsername]?.screen?.[
        event.producerId
      ];
    } else if (
      event.producerType === "audio" &&
      remoteTracksMap.current[event.producerUsername]?.audio
    ) {
      delete remoteTracksMap.current[event.producerUsername]?.audio;
    }

    if (
      remoteTracksMap.current[event.producerUsername] &&
      Object.keys(remoteTracksMap.current[event.producerUsername]).length === 0
    ) {
      delete remoteTracksMap.current[event.producerUsername];
      setBundles((prev) => {
        const newBundles = prev;
        if (newBundles) {
          delete newBundles[event.producerUsername];
        }
        return newBundles;
      });
    }
  }
};

export default onProducerDisconnected;
