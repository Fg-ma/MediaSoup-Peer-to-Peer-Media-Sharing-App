import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import FgVideo from "../FgVideo/FgVideo";

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
  remoteTracksMap.current[event.producerUsername][
    event.consumerType as "webcam" | "screen" | "audio"
  ] = consumer.track;

  // Create a new video element
  const videoContainer = document.createElement("div");
  let flipVideo = false;
  if (event.consumerType === "webcam") {
    videoContainer.id = `live_video_track_${event.producerUsername}`;
    flipVideo = true;
  } else if (event.consumerType === "screen") {
    videoContainer.id = `screen_track_${event.producerUsername}`;
  } else if (event.consumerType === "audio") {
    videoContainer.id = `audio_track_${event.producerUsername}`;
  }
  remoteVideosContainerRef.current?.appendChild(videoContainer);

  // Set the track as the srcObject of the new video element
  const stream = new MediaStream();
  stream.addTrack(consumer.track);

  const root = createRoot(videoContainer);
  root.render(
    React.createElement(FgVideo, {
      videoStream:
        event.consumerType === "webcam" || event.consumerType === "screen"
          ? stream
          : undefined,
      audioStream: event.consumerType === "audio" ? stream : undefined,
      isStream: true,
      flipVideo,
      isPlayPause: false,
      isTotalTime: false,
      isPlaybackSpeed: false,
      isClosedCaptions: false,
      isTheater: false,
      isTimeLine: false,
      isSkip: false,
      isThumbnail: false,
      isPreview: false,
    })
  );

  const msg = {
    type: "resume",
    roomName: roomName.current,
    username: username.current,
  };
  socket.current.send(msg);
};

export default onNewConsumerSubscribed;
