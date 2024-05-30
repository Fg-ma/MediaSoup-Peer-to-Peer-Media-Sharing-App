import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import Bundle from "../bundle/Bundle";

const onNewConsumerSubscribed = async (
  event: {
    type: string;
    producerUsername: string;
    consumerId?: string;
    consumerType: string;
    data: {
      producerId: string;
      id: string;
      kind: "audio" | "video" | "audio" | undefined;
      rtpParameters: mediasoup.types.RtpParameters;
      type: string;
      producerPaused: boolean;
    };
  },
  socket: React.MutableRefObject<Socket>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?: { [webcamId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack | undefined;
    };
  }>
) => {
  if (event.producerUsername === username.current) {
    return;
  }

  const { producerId, id, kind, rtpParameters } = event.data;
  const consumer = await consumerTransport.current?.consume({
    id,
    producerId,
    kind,
    rtpParameters,
  });

  if (!consumer) {
    console.error("Failed to create camera consumer!");
    return;
  }

  const oldBundle = document.getElementById(`${event.producerUsername}_bundle`);
  const oldBundleContainer = document.getElementById(
    `${event.producerUsername}_bundle_container`
  );
  const oldAudioStream = document.getElementById(
    `${event.producerUsername}_audio_stream`
  );
  if (oldBundle && remoteVideosContainerRef.current?.contains(oldBundle)) {
    remoteVideosContainerRef.current?.removeChild(oldBundle);
  }

  if (!remoteTracksMap.current[event.producerUsername]) {
    remoteTracksMap.current[event.producerUsername] = {};
  }
  if (event.consumerType === "webcam" || event.consumerType === "screen") {
    if (!remoteTracksMap.current[event.producerUsername][event.consumerType]) {
      remoteTracksMap.current[event.producerUsername][event.consumerType] = {};
    }
    if (event.consumerId) {
      remoteTracksMap.current[event.producerUsername][
        event.consumerType as "webcam" | "screen"
      ]![event.consumerId] = consumer.track;
    }
  } else {
    remoteTracksMap.current[event.producerUsername][
      event.consumerType as "audio"
    ] = consumer.track;
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
    if (
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].audio
    ) {
      remoteAudioStream = new MediaStream();
      remoteAudioStream.addTrack(
        remoteTracksMap.current[event.producerUsername].audio!
      );
    }

    const bundleContainer = document.createElement("div");
    bundleContainer.id = `${event.producerUsername}_bundle`;
    remoteVideosContainerRef.current.append(bundleContainer);

    const root = createRoot(bundleContainer);
    root.render(
      React.createElement(Bundle, {
        username: event.producerUsername,
        roomName: roomName.current,
        socket: socket,
        cameraStreams: remoteCameraStreams ? remoteCameraStreams : undefined,
        screenStreams: remoteScreenStreams ? remoteScreenStreams : undefined,
        audioStream: remoteAudioStream ? remoteAudioStream : undefined,
        onRendered: () => {
          // Add mute to new bundle container if the old bundle container contained it
          if (oldBundleContainer?.classList.contains("mute")) {
            const newBundleContainer = document.getElementById(
              `${event.producerUsername}_bundle_container`
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
          if (
            oldAudioStream instanceof HTMLAudioElement &&
            !oldAudioStream.muted
          ) {
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

  const msg = {
    type: "resume",
    roomName: roomName.current,
    username: username.current,
  };
  socket.current.send(msg);
};

export default onNewConsumerSubscribed;
