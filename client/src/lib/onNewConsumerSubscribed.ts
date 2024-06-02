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
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?: { [webcamId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack | undefined;
    };
  }>,
  createConsumerBundle: (
    trackUsername: string,
    remoteCameraStreams: {
      [screenId: string]: MediaStream;
    },
    remoteScreenStreams: {
      [screenId: string]: MediaStream;
    },
    remoteAudioStream: MediaStream | undefined
  ) => void
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
    remoteTracksMap.current[event.producerUsername].audio = consumer.track;
  }

  if (
    Object.keys(remoteTracksMap.current[event.producerUsername]).length === 1
  ) {
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

    let remoteAudioStream: MediaStream | undefined = undefined;
    if (
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].audio
    ) {
      remoteAudioStream = new MediaStream();
      remoteAudioStream.addTrack(
        remoteTracksMap.current[event.producerUsername].audio!
      );
    }

    createConsumerBundle(
      event.producerUsername,
      remoteCameraStreams,
      remoteScreenStreams,
      remoteAudioStream
    );
  }

  const msg = {
    type: "resume",
    roomName: roomName.current,
    username: username.current,
  };
  socket.current.send(msg);

  const message = {
    type: "newConsumerCreated",
    username: username.current,
    roomName: roomName.current,
    producerUsername: event.producerUsername,
    consumerId: event.consumerId,
    consumerType: event.consumerType,
  };

  socket.current.emit("message", message);
};

export default onNewConsumerSubscribed;
