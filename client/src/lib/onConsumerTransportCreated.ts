import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

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
  table_id: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  consumerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      camera?: { [cameraId: string]: MediaStreamTrack };
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
        table_id: table_id.current,
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
        Object.entries(remoteTracksMap.current).forEach(
          ([trackUsername, tracks]) => {
            let remoteCameraStreams: { [cameraId: string]: MediaStream } = {};
            if (remoteTracksMap.current[trackUsername]?.camera) {
              for (const key in remoteTracksMap.current[trackUsername].camera) {
                const remoteCameraStream = new MediaStream();
                remoteCameraStream.addTrack(
                  remoteTracksMap.current[trackUsername].camera![key]
                );
                remoteCameraStreams[key] = remoteCameraStream;
              }
            }

            let remoteScreenStreams: { [screenId: string]: MediaStream } = {};
            if (remoteTracksMap.current[trackUsername]?.screen) {
              for (const key in remoteTracksMap.current[trackUsername].screen) {
                const remoteScreenStream = new MediaStream();
                remoteScreenStream.addTrack(
                  remoteTracksMap.current[trackUsername].screen![key]
                );
                remoteScreenStreams[key] = remoteScreenStream;
              }
            }

            let remoteAudioStream: MediaStream | undefined = undefined;
            if (
              remoteTracksMap.current[trackUsername] &&
              remoteTracksMap.current[trackUsername].audio
            ) {
              remoteAudioStream = new MediaStream();
              remoteAudioStream.addTrack(
                remoteTracksMap.current[trackUsername].audio!
              );
            }

            createConsumerBundle(
              trackUsername,
              remoteCameraStreams,
              remoteScreenStreams,
              remoteAudioStream
            );
          }
        );
        const msg = {
          type: "resume",
          table_id: table_id.current,
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
    table_id: table_id.current,
    username: username.current,
  };
  socket.current.send(msg);
};

export default onConsumerTransportCreated;
