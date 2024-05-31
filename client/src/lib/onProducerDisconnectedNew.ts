import React from "react";
import { Socket } from "socket.io-client";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import Bundle from "../bundle/Bundle";

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
  handleDisableEnableBtns: (disabled: boolean) => void,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  cameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>,
  screenStreams: React.MutableRefObject<{
    [screenId: string]: MediaStream;
  }>,
  audioStream: React.MutableRefObject<MediaStream | undefined>,
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
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const producerRemoved = document.getElementById(
    `${event.producerId}_container`
  );
  const bundleContainer = document.getElementById(
    `${event.producerUsername}_bundle_container`
  );
  if (
    bundleContainer &&
    producerRemoved &&
    bundleContainer.contains(producerRemoved)
  ) {
    bundleContainer.removeChild(producerRemoved);
  }

  if (event.producerUsername === username.current) {
    if (event.producerType === "webcam") {
      cameraStreams.current[event.producerId]
        ?.getTracks()
        .forEach((track) => track.stop());
      delete cameraStreams.current[event.producerId];
    } else if (event.producerType === "screen") {
      screenStreams.current[event.producerId]
        ?.getTracks()
        .forEach((track) => track.stop());
      delete screenStreams.current[event.producerId];
    } else if (event.producerType === "audio") {
      audioStream.current?.getTracks().forEach((track) => track.stop());
      audioStream.current = undefined;
    }

    if (
      !cameraStreams.current &&
      !screenStreams.current &&
      !audioStream.current
    ) {
      const bundle = document.getElementById(
        `${event.producerUsername}_bundle`
      );
      if (
        bundle &&
        remoteVideosContainerRef.current?.contains(producerRemoved)
      ) {
        remoteVideosContainerRef.current.removeChild(bundle);
      }
      producerTransport.current = undefined;
    }
    if (Object.keys(cameraStreams.current).length === 0) {
      isWebcam.current = false;
      setWebcamActive(false);
    } else {
      isWebcam.current = true;
      setWebcamActive(true);
    }
    if (Object.keys(screenStreams.current).length === 0) {
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

    if (!remoteTracksMap.current[event.producerUsername]) {
      const bundle = document.getElementById(
        `${event.producerUsername}_bundle`
      );
      if (
        bundle &&
        remoteVideosContainerRef.current?.contains(producerRemoved)
      ) {
        remoteVideosContainerRef.current.removeChild(bundle);
      }
      delete remoteTracksMap.current[event.producerUsername];
    }
  }

  // Add disconnected class used to update the bundle streams in Bundle.jsx
  bundleContainer?.classList.add(`disconnected_${event.producerId}`);
};

export default onProducerDisconnected;
