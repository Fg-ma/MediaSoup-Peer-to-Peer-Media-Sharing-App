import React from "react";
import { Root, createRoot } from "react-dom/client";
import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import getBrowserMedia from "../getBrowserMedia";
import Bundle from "../bundle/Bundle";

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
  cameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>,
  cameraCount: React.MutableRefObject<number>,
  screenStreams: React.MutableRefObject<{
    [screenId: string]: MediaStream;
  }>,
  screenCount: React.MutableRefObject<number>,
  audioStream: React.MutableRefObject<MediaStream | undefined>,
  handleDisableEnableBtns: (disabled: boolean) => void,
  remoteVideosContainerRef: React.RefObject<HTMLDivElement>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  muteAudio: () => void,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  setWebcamActive: React.Dispatch<React.SetStateAction<boolean>>
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
          ? `${username.current}_camera_stream_${cameraCount.current}`
          : appData.producerType === "screen"
          ? `${username.current}_screen_stream_${screenCount.current}`
          : undefined,
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
        if (remoteVideosContainerRef.current) {
          const bundleContainer = document.createElement("div");
          bundleContainer.id = `${username.current}_bundle`;
          remoteVideosContainerRef.current.append(bundleContainer);

          const root = createRoot(bundleContainer);
          root.render(
            React.createElement(Bundle, {
              username: username.current,
              roomName: roomName.current,
              socket: socket,
              cameraStreams:
                isWebcam.current && cameraStreams.current
                  ? cameraStreams.current
                  : undefined,
              screenStreams:
                isScreen.current && screenStreams.current
                  ? screenStreams.current
                  : undefined,
              audioStream:
                isAudio.current && audioStream.current
                  ? audioStream.current
                  : undefined,
              isAudio: false,
              isUser: true,
              muteButtonCallback: muteAudio,
            })
          );
        }

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
        cameraStreams.current[
          `${username.current}_camera_stream_${cameraCount.current}`
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
        cameraStreams,
        screenStreams
      );
      if (cameraBrowserMedia) {
        cameraStreams.current[
          `${username.current}_camera_stream_${cameraCount.current}`
        ] = cameraBrowserMedia;
        const cameraTrack =
          cameraStreams.current[
            `${username.current}_camera_stream_${cameraCount.current}`
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
        cameraCount.current = cameraCount.current - 1;
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
        screenStreams.current[
          `${username.current}_screen_stream_${screenCount.current}`
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
        cameraStreams,
        screenStreams
      );
      if (screenBrowserMedia) {
        screenStreams.current[
          `${username.current}_screen_stream_${screenCount.current}`
        ] = screenBrowserMedia;
        const screenTrack =
          screenStreams.current[
            `${username.current}_screen_stream_${screenCount.current}`
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
        screenCount.current = screenCount.current - 1;
        const msg = {
          type: "deleteProducerTransport",
          roomName: roomName.current,
          username: username.current,
        };
        socket.current.emit("message", msg);
      }
    }
    if (isAudio.current) {
      if (audioStream.current) {
        return;
      }
      audioStream.current = await getBrowserMedia(
        "audio",
        device,
        handleDisableEnableBtns,
        isScreen,
        setScreenActive,
        isWebcam,
        setWebcamActive,
        cameraStreams,
        screenStreams
      );
      if (audioStream.current) {
        const audioTrack = audioStream.current.getAudioTracks()[0];
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
