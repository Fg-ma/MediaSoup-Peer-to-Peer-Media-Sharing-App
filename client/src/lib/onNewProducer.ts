import React from "react";
import { Socket } from "socket.io-client";
import * as mediasoup from "mediasoup-client";
import getBrowserMedia from "../getBrowserMedia";

const onNewProducer = async (
  event: {
    type: string;
    producerType: "camera" | "screen" | "audio";
  },
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  username: React.MutableRefObject<string>,
  table_id: React.MutableRefObject<string>,
  socket: React.MutableRefObject<Socket>,
  userStreams: React.MutableRefObject<{
    camera: {
      [cameraId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  userCameraCount: React.MutableRefObject<number>,
  userScreenCount: React.MutableRefObject<number>,
  isCamera: React.MutableRefObject<boolean>,
  isScreen: React.MutableRefObject<boolean>,
  handleDisableEnableBtns: (disabled: boolean) => void,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let producerId: string | undefined;
  if (event.producerType === "camera") {
    producerId = `${username.current}_camera_stream_${userCameraCount.current}`;
    if (
      userStreams.current.camera[
        `${username.current}_camera_stream_${userCameraCount.current}`
      ]
    ) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Already existing camera stream for: ", username.current);
      return;
    }

    const cameraBrowserMedia = await getBrowserMedia(
      event.producerType,
      device,
      handleDisableEnableBtns,
      isScreen,
      setScreenActive,
      isCamera,
      setCameraActive,
      userStreams
    );

    if (!cameraBrowserMedia) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Error getting camera data");
      return;
    }

    userStreams.current.camera[
      `${username.current}_camera_stream_${userCameraCount.current}`
    ] = cameraBrowserMedia;

    const track =
      userStreams.current.camera[
        `${username.current}_camera_stream_${userCameraCount.current}`
      ].getVideoTracks()[0];
    const params = {
      track: track,
      appData: {
        producerType: "camera",
      },
    };

    try {
      await producerTransport.current?.produce(params);
    } catch {
      console.error("Camera new transport failed to produce");
      return;
    }
  } else if (event.producerType === "screen") {
    producerId = `${username.current}_screen_stream_${userCameraCount.current}`;
    if (
      userStreams.current.screen[
        `${username.current}_screen_stream_${userScreenCount.current}`
      ]
    ) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Already existing screen stream for: ", username.current);
      return;
    }

    const screenBrowserMedia = await getBrowserMedia(
      event.producerType,
      device,
      handleDisableEnableBtns,
      isScreen,
      setScreenActive,
      isCamera,
      setCameraActive,
      userStreams
    );

    if (!screenBrowserMedia) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Error getting screen data");
      return;
    }

    userStreams.current.screen[
      `${username.current}_screen_stream_${userScreenCount.current}`
    ] = screenBrowserMedia;

    const track =
      userStreams.current.screen[
        `${username.current}_screen_stream_${userScreenCount.current}`
      ].getVideoTracks()[0];
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
  } else if (event.producerType === "audio") {
    if (userStreams.current.audio) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Already existing audio stream for: ", username.current);
      return;
    }

    userStreams.current.audio = await getBrowserMedia(
      event.producerType,
      device,
      handleDisableEnableBtns,
      isScreen,
      setScreenActive,
      isCamera,
      setCameraActive,
      userStreams
    );

    if (!userStreams.current.audio) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Error getting audio data");
      return;
    }

    const track = userStreams.current.audio.getAudioTracks()[0];
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
  }

  // Reenable buttons
  handleDisableEnableBtns(false);

  const msg = {
    type: "newProducerCreated",
    username: username.current,
    table_id: table_id.current,
    producerType: event.producerType,
    producerId: producerId,
  };

  socket.current.emit("message", msg);
};

export default onNewProducer;
