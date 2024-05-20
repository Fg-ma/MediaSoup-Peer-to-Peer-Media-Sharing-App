import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import getBrowserMedia from "../getBrowserMedia";
import FgVideo from "../FgVideo/FgVideo";

const onNewProducer = async (
  event: {
    type: string;
    producerType: "webcam" | "screen";
  },
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  username: React.MutableRefObject<string>,
  cameraStream: React.MutableRefObject<MediaStream | undefined>,
  screenStream: React.MutableRefObject<MediaStream | undefined>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >
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

      const videoContainer = document.createElement("div");

      videoContainer.id = `live_video_track_${username.current}`;
      remoteVideosContainerRef.current?.appendChild(videoContainer);

      const root = createRoot(videoContainer);
      root.render(
        React.createElement(FgVideo, {
          stream: cameraStream.current,
          flipVideo: true,
          isPlayPause: false,
          isVolume: false,
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
  } else if (event.producerType === "screen") {
    if (screenStream.current) {
      console.error("Already existing screen stream for: ", username.current);
      return;
    }
    screenStream.current = await getBrowserMedia(event.producerType, device);
    if (screenStream.current) {
      webcamBtnRef.current!.disabled = false;
      screenBtnRef.current!.disabled = false;
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
        console.error("Camera new transport failed to produce");
        return;
      }

      const videoContainer = document.createElement("div");
      videoContainer.id = `screen_track_${username.current}`;
      remoteVideosContainerRef.current?.appendChild(videoContainer);

      const root = createRoot(videoContainer);
      root.render(
        React.createElement(FgVideo, {
          stream: screenStream.current,
          isPlayPause: false,
          isVolume: false,
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
};

export default onNewProducer;
