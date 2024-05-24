import React from "react";
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
  const oldBundle = document.getElementById(`${event.producerUsername}_bundle`);
  const oldAudioStream = document.getElementById(
    `${event.producerUsername}_audio_stream`
  );
  const oldBundleContainer = document.getElementById(
    `${event.producerUsername}_bundle_container`
  );
  if (oldBundle && remoteVideosContainerRef.current?.contains(oldBundle)) {
    remoteVideosContainerRef.current?.removeChild(oldBundle);
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
  }

  if (remoteVideosContainerRef.current) {
    let remoteCameraStreams: { [webcamId: string]: MediaStream } = {};
    if (remoteTracksMap.current[event.producerUsername]?.webcam) {
      for (const key in remoteTracksMap.current[event.producerUsername]
        .webcam) {
        const remoteCameraStream = new MediaStream();
        remoteCameraStream.addTrack(
          remoteTracksMap.current[event.producerUsername].webcam![key]
        );
        remoteCameraStreams[key] = remoteCameraStream;
      }
    }

    let remoteScreenStreams: { [screenId: string]: MediaStream } = {};
    if (remoteTracksMap.current[event.producerUsername]?.screen) {
      for (const key in remoteTracksMap.current[event.producerUsername]
        .screen) {
        const remoteScreenStream = new MediaStream();
        remoteScreenStream.addTrack(
          remoteTracksMap.current[event.producerUsername].screen![key]
        );
        remoteScreenStreams[key] = remoteScreenStream;
      }
    }

    let remoteAudioStream;
    if (remoteTracksMap.current[event.producerUsername]?.audio) {
      remoteAudioStream = new MediaStream();
      remoteAudioStream.addTrack(
        remoteTracksMap.current[event.producerUsername].audio!
      );
    }

    if (
      (event.producerUsername === username.current &&
        (Object.keys(cameraStreams.current).length !== 0 ||
          Object.keys(screenStreams.current).length !== 0 ||
          audioStream.current)) ||
      Object.keys(remoteCameraStreams).length !== 0 ||
      Object.keys(remoteScreenStreams).length !== 0 ||
      remoteAudioStream
    ) {
      const bundle = document.createElement("div");
      bundle.id = `${event.producerUsername}_bundle`;
      remoteVideosContainerRef.current.append(bundle);

      const root = createRoot(bundle);
      root.render(
        React.createElement(Bundle, {
          username: event.producerUsername,
          cameraStreams:
            event.producerUsername === username.current
              ? cameraStreams.current
                ? cameraStreams.current
                : undefined
              : remoteCameraStreams
              ? remoteCameraStreams
              : undefined,
          screenStreams:
            event.producerUsername === username.current
              ? screenStreams.current
                ? screenStreams.current
                : undefined
              : remoteScreenStreams
              ? remoteScreenStreams
              : undefined,
          audioStream:
            event.producerUsername === username.current
              ? audioStream.current
              : remoteAudioStream
              ? remoteAudioStream
              : undefined,
          isUser: event.producerUsername === username.current,
          muteButtonCallback:
            event.producerUsername === username.current ? muteAudio : undefined,
          onRendered: () => {
            // Add mute to new bundle container if the old bundle container contained it
            if (oldBundleContainer?.classList.contains("mute")) {
              const newBundleContainer = document.getElementById(
                `${username.current}_bundle_container`
              );

              newBundleContainer?.classList.add("mute");
            }

            // Add mute-lock to new bundle container if the old bundle container contained it
            if (oldBundleContainer?.classList.contains("mute-lock")) {
              const newBundleContainer = document.getElementById(
                `${event.producerUsername}_bundle_container`
              );

              newBundleContainer?.classList.add("mute-lock");
            }

            // Set the volume of the new audio element to that of the old
            if (oldAudioStream instanceof HTMLAudioElement) {
              const newAudioStream = document.getElementById(
                `${event.producerUsername}_audio_stream`
              );
              if (newAudioStream instanceof HTMLAudioElement) {
                newAudioStream.volume = oldAudioStream.volume;
              }
            }
          },
        })
      );
    }
  }

  if (
    !cameraStreams.current &&
    !screenStreams.current &&
    !audioStream.current
  ) {
    producerTransport.current = undefined;
  }
  if (!remoteTracksMap.current[event.producerUsername]) {
    delete remoteTracksMap.current[event.producerUsername];
  }
  if (Object.keys(cameraStreams.current).length !== 0) {
    isWebcam.current = true;
    setWebcamActive(true);
  }
  if (Object.keys(screenStreams.current).length !== 0) {
    isScreen.current = true;
    setScreenActive(true);
  }
  if (event.producerUsername === username.current) {
    handleDisableEnableBtns(false);
  }
};

export default onProducerDisconnected;
