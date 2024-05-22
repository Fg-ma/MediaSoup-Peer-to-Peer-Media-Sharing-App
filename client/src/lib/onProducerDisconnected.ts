import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import FgVideo from "../FgVideo/FgVideo";

const onProducerDisconnected = (
  event: { type: string; producerUsername: string; producerType: string },
  socket: React.MutableRefObject<Socket>,
  roomName: React.MutableRefObject<string>,
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
  muteAudio: () => void,
  mutedAudioRef: React.MutableRefObject<boolean>
) => {
  if (event.producerType === "webcam") {
    const oldVideo = document.getElementById(
      `live_video_track_${event.producerUsername}`
    ) as HTMLVideoElement;
    if (oldVideo) {
      remoteVideosContainerRef.current?.removeChild(oldVideo);
    }
    const oldVideoAudio = document.getElementById(
      `live_video_audio_track_${event.producerUsername}`
    ) as HTMLVideoElement;
    if (oldVideoAudio) {
      remoteVideosContainerRef.current?.removeChild(oldVideoAudio);
    }

    if (event.producerUsername === username.current) {
      webcamBtnRef.current!.disabled = false;
      screenBtnRef.current!.disabled = false;
      audioBtnRef.current!.disabled = false;
      const tracks = cameraStream.current?.getTracks();

      tracks?.forEach((track) => {
        track.stop();
      });
      cameraStream.current = undefined;
    }

    if (
      remoteTracksMap.current[event.producerUsername] &&
      Object.keys(remoteTracksMap.current[event.producerUsername] || {})
        .length == 1
    ) {
      remoteTracksMap.current[event.producerUsername].webcam?.stop();
      delete remoteTracksMap.current[event.producerUsername];
    } else if (remoteTracksMap.current[event.producerUsername]) {
      remoteTracksMap.current[event.producerUsername].webcam?.stop();
      delete remoteTracksMap.current[event.producerUsername].webcam;
    }

    if (
      (event.producerUsername === username.current && audioStream.current) ||
      (remoteTracksMap.current[event.producerUsername] &&
        remoteTracksMap.current[event.producerUsername].audio)
    ) {
      const videoContainer = document.createElement("div");
      videoContainer.id = `audio_track_${event.producerUsername}`;
      remoteVideosContainerRef.current?.appendChild(videoContainer);

      const stream = new MediaStream();
      if (
        remoteTracksMap.current[event.producerUsername] &&
        remoteTracksMap.current[event.producerUsername].audio
      ) {
        stream.addTrack(remoteTracksMap.current[event.producerUsername].audio!);
      }

      const root = createRoot(videoContainer);
      root.render(
        React.createElement(FgVideo, {
          socket: socket,
          roomName: roomName,
          username: username,
          audioStream:
            remoteTracksMap.current[event.producerUsername] &&
            remoteTracksMap.current[event.producerUsername].audio
              ? stream
              : audioStream.current,
          isStream: true,
          muted: event.producerUsername === username.current ? true : false,
          isPlayPause: false,
          isTotalTime: false,
          isPlaybackSpeed: false,
          isClosedCaptions: false,
          isTheater: false,
          isTimeLine: false,
          isSkip: false,
          isThumbnail: false,
          isPreview: false,
          muteButtonCallback:
            event.producerUsername === username.current ? muteAudio : undefined,
          initialMute:
            event.producerUsername === username.current
              ? mutedAudioRef.current
              : false,
        })
      );
    }
  }

  if (event.producerType === "screen") {
    const oldScreen = document.getElementById(
      `screen_track_${event.producerUsername}`
    ) as HTMLVideoElement;
    if (oldScreen) {
      remoteVideosContainerRef.current?.removeChild(oldScreen);
    }
    const oldVideoAudio = document.getElementById(
      `screen_audio_track_${event.producerUsername}`
    ) as HTMLVideoElement;
    if (oldVideoAudio) {
      remoteVideosContainerRef.current?.removeChild(oldVideoAudio);
    }

    if (event.producerUsername === username.current) {
      webcamBtnRef.current!.disabled = false;
      screenBtnRef.current!.disabled = false;
      audioBtnRef.current!.disabled = false;
      const tracks = screenStream.current?.getTracks();

      tracks?.forEach((track) => {
        track.stop();
      });
      screenStream.current = undefined;
    }

    if (
      remoteTracksMap.current[event.producerUsername] &&
      Object.keys(remoteTracksMap.current[event.producerUsername] || {})
        .length == 1
    ) {
      remoteTracksMap.current[event.producerUsername].screen?.stop();
      delete remoteTracksMap.current[event.producerUsername];
    } else if (remoteTracksMap.current[event.producerUsername]) {
      remoteTracksMap.current[event.producerUsername].screen?.stop();
      delete remoteTracksMap.current[event.producerUsername].screen;
    }

    if (
      (event.producerUsername === username.current && audioStream.current) ||
      (remoteTracksMap.current[event.producerUsername] &&
        remoteTracksMap.current[event.producerUsername].audio)
    ) {
      const videoContainer = document.createElement("div");
      videoContainer.id = `audio_track_${event.producerUsername}`;
      remoteVideosContainerRef.current?.appendChild(videoContainer);

      const stream = new MediaStream();
      if (
        remoteTracksMap.current[event.producerUsername] &&
        remoteTracksMap.current[event.producerUsername].audio
      ) {
        stream.addTrack(remoteTracksMap.current[event.producerUsername].audio!);
      }

      const root = createRoot(videoContainer);
      root.render(
        React.createElement(FgVideo, {
          socket: socket,
          roomName: roomName,
          username: username,
          audioStream:
            remoteTracksMap.current[event.producerUsername] &&
            remoteTracksMap.current[event.producerUsername].audio
              ? stream
              : audioStream.current,
          isStream: true,
          muted: event.producerUsername === username.current ? true : false,
          isPlayPause: false,
          isTotalTime: false,
          isPlaybackSpeed: false,
          isClosedCaptions: false,
          isTheater: false,
          isTimeLine: false,
          isSkip: false,
          isThumbnail: false,
          isPreview: false,
          muteButtonCallback:
            event.producerUsername === username.current ? muteAudio : undefined,
          initialMute:
            event.producerUsername === username.current
              ? mutedAudioRef.current
              : false,
        })
      );
    }
  }

  if (event.producerType === "audio") {
    const oldAudio = document.getElementById(
      `audio_track_${event.producerUsername}`
    ) as HTMLVideoElement;
    if (oldAudio) {
      remoteVideosContainerRef.current?.removeChild(oldAudio);
    }
    const oldVideoAudio = document.getElementById(
      `live_video_audio_track_${event.producerUsername}`
    ) as HTMLVideoElement;
    if (oldVideoAudio) {
      remoteVideosContainerRef.current?.removeChild(oldVideoAudio);
    }
    const oldScreenAudio = document.getElementById(
      `screen_audio_track_${event.producerUsername}`
    ) as HTMLVideoElement;
    if (oldScreenAudio) {
      remoteVideosContainerRef.current?.removeChild(oldScreenAudio);
    }

    if (event.producerUsername === username.current) {
      webcamBtnRef.current!.disabled = false;
      screenBtnRef.current!.disabled = false;
      audioBtnRef.current!.disabled = false;
      const tracks = audioStream.current?.getTracks();

      tracks?.forEach((track) => {
        track.stop();
      });
      audioStream.current = undefined;
    }

    if (
      remoteTracksMap.current[event.producerUsername] &&
      Object.keys(remoteTracksMap.current[event.producerUsername] || {})
        .length == 1
    ) {
      remoteTracksMap.current[event.producerUsername].audio?.stop();
      delete remoteTracksMap.current[event.producerUsername];
    } else if (remoteTracksMap.current[event.producerUsername]) {
      remoteTracksMap.current[event.producerUsername].audio?.stop();
      delete remoteTracksMap.current[event.producerUsername].audio;
    }

    if (
      (event.producerUsername === username.current && cameraStream.current) ||
      (remoteTracksMap.current[event.producerUsername] &&
        remoteTracksMap.current[event.producerUsername].webcam)
    ) {
      const videoContainer = document.createElement("div");
      videoContainer.id = `live_video_track_${event.producerUsername}`;
      remoteVideosContainerRef.current?.appendChild(videoContainer);

      const stream = new MediaStream();
      if (
        remoteTracksMap.current[event.producerUsername] &&
        remoteTracksMap.current[event.producerUsername].webcam
      ) {
        stream.addTrack(
          remoteTracksMap.current[event.producerUsername].webcam!
        );
      }

      const root = createRoot(videoContainer);
      root.render(
        React.createElement(FgVideo, {
          socket: socket,
          roomName: roomName,
          username: username,
          videoStream:
            remoteTracksMap.current[event.producerUsername] &&
            remoteTracksMap.current[event.producerUsername].webcam
              ? stream
              : cameraStream.current,
          flipVideo: true,
          isStream: true,
          muted: event.producerUsername === username.current ? true : false,
          isSlider: false,
          isVolume: false,
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

    if (
      (event.producerUsername === username.current && screenStream.current) ||
      (remoteTracksMap.current[event.producerUsername] &&
        remoteTracksMap.current[event.producerUsername].screen)
    ) {
      const videoContainer = document.createElement("div");
      videoContainer.id = `screen_track_${event.producerUsername}`;
      remoteVideosContainerRef.current?.appendChild(videoContainer);

      const stream = new MediaStream();
      if (
        remoteTracksMap.current[event.producerUsername] &&
        remoteTracksMap.current[event.producerUsername].screen
      ) {
        stream.addTrack(
          remoteTracksMap.current[event.producerUsername].screen!
        );
      }

      const root = createRoot(videoContainer);
      root.render(
        React.createElement(FgVideo, {
          socket: socket,
          roomName: roomName,
          username: username,
          videoStream:
            remoteTracksMap.current[event.producerUsername] &&
            remoteTracksMap.current[event.producerUsername].screen
              ? stream
              : screenStream.current,
          isStream: true,
          muted: event.producerUsername === username.current ? true : false,
          isSlider: false,
          isVolume: false,
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
  }

  if (!cameraStream.current && !screenStream.current && !audioStream.current) {
    producerTransport.current = undefined;
  }
};

export default onProducerDisconnected;
