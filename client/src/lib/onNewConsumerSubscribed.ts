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
  remoteTracksMap.current[event.producerUsername][
    event.consumerType as "webcam" | "screen" | "audio"
  ] = consumer.track;

  const stream = new MediaStream();
  stream.addTrack(consumer.track);

  if (
    event.consumerType === "webcam" &&
    remoteTracksMap.current[event.producerUsername].audio
  ) {
    const audioChild = document.getElementById(
      `audio_track_${event.producerUsername}`
    );
    if (audioChild) {
      remoteVideosContainerRef.current?.removeChild(audioChild);
    }

    const audioStream = new MediaStream();
    audioStream.addTrack(
      remoteTracksMap.current[event.producerUsername].audio!
    );

    const videoContainer = document.createElement("div");
    videoContainer.id = `live_video_audio_track_${event.producerUsername}`;
    remoteVideosContainerRef.current?.appendChild(videoContainer);

    const root = createRoot(videoContainer);
    root.render(
      React.createElement(FgVideo, {
        socket: socket,
        roomName: roomName,
        username: username,
        videoStream: stream,
        audioStream: audioStream,
        isStream: true,
        flipVideo: true,
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
  } else if (
    event.consumerType === "screen" &&
    remoteTracksMap.current[event.producerUsername].audio
  ) {
    const audioChild = document.getElementById(
      `audio_track_${event.producerUsername}`
    );
    if (audioChild) {
      remoteVideosContainerRef.current?.removeChild(audioChild);
    }

    const audioStream = new MediaStream();
    audioStream.addTrack(
      remoteTracksMap.current[event.producerUsername].audio!
    );

    const videoContainer = document.createElement("div");
    videoContainer.id = `screen_audio_track_${event.producerUsername}`;
    remoteVideosContainerRef.current?.appendChild(videoContainer);

    const root = createRoot(videoContainer);
    root.render(
      React.createElement(FgVideo, {
        socket: socket,
        roomName: roomName,
        username: username,
        videoStream: stream,
        audioStream: audioStream,
        isStream: true,
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
  } else if (
    event.consumerType === "audio" &&
    (remoteTracksMap.current[event.producerUsername].webcam ||
      remoteTracksMap.current[event.producerUsername].screen)
  ) {
    if (remoteTracksMap.current[event.producerUsername].webcam) {
      const liveVideoChild = document.getElementById(
        `live_video_track_${event.producerUsername}`
      );
      if (liveVideoChild) {
        remoteVideosContainerRef.current?.removeChild(liveVideoChild);
      }

      const cameraStream = new MediaStream();
      cameraStream.addTrack(
        remoteTracksMap.current[event.producerUsername].webcam!
      );

      const videoContainer = document.createElement("div");
      videoContainer.id = `live_video_audio_track_${event.producerUsername}`;
      remoteVideosContainerRef.current?.appendChild(videoContainer);

      const root = createRoot(videoContainer);
      root.render(
        React.createElement(FgVideo, {
          socket: socket,
          roomName: roomName,
          username: username,
          videoStream: cameraStream,
          audioStream: stream,
          isStream: true,
          flipVideo: true,
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
    }
    if (remoteTracksMap.current[event.producerUsername].screen) {
      const screenChild = document.getElementById(
        `screen_track_${event.producerUsername}`
      );
      if (screenChild) {
        remoteVideosContainerRef.current?.removeChild(screenChild);
      }

      const screenStream = new MediaStream();
      screenStream.addTrack(
        remoteTracksMap.current[event.producerUsername].screen!
      );

      const videoContainer = document.createElement("div");
      videoContainer.id = `screen_audio_track_${event.producerUsername}`;
      remoteVideosContainerRef.current?.appendChild(videoContainer);

      const root = createRoot(videoContainer);
      root.render(
        React.createElement(FgVideo, {
          socket: socket,
          roomName: roomName,
          username: username,
          videoStream: screenStream,
          audioStream: stream,
          isStream: true,
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
    }
  } else {
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

    const root = createRoot(videoContainer);
    root.render(
      React.createElement(FgVideo, {
        socket: socket,
        roomName: roomName,
        username: username,
        videoStream:
          event.consumerType === "webcam" || event.consumerType === "screen"
            ? stream
            : undefined,
        audioStream: event.consumerType === "audio" ? stream : undefined,
        isStream: true,
        flipVideo,
        isVolume:
          event.consumerType === "webcam" || event.consumerType === "screen"
            ? false
            : true,
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
  }

  const msg = {
    type: "resume",
    roomName: roomName.current,
    username: username.current,
  };
  socket.current.send(msg);
};

export default onNewConsumerSubscribed;
