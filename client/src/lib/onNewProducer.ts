import React from "react";
import { Socket } from "socket.io-client";
import { createRoot } from "react-dom/client";
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
  roomName: React.MutableRefObject<string>,
  socket: React.MutableRefObject<Socket>,
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
  handleDisableEnableBtns: (disabled: boolean) => void,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  muteAudio: () => void,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  setWebcamActive: React.Dispatch<React.SetStateAction<boolean>>
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
      handleDisableEnableBtns,
      isScreen,
      setScreenActive,
      isWebcam,
      setWebcamActive,
      cameraStreams,
      screenStreams
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
      handleDisableEnableBtns,
      isScreen,
      setScreenActive,
      isWebcam,
      setWebcamActive,
      cameraStreams,
      screenStreams
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
      handleDisableEnableBtns,
      isScreen,
      setScreenActive,
      isWebcam,
      setWebcamActive,
      cameraStreams,
      screenStreams
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
        roomName: roomName.current,
        socket: socket,
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

  // Reenable buttons
  handleDisableEnableBtns(false);
};

export default onNewProducer;
