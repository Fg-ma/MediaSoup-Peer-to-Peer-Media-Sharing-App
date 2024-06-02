import React from "react";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import getBrowserMedia from "../getBrowserMedia";

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
  userCameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>,
  userCameraCount: React.MutableRefObject<number>,
  userScreenStreams: React.MutableRefObject<{
    [screenId: string]: MediaStream;
  }>,
  userScreenCount: React.MutableRefObject<number>,
  userAudioStream: React.MutableRefObject<MediaStream | undefined>,
  isWebcam: React.MutableRefObject<boolean>,
  isScreen: React.MutableRefObject<boolean>,
  isAudio: React.MutableRefObject<boolean>,
  handleDisableEnableBtns: (disabled: boolean) => void,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  muteAudio: () => void,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  setWebcamActive: React.Dispatch<React.SetStateAction<boolean>>,
  createProducerBundle: () => void
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
      producerId:
        appData.producerType === "webcam"
          ? `${username.current}_camera_stream_${userCameraCount.current}`
          : appData.producerType === "screen"
          ? `${username.current}_screen_stream_${userScreenCount.current}`
          : undefined,
    };
    socket.current.emit("message", msg);
    socket.current.once("newProducerCallback", (res: { id: string }) => {
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
        createProducerBundle();
        handleDisableEnableBtns(false);
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
      if (
        userCameraStreams.current[
          `${username.current}_camera_stream_${userCameraCount.current}`
        ]
      ) {
        return;
      }
      const cameraBrowserMedia = await getBrowserMedia(
        "webcam",
        device,
        handleDisableEnableBtns,
        isScreen,
        setScreenActive,
        isWebcam,
        setWebcamActive,
        userCameraStreams,
        userScreenStreams
      );

      if (cameraBrowserMedia) {
        userCameraStreams.current[
          `${username.current}_camera_stream_${userCameraCount.current}`
        ] = cameraBrowserMedia;
        const cameraTrack =
          userCameraStreams.current[
            `${username.current}_camera_stream_${userCameraCount.current}`
          ].getVideoTracks()[0];
        const cameraParams = {
          track: cameraTrack,
          appData: {
            producerType: "webcam",
          },
        };
        await producerTransport.current?.produce(cameraParams);
      } else {
        producerTransport.current = undefined;
        userCameraCount.current = userCameraCount.current - 1;
        const msg = {
          type: "deleteProducerTransport",
          roomName: roomName.current,
          username: username.current,
        };
        socket.current.emit("message", msg);
      }
    }
    if (isScreen.current) {
      if (
        userScreenStreams.current[
          `${username.current}_screen_stream_${userScreenCount.current}`
        ]
      ) {
        return;
      }

      const screenBrowserMedia = await getBrowserMedia(
        "screen",
        device,
        handleDisableEnableBtns,
        isScreen,
        setScreenActive,
        isWebcam,
        setWebcamActive,
        userCameraStreams,
        userScreenStreams
      );

      if (screenBrowserMedia) {
        userScreenStreams.current[
          `${username.current}_screen_stream_${userScreenCount.current}`
        ] = screenBrowserMedia;
        const screenTrack =
          userScreenStreams.current[
            `${username.current}_screen_stream_${userScreenCount.current}`
          ].getVideoTracks()[0];
        const screenParams = {
          track: screenTrack,
          appData: {
            producerType: "screen",
          },
        };
        await producerTransport.current?.produce(screenParams);
      } else {
        producerTransport.current = undefined;
        userScreenCount.current = userScreenCount.current - 1;
        const msg = {
          type: "deleteProducerTransport",
          roomName: roomName.current,
          username: username.current,
        };
        socket.current.emit("message", msg);
      }
    }
    if (isAudio.current) {
      if (userAudioStream.current) {
        console.error("Already existing audio stream for: ", username.current);
        return;
      }

      userAudioStream.current = await getBrowserMedia(
        "audio",
        device,
        handleDisableEnableBtns,
        isScreen,
        setScreenActive,
        isWebcam,
        setWebcamActive,
        userCameraStreams,
        userScreenStreams
      );

      if (userAudioStream.current) {
        const audioTrack = userAudioStream.current.getAudioTracks()[0];
        const audioParams = {
          track: audioTrack,
          appData: {
            producerType: "audio",
          },
        };
        await producerTransport.current?.produce(audioParams);
      } else {
        producerTransport.current = undefined;
        const msg = {
          type: "deleteProducerTransport",
          roomName: roomName.current,
          username: username.current,
        };
        socket.current.emit("message", msg);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export default onProducerTransportCreated;
