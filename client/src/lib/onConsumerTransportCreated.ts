import React from "react";
import { createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import Bundle from "../Bundle";

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
      audio?: MediaStreamTrack | undefined;
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
        const userBundle = document.getElementById(
          `${username.current}_bundle`
        );

        remoteVideosContainerRef.current.innerHTML = "";

        if (userBundle) {
          remoteVideosContainerRef.current.appendChild(userBundle);
        }

        Object.entries(remoteTracksMap.current).forEach(
          ([trackUsername, tracks]) => {
            const msg = {
              type: "requestMuteLock",
              roomName: roomName.current,
              username: username.current,
              producerUsername: trackUsername,
            };

            socket.current.emit("message", msg);

            if (remoteVideosContainerRef.current) {
              let cameraStream;
              if (
                remoteTracksMap.current[trackUsername] &&
                remoteTracksMap.current[trackUsername].webcam
              ) {
                cameraStream = new MediaStream();
                cameraStream.addTrack(
                  remoteTracksMap.current[trackUsername].webcam!
                );
              }

              let screenStream;
              if (
                remoteTracksMap.current[trackUsername] &&
                remoteTracksMap.current[trackUsername].screen
              ) {
                screenStream = new MediaStream();
                screenStream.addTrack(
                  remoteTracksMap.current[trackUsername].screen!
                );
              }

              let audioStream;
              if (
                remoteTracksMap.current[trackUsername] &&
                remoteTracksMap.current[trackUsername].audio
              ) {
                audioStream = new MediaStream();
                audioStream.addTrack(
                  remoteTracksMap.current[trackUsername].audio!
                );
              }

              const bundleContainer = document.createElement("div");
              bundleContainer.id = `${trackUsername}_bundle`;
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
