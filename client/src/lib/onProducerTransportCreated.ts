import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import getBrowserMedia from "../getBrowserMedia";
import { Socket } from "socket.io-client";
import FgVideo from "../FgVideo/FgVideo";

const onProducerTransportCreated = async (
  event: {
    type: string;
    params: {
      id: string;
      iceParameters: mediasoup.types.IceParameters;
      iceCandidates: mediasoup.types.IceCandidate[];
      dtlsParameters: mediasoup.types.DtlsParameters;
    };
    error?: unknown;
  },
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
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
  >
) => {
  if (event.error) {
    console.error("Producer transport create error: ", event.error);
    return;
  }

  if (!device.current) {
    console.error("No device found");
    return;
  }

  producerTransport.current = device.current.createSendTransport(event.params);
  producerTransport.current.on(
    "connect",
    async ({ dtlsParameters }, callback, errback) => {
      const msg = {
        type: "connectProducerTransport",
        dtlsParameters,
        roomName: roomName.current,
        username: username.current,
      };

      socket.current.send(msg);
      socket.current.on("message", (event) => {
        if (event.type === "producerConnected") {
          callback();
        }
      });
    }
  );

  // begin transport on producer
  producerTransport.current.on("produce", async (params, callback, errback) => {
    const { kind, rtpParameters, appData } = params;

    const msg = {
      type: "createNewProducer",
      producerType: appData.producerType,
      transportId: producerTransport.current?.id,
      kind,
      rtpParameters,
      roomName: roomName.current,
      username: username.current,
    };
    socket.current.emit("message", msg);
    socket.current.once("newProducerCreated", (res: { id: string }) => {
      callback(res);
    });
    return;
  });
  // end transport producer

  // connection state change begin
  producerTransport.current.on("connectionstatechange", (state) => {
    switch (state) {
      case "connecting":
        break;
      case "connected":
        if (isWebcam.current && cameraStream.current) {
          webcamBtnRef.current!.disabled = false;
          screenBtnRef.current!.disabled = false;
          audioBtnRef.current!.disabled = false;

          if (isAudio.current && audioStream.current) {
            const audioChild = document.getElementById(
              `audio_track_${username.current}`
            );
            if (audioChild) {
              remoteVideosContainerRef.current?.removeChild(audioChild);
            }

            const videoContainer = document.createElement("div");
            videoContainer.id = `live_video_track_${username.current}`;
            remoteVideosContainerRef.current?.appendChild(videoContainer);

            const root = createRoot(videoContainer);
            root.render(
              React.createElement(FgVideo, {
                videoStream: cameraStream.current,
                audioStream: audioStream.current,
                isStream: true,
                muted: true,
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
          } else {
            const videoContainer = document.createElement("div");
            videoContainer.id = `live_video_track_${username.current}`;
            remoteVideosContainerRef.current?.appendChild(videoContainer);

            const root = createRoot(videoContainer);
            root.render(
              React.createElement(FgVideo, {
                videoStream: cameraStream.current,
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
        }
        if (isScreen.current && screenStream.current) {
          webcamBtnRef.current!.disabled = false;
          screenBtnRef.current!.disabled = false;
          audioBtnRef.current!.disabled = false;

          const videoContainer = document.createElement("div");
          videoContainer.id = `screen_track_${username.current}`;
          remoteVideosContainerRef.current?.appendChild(videoContainer);

          const root = createRoot(videoContainer);
          root.render(
            React.createElement(FgVideo, {
              videoStream: screenStream.current,
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
        if (isAudio.current && audioStream.current) {
          webcamBtnRef.current!.disabled = false;
          screenBtnRef.current!.disabled = false;
          audioBtnRef.current!.disabled = false;

          if (isWebcam.current && cameraStream.current) {
            const liveVideoChild = document.getElementById(
              `live_video_track_${username.current}`
            );
            if (liveVideoChild) {
              remoteVideosContainerRef.current?.removeChild(liveVideoChild);
            }

            const videoContainer = document.createElement("div");
            videoContainer.id = `live_video_track_${username.current}`;
            remoteVideosContainerRef.current?.appendChild(videoContainer);

            const root = createRoot(videoContainer);
            root.render(
              React.createElement(FgVideo, {
                videoStream: cameraStream.current,
                audioStream: audioStream.current,
                isStream: true,
                muted: true,
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
          } else {
            const videoContainer = document.createElement("div");
            videoContainer.id = `audio_track_${username.current}`;
            remoteVideosContainerRef.current?.appendChild(videoContainer);

            const root = createRoot(videoContainer);
            root.render(
              React.createElement(FgVideo, {
                audioStream: audioStream.current,
                isStream: true,
                muted: true,
                isPlayPause: false,
                isVolume: false,
                isTotalTime: false,
                isPlaybackSpeed: false,
                isClosedCaptions: false,
                isPictureInPicture: false,
                isTheater: false,
                isFullScreen: false,
                isTimeLine: false,
                isSkip: false,
                isThumbnail: false,
                isPreview: false,
              })
            );
          }
        }
        break;
      case "failed":
        producerTransport.current?.close();
        break;
      default:
        break;
    }
  });
  // connection state change end

  try {
    if (isWebcam.current) {
      if (cameraStream.current) {
        return;
      }
      cameraStream.current = await getBrowserMedia("webcam", device);
      if (cameraStream.current) {
        const cameraTrack = cameraStream.current.getVideoTracks()[0];
        const cameraParams = {
          track: cameraTrack,
          appData: {
            producerType: "webcam",
          },
        };
        await producerTransport.current.produce(cameraParams);
      }
    }
    if (isScreen.current) {
      if (screenStream.current) {
        return;
      }
      screenStream.current = await getBrowserMedia("screen", device);
      if (screenStream.current) {
        const screenTrack = screenStream.current.getVideoTracks()[0];
        const screenParams = {
          track: screenTrack,
          appData: {
            producerType: "screen",
          },
        };
        await producerTransport.current.produce(screenParams);
      }
    }
    if (isAudio.current) {
      if (audioStream.current) {
        return;
      }
      audioStream.current = await getBrowserMedia("audio", device);
      if (audioStream.current) {
        const audioTrack = audioStream.current.getAudioTracks()[0];
        const audioParams = {
          track: audioTrack,
          appData: {
            producerType: "audio",
          },
        };
        await producerTransport.current.produce(audioParams);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export default onProducerTransportCreated;
