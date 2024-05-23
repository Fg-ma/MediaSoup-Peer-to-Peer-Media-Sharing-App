import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import Bundle from "../Bundle";

const onNewConsumerSubscribed = async (
  event: {
    type: string;
    producerUsername: string;
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
      webcam?: MediaStreamTrack | undefined;
      screen?: MediaStreamTrack | undefined;
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
  if (oldBundle) {
    remoteVideosContainerRef.current?.removeChild(oldBundle);
  }

  if (!remoteTracksMap.current[event.producerUsername]) {
    remoteTracksMap.current[event.producerUsername] = {};
  }
  remoteTracksMap.current[event.producerUsername][
    event.consumerType as "webcam" | "screen" | "audio"
  ] = consumer.track;

  if (remoteVideosContainerRef.current) {
    let cameraStream;
    if (
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].webcam
    ) {
      cameraStream = new MediaStream();
      cameraStream.addTrack(
        remoteTracksMap.current[event.producerUsername].webcam!
      );
    }

    let screenStream;
    if (
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].screen
    ) {
      screenStream = new MediaStream();
      screenStream.addTrack(
        remoteTracksMap.current[event.producerUsername].screen!
      );
    }

    let audioStream;
    if (
      remoteTracksMap.current[event.producerUsername] &&
      remoteTracksMap.current[event.producerUsername].audio
    ) {
      audioStream = new MediaStream();
      audioStream.addTrack(
        remoteTracksMap.current[event.producerUsername].audio!
      );
    }

    const bundleContainer = document.createElement("div");
    bundleContainer.id = `${event.producerUsername}_bundle`;
    remoteVideosContainerRef.current.append(bundleContainer);

    const root = createRoot(bundleContainer);
    root.render(
      React.createElement(Bundle, {
        cameraStream: cameraStream ? cameraStream : undefined,
        screenStream: screenStream ? screenStream : undefined,
        audioStream: audioStream ? audioStream : undefined,
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
