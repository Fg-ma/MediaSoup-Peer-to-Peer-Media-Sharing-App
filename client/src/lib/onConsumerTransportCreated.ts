import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import FgVideo from "../FgVideo/FgVideo";

const onConsumerTransportCreated = async (
  event: {
    type: "producerTransportCreated";
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
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      webcam?: MediaStreamTrack | undefined;
      screen?: MediaStreamTrack | undefined;
    };
  }>
) => {
  if (event.error) {
    console.error("On consumer transport create error: ", event.error);
  }

  if (!device.current) {
    console.error("No device found");
    return;
  }

  consumerTransport.current = device.current.createRecvTransport(event.params);

  consumerTransport.current.on(
    "connect",
    ({ dtlsParameters }, callback, errback) => {
      const msg = {
        type: "connectConsumerTransport",
        transportId: consumerTransport.current?.id,
        dtlsParameters,
        roomName: roomName.current,
        username: username.current,
      };

      socket.current.send(msg);
      socket.current.on("message", (event) => {
        if (event.type === "consumerTransportConnected") {
          callback();
        }
      });
    }
  );

  consumerTransport.current.on("connectionstatechange", async (state) => {
    switch (state) {
      case "connecting":
        break;
      case "connected":
        if (!remoteVideosContainerRef.current) {
          break;
        }
        const userVideo = document.getElementById(
          `live_video_track_${username.current}`
        );
        const userScreen = document.getElementById(
          `screen_track_${username.current}`
        );

        remoteVideosContainerRef.current.innerHTML = "";

        if (userVideo) {
          remoteVideosContainerRef.current.appendChild(userVideo);
        }
        if (userScreen) {
          remoteVideosContainerRef.current.appendChild(userScreen);
        }

        Object.entries(remoteTracksMap.current).forEach(
          ([trackUsername, tracks]) => {
            for (const [trackType, trackData] of Object.entries(tracks)) {
              const videoContainer = document.createElement("div");
              let flipVideo = false;
              if (trackType === "webcam") {
                videoContainer.id = `live_video_track_${trackUsername}`;
                flipVideo = true;
              } else if (trackType === "screen") {
                videoContainer.id = `screen_track_${trackUsername}`;
              }
              remoteVideosContainerRef.current?.appendChild(videoContainer);

              const stream = new MediaStream();
              stream.addTrack(trackData);

              const root = createRoot(videoContainer);
              root.render(
                React.createElement(FgVideo, {
                  stream,
                  flipVideo,
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
        );
        const msg = {
          type: "resume",
          roomName: roomName.current,
          username: username.current,
        };
        socket.current.send(msg);
        break;
      case "failed":
        consumerTransport.current?.close();
        break;
      default:
        break;
    }
  });

  const { rtpCapabilities } = device.current;
  const msg = {
    type: "consume",
    rtpCapabilities: rtpCapabilities,
    roomName: roomName.current,
    username: username.current,
  };
  socket.current.send(msg);
};

export default onConsumerTransportCreated;
