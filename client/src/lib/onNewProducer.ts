import React from "react";
import { Root, createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import getBrowserMedia from "../getBrowserMedia";
import Bundle from "../bundle/Bundle";

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
  cameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>,
  cameraCount: React.MutableRefObject<number>,
  screenStreams: React.MutableRefObject<{
    [screenId: string]: MediaStream;
  }>,
  screenCount: React.MutableRefObject<number>,
  audioStream: React.MutableRefObject<MediaStream | undefined>,
  newCameraBtnRef: React.RefObject<HTMLButtonElement>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  audioBtnRef: React.RefObject<HTMLButtonElement>,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  muteAudio: () => void,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const oldBundle = document.getElementById(`${username.current}_bundle`);
  const oldBundleContainer = document.getElementById(
    `${username.current}_bundle_container`
  );

  if (event.producerType === "webcam") {
    if (
      cameraStreams.current[
        `${username.current}_camera_stream_${cameraCount.current}`
      ]
    ) {
      return;
    }
    const cameraBrowserMedia = await getBrowserMedia(
      event.producerType,
      device,
      newCameraBtnRef,
      webcamBtnRef,
      screenBtnRef,
      audioBtnRef,
      isScreen,
      setScreenActive
    );
    if (cameraBrowserMedia) {
      cameraStreams.current[
        `${username.current}_camera_stream_${cameraCount.current}`
      ] = cameraBrowserMedia;
      const track =
        cameraStreams.current[
          `${username.current}_camera_stream_${cameraCount.current}`
        ].getVideoTracks()[0];
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
    if (
      screenStreams.current[
        `${username.current}_screen_stream_${screenCount.current}`
      ]
    ) {
      return;
    }
    const screenBrowserMedia = await getBrowserMedia(
      event.producerType,
      device,
      newCameraBtnRef,
      webcamBtnRef,
      screenBtnRef,
      audioBtnRef,
      isScreen,
      setScreenActive
    );
    if (screenBrowserMedia) {
      screenStreams.current[
        `${username.current}_screen_stream_${screenCount.current}`
      ] = screenBrowserMedia;
      const track =
        screenStreams.current[
          `${username.current}_screen_stream_${screenCount.current}`
        ].getVideoTracks()[0];
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
    audioStream.current = await getBrowserMedia(
      event.producerType,
      device,
      newCameraBtnRef,
      webcamBtnRef,
      screenBtnRef,
      audioBtnRef,
      isScreen,
      setScreenActive
    );
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
    if (oldBundle && remoteVideosContainerRef.current?.contains(oldBundle)) {
      remoteVideosContainerRef.current?.removeChild(oldBundle);
    }

    // create new bundle
    const bundleContainer = document.createElement("div");
    bundleContainer.id = `${username.current}_bundle`;
    remoteVideosContainerRef.current.append(bundleContainer);

    const root = createRoot(bundleContainer);
    root.render(
      React.createElement(Bundle, {
        username: username.current,
        cameraStreams:
          isWebcam.current && cameraStreams.current
            ? cameraStreams.current
            : undefined,
        screenStreams:
          isScreen.current && screenStreams.current
            ? screenStreams.current
            : undefined,
        audioStream:
          isAudio.current && audioStream.current
            ? audioStream.current
            : undefined,
        isAudio: false,
        isUser: true,
        muteButtonCallback: muteAudio,
        onRendered: () => {
          // Add mute to new bundle container if the old bundle container contained it
          if (oldBundleContainer?.classList.contains("mute")) {
            const newBundleContainer = document.getElementById(
              `${username.current}_bundle_container`
            );

            newBundleContainer?.classList.add("mute");
          }
        },
      })
    );
  }

  if (webcamBtnRef.current) webcamBtnRef.current.disabled = false;
  if (screenBtnRef.current) screenBtnRef.current.disabled = false;
  if (audioBtnRef.current) audioBtnRef.current.disabled = false;
  if (newCameraBtnRef.current) newCameraBtnRef.current.disabled = false;
};

export default onNewProducer;
