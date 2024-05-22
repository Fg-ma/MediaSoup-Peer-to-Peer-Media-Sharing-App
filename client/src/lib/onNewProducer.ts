import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import getBrowserMedia from "../getBrowserMedia";
import FgVideo from "../FgVideo/FgVideo";

const onNewProducer = async (
  event: {
    type: string;
    producerType: "webcam" | "screen";
  },
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  socket: React.MutableRefObject<Socket>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  isWebcam: React.MutableRefObject<boolean>,
  isScreen: React.MutableRefObject<boolean>,
  isAudio: React.MutableRefObject<boolean>,
  cameraStream: React.MutableRefObject<MediaStream | undefined>,
  screenStream: React.MutableRefObject<MediaStream | undefined>,
  audioStream: React.MutableRefObject<MediaStream | undefined>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  audioBtnRef: React.RefObject<HTMLButtonElement>,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  muteAudio: () => void,
  mutedAudioRef: React.MutableRefObject<boolean>
) => {
  if (event.producerType === "webcam") {
    if (cameraStream.current) {
      console.error("Already existing camera stream for: ", username.current);
      return;
    }
    cameraStream.current = await getBrowserMedia(event.producerType, device);
    if (cameraStream.current) {
      webcamBtnRef.current!.disabled = false;
      screenBtnRef.current!.disabled = false;
      audioBtnRef.current!.disabled = false;

      const track = cameraStream.current.getVideoTracks()[0];
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

      if (isAudio.current && audioStream.current) {
        const audioChild = document.getElementById(
          `audio_track_${username.current}`
        );
        if (audioChild) {
          remoteVideosContainerRef.current?.removeChild(audioChild);
        }

        const videoContainer = document.createElement("div");
        videoContainer.id = `live_video_audio_track_${username.current}`;
        remoteVideosContainerRef.current?.appendChild(videoContainer);

        const root = createRoot(videoContainer);
        root.render(
          React.createElement(FgVideo, {
            socket: socket,
            roomName: roomName,
            username: username,
            videoStream: cameraStream.current,
            audioStream: audioStream.current,
            isStream: true,
            muted: true,
            flipVideo: true,
            isSlider: false,
            isPlayPause: false,
            isTotalTime: false,
            isPlaybackSpeed: false,
            isClosedCaptions: false,
            isTheater: false,
            isTimeLine: false,
            isSkip: false,
            isThumbnail: false,
            isPreview: false,
            muteButtonCallback: muteAudio,
            initialMute: mutedAudioRef.current,
          })
        );
      } else {
        const videoContainer = document.createElement("div");
        videoContainer.id = `live_video_track_${username.current}`;
        remoteVideosContainerRef.current?.appendChild(videoContainer);

        const root = createRoot(videoContainer);
        root.render(
          React.createElement(FgVideo, {
            socket: socket,
            roomName: roomName,
            username: username,
            videoStream: cameraStream.current,
            isStream: true,
            flipVideo: true,
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
  } else if (event.producerType === "screen") {
    if (screenStream.current) {
      console.error("Already existing screen stream for: ", username.current);
      return;
    }
    screenStream.current = await getBrowserMedia(event.producerType, device);
    if (screenStream.current) {
      webcamBtnRef.current!.disabled = false;
      screenBtnRef.current!.disabled = false;
      audioBtnRef.current!.disabled = false;

      const track = screenStream.current.getVideoTracks()[0];
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

      if (isAudio.current && audioStream.current) {
        const audioChild = document.getElementById(
          `audio_track_${username.current}`
        );
        if (audioChild) {
          remoteVideosContainerRef.current?.removeChild(audioChild);
        }

        const videoContainer = document.createElement("div");
        videoContainer.id = `screen_audio_track_${username.current}`;
        remoteVideosContainerRef.current?.appendChild(videoContainer);

        const root = createRoot(videoContainer);
        root.render(
          React.createElement(FgVideo, {
            socket: socket,
            roomName: roomName,
            username: username,
            videoStream: screenStream.current,
            audioStream: audioStream.current,
            isStream: true,
            muted: true,
            isSlider: false,
            isPlayPause: false,
            isTotalTime: false,
            isPlaybackSpeed: false,
            isClosedCaptions: false,
            isTheater: false,
            isTimeLine: false,
            isSkip: false,
            isThumbnail: false,
            isPreview: false,
            muteButtonCallback: muteAudio,
            initialMute: mutedAudioRef.current,
          })
        );
      } else {
        const videoContainer = document.createElement("div");
        videoContainer.id = `screen_track_${username.current}`;
        remoteVideosContainerRef.current?.appendChild(videoContainer);

        const root = createRoot(videoContainer);
        root.render(
          React.createElement(FgVideo, {
            socket: socket,
            roomName: roomName,
            username: username,
            videoStream: screenStream.current,
            isStream: true,
            isPlayPause: false,
            isTotalTime: false,
            isVolume: false,
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
  } else if (event.producerType === "audio") {
    if (audioStream.current) {
      console.error("Already existing audio stream for: ", username.current);
      return;
    }
    audioStream.current = await getBrowserMedia(event.producerType, device);
    if (audioStream.current) {
      webcamBtnRef.current!.disabled = false;
      screenBtnRef.current!.disabled = false;
      audioBtnRef.current!.disabled = false;

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

      if (isWebcam.current && cameraStream.current) {
        const liveVideoChild = document.getElementById(
          `live_video_track_${username.current}`
        );
        if (liveVideoChild) {
          remoteVideosContainerRef.current?.removeChild(liveVideoChild);
        }

        const videoContainer = document.createElement("div");
        videoContainer.id = `live_video_audio_track_${username.current}`;
        remoteVideosContainerRef.current?.appendChild(videoContainer);

        const root = createRoot(videoContainer);
        root.render(
          React.createElement(FgVideo, {
            socket: socket,
            roomName: roomName,
            username: username,
            videoStream: cameraStream.current,
            audioStream: audioStream.current,
            isStream: true,
            muted: true,
            flipVideo: true,
            isSlider: false,
            isPlayPause: false,
            isTotalTime: false,
            isPlaybackSpeed: false,
            isClosedCaptions: false,
            isTheater: false,
            isTimeLine: false,
            isSkip: false,
            isThumbnail: false,
            isPreview: false,
            muteButtonCallback: muteAudio,
            initialMute: mutedAudioRef.current,
          })
        );
      }
      if (isScreen.current && screenStream.current) {
        const screenChild = document.getElementById(
          `screen_track_${username.current}`
        );
        if (screenChild) {
          remoteVideosContainerRef.current?.removeChild(screenChild);
        }

        const videoContainer = document.createElement("div");
        videoContainer.id = `screen_audio_track_${username.current}`;
        remoteVideosContainerRef.current?.appendChild(videoContainer);

        const root = createRoot(videoContainer);
        root.render(
          React.createElement(FgVideo, {
            socket: socket,
            roomName: roomName,
            username: username,
            videoStream: screenStream.current,
            audioStream: audioStream.current,
            isStream: true,
            muted: true,
            isSlider: false,
            isPlayPause: false,
            isTotalTime: false,
            isPlaybackSpeed: false,
            isClosedCaptions: false,
            isTheater: false,
            isTimeLine: false,
            isSkip: false,
            isThumbnail: false,
            isPreview: false,
            muteButtonCallback: muteAudio,
            initialMute: mutedAudioRef.current,
          })
        );
      }
      if (
        !isWebcam.current &&
        !cameraStream.current &&
        !isScreen.current &&
        !screenStream.current
      ) {
        const videoContainer = document.createElement("div");
        videoContainer.id = `audio_track_${username.current}`;
        remoteVideosContainerRef.current?.appendChild(videoContainer);

        const root = createRoot(videoContainer);
        root.render(
          React.createElement(FgVideo, {
            socket: socket,
            roomName: roomName,
            username: username,
            audioStream: audioStream.current,
            isStream: true,
            muted: true,
            isPlayPause: false,
            isTotalTime: false,
            isPlaybackSpeed: false,
            isClosedCaptions: false,
            isTheater: false,
            isTimeLine: false,
            isSkip: false,
            isThumbnail: false,
            isPreview: false,
            muteButtonCallback: muteAudio,
            initialMute: mutedAudioRef.current,
          })
        );
      }
    }
  }
};

export default onNewProducer;
