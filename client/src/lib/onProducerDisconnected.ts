import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import Bundle from "../bundle/Bundle";

const onProducerDisconnected = (
  event: { type: string; producerUsername: string; producerType: string },
  username: React.MutableRefObject<string>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  audioBtnRef: React.RefObject<HTMLButtonElement>,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  cameraStream: React.MutableRefObject<MediaStream | undefined>,
  screenStream: React.MutableRefObject<MediaStream | undefined>,
  audioStream: React.MutableRefObject<MediaStream | undefined>,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?: MediaStreamTrack | undefined;
      screen?: MediaStreamTrack | undefined;
      audio?: MediaStreamTrack | undefined;
    };
  }>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  muteAudio: () => void
) => {
  const oldBundle = document.getElementById(`${event.producerUsername}_bundle`);
  const oldAudioStream = document.getElementById(
    `${event.producerUsername}_audio_stream`
  );
  const oldBundleContainer = document.getElementById(
    `${event.producerUsername}_bundle_container`
  );
  if (oldBundle) {
    remoteVideosContainerRef.current?.removeChild(oldBundle);
  }

  if (event.producerUsername === username.current) {
    webcamBtnRef.current!.disabled = false;
    screenBtnRef.current!.disabled = false;
    audioBtnRef.current!.disabled = false;

    if (event.producerType === "webcam") {
      cameraStream.current?.getTracks().forEach((track) => track.stop());
      cameraStream.current = undefined;
    } else if (event.producerType === "screen") {
      screenStream.current?.getTracks().forEach((track) => track.stop());
      screenStream.current = undefined;
    } else if (event.producerType === "audio") {
      audioStream.current?.getTracks().forEach((track) => track.stop());
      audioStream.current = undefined;
    }
  } else {
    if (
      event.producerType === "webcam" &&
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].webcam
    ) {
      delete remoteTracksMap.current[event.producerUsername].webcam;
    } else if (
      event.producerType === "screen" &&
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].screen
    ) {
      delete remoteTracksMap.current[event.producerUsername].screen;
    } else if (
      event.producerType === "audio" &&
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].audio
    ) {
      delete remoteTracksMap.current[event.producerUsername].audio;
    }
  }

  if (remoteVideosContainerRef.current) {
    let remoteCameraStream;
    if (
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].webcam
    ) {
      remoteCameraStream = new MediaStream();
      remoteCameraStream.addTrack(
        remoteTracksMap.current[event.producerUsername].webcam!
      );
    }

    let remoteScreenStream;
    if (
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].screen
    ) {
      remoteScreenStream = new MediaStream();
      remoteScreenStream.addTrack(
        remoteTracksMap.current[event.producerUsername].screen!
      );
    }

    let remoteAudioStream;
    if (
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].audio
    ) {
      remoteAudioStream = new MediaStream();
      remoteAudioStream.addTrack(
        remoteTracksMap.current[event.producerUsername].audio!
      );
    }

    if (
      (event.producerUsername === username.current &&
        (cameraStream.current ||
          screenStream.current ||
          audioStream.current)) ||
      remoteCameraStream ||
      remoteScreenStream ||
      remoteAudioStream
    ) {
      const bundle = document.createElement("div");
      bundle.id = `${event.producerUsername}_bundle`;
      remoteVideosContainerRef.current.append(bundle);

      const root = createRoot(bundle);
      root.render(
        React.createElement(Bundle, {
          username: event.producerUsername,
          cameraStream:
            event.producerUsername === username.current
              ? cameraStream.current
              : remoteCameraStream
              ? remoteCameraStream
              : undefined,
          screenStream:
            event.producerUsername === username.current
              ? screenStream.current
              : remoteScreenStream
              ? remoteScreenStream
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

  if (!cameraStream.current && !screenStream.current && !audioStream.current) {
    producerTransport.current = undefined;
  }
  if (!remoteTracksMap.current[event.producerUsername]) {
    delete remoteTracksMap.current[event.producerUsername];
  }
};

export default onProducerDisconnected;
