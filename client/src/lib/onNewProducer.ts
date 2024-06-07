import React from "react";
import { Socket } from "socket.io-client";
import * as mediasoup from "mediasoup-client";
import getBrowserMedia from "../getBrowserMedia";
import { handleBlur } from "../blur";

const onNewProducer = async (
  event: {
    type: string;
    producerType: "webcam" | "screen" | "audio";
  },
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  username: React.MutableRefObject<string>,
  table_id: React.MutableRefObject<string>,
  socket: React.MutableRefObject<Socket>,
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
  handleDisableEnableBtns: (disabled: boolean) => void,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  setWebcamActive: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (event.producerType === "webcam") {
    if (
      userCameraStreams.current[
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
      isWebcam,
      setWebcamActive,
      userCameraStreams,
      userScreenStreams
    );

    if (!cameraBrowserMedia) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Error getting camera data");
      return;
    }

    userCameraStreams.current[
      `${username.current}_camera_stream_${userCameraCount.current}`
    ] = cameraBrowserMedia;

    const track =
      userCameraStreams.current[
        `${username.current}_camera_stream_${userCameraCount.current}`
      ].getVideoTracks()[0];
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
  } else if (event.producerType === "screen") {
    if (
      userScreenStreams.current[
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
      isWebcam,
      setWebcamActive,
      userCameraStreams,
      userScreenStreams
    );

    if (!screenBrowserMedia) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Error getting screen data");
      return;
    }

    userScreenStreams.current[
      `${username.current}_screen_stream_${userScreenCount.current}`
    ] = screenBrowserMedia;

    const track =
      userScreenStreams.current[
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
    if (userAudioStream.current) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Already existing audio stream for: ", username.current);
      return;
    }

    userAudioStream.current = await getBrowserMedia(
      event.producerType,
      device,
      handleDisableEnableBtns,
      isScreen,
      setScreenActive,
      isWebcam,
      setWebcamActive,
      userCameraStreams,
      userScreenStreams
    );

    if (!userAudioStream.current) {
      // Reenable buttons
      handleDisableEnableBtns(false);

      console.error("Error getting audio data");
      return;
    }

    const track = userAudioStream.current.getAudioTracks()[0];
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
  };

  socket.current.emit("message", msg);
};

export default onNewProducer;
