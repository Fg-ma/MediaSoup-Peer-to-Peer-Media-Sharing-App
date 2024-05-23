import React from "react";
import { Root, createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import getBrowserMedia from "../getBrowserMedia";
import Bundle from "../Bundle";

const onNewProducer = async (
  event: {
    type: string;
    producerType: "webcam" | "screen";
  },
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  username: React.MutableRefObject<string>,
  isWebcam: React.MutableRefObject<boolean>,
  isScreen: React.MutableRefObject<boolean>,
  isAudio: React.MutableRefObject<boolean>,
  cameraStream: React.MutableRefObject<MediaStream | undefined>,
  screenStream: React.MutableRefObject<MediaStream | undefined>,
  audioStream: React.MutableRefObject<MediaStream | undefined>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  audioBtnRef: React.RefObject<HTMLButtonElement>,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  muteAudio: () => void
) => {
  webcamBtnRef.current!.disabled = false;
  screenBtnRef.current!.disabled = false;
  audioBtnRef.current!.disabled = false;

  const oldBundle = document.getElementById(`${username.current}_bundle`);

  if (event.producerType === "webcam") {
    if (cameraStream.current) {
      console.error("Already existing camera stream for: ", username.current);
      return;
    }
    cameraStream.current = await getBrowserMedia(event.producerType, device);
    if (cameraStream.current) {
      const track = cameraStream.current.getVideoTracks()[0];
      const params = {
        track: track,
        appData: {
          producerType: "webcam",
        },
      };
      try {
        await producerTransport.current?.produce(params);
      } catch {
        console.error("Camera new transport failed to produce");
        return;
      }
    }
  } else if (event.producerType === "screen") {
    if (screenStream.current) {
      console.error("Already existing screen stream for: ", username.current);
      return;
    }
    screenStream.current = await getBrowserMedia(event.producerType, device);
    if (screenStream.current) {
      const track = screenStream.current.getVideoTracks()[0];
      const params = {
        track: track,
        appData: {
          producerType: "screen",
        },
      };
      try {
        await producerTransport.current?.produce(params);
      } catch {
        console.error("Screen new transport failed to produce");
        return;
      }
    }
  } else if (event.producerType === "audio") {
    if (audioStream.current) {
      console.error("Already existing audio stream for: ", username.current);
      return;
    }
    audioStream.current = await getBrowserMedia(event.producerType, device);
    if (audioStream.current) {
      const track = audioStream.current.getAudioTracks()[0];
      const params = {
        track: track,
        appData: {
          producerType: "audio",
        },
      };
      try {
        await producerTransport.current?.produce(params);
      } catch {
        console.error("Audio new transport failed to produce");
        return;
      }
    }
  }

  if (remoteVideosContainerRef.current) {
    // Remove old bundle
    if (oldBundle) {
      remoteVideosContainerRef.current?.removeChild(oldBundle);
    }

    // create new bundle
    const bundleContainer = document.createElement("div");
    bundleContainer.id = `${username.current}_bundle`;
    remoteVideosContainerRef.current.append(bundleContainer);

    const root = createRoot(bundleContainer);
    root.render(
      React.createElement(Bundle, {
        cameraStream:
          isWebcam.current && cameraStream.current
            ? cameraStream.current
            : undefined,
        screenStream:
          isScreen.current && screenStream.current
            ? screenStream.current
            : undefined,
        audioStream:
          isAudio.current && audioStream.current
            ? audioStream.current
            : undefined,
        isUser: true,
        muteButtonCallback: muteAudio,
      })
    );
  }
};

export default onNewProducer;
