import React from "react";
import * as mediasoup from "mediasoup-client";
import { EffectTypes } from "../context/StreamsContext";

const onProducerDisconnected = (
  event: {
    type: string;
    producerUsername: string;
    producerType: string;
    producerId: string;
  },
  username: React.MutableRefObject<string>,
  userStreams: React.MutableRefObject<{
    camera: {
      [cameraId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  handleDisableEnableBtns: (disabled: boolean) => void,
  remoteTracksMap: React.MutableRefObject<{
    [username: string]: {
      camera?: { [cameraId: string]: MediaStreamTrack };
      screen?: { [screenId: string]: MediaStreamTrack };
      audio?: MediaStreamTrack | undefined;
    };
  }>,
  producerTransport: React.MutableRefObject<
    mediasoup.types.Transport<mediasoup.types.AppData> | undefined
  >,
  isCamera: React.MutableRefObject<boolean>,
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
  isScreen: React.MutableRefObject<boolean>,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  setBundles: React.Dispatch<
    React.SetStateAction<
      | {
          [username: string]: React.JSX.Element;
        }
      | undefined
    >
  >,
  userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      camera?:
        | {
            [cameraId: string]: boolean;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: boolean;
          }
        | undefined;
      audio?: boolean;
    };
  }>,
  userStopStreamEffects: React.MutableRefObject<{
    camera: {
      [cameraId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
  }>,
  userUneffectedStreams: React.MutableRefObject<{
    camera: {
      [cameraId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>
) => {
  if (event.producerUsername === username.current) {
    if (event.producerType === "camera") {
      userStreams.current.camera[event.producerId]
        ?.getTracks()
        .forEach((track) => track.stop());
      delete userStreams.current.camera[event.producerId];
      userUneffectedStreams.current.camera[event.producerId]
        ?.getTracks()
        .forEach((track) => track.stop());
      delete userUneffectedStreams.current.camera[event.producerId];
    } else if (event.producerType === "screen") {
      userStreams.current.screen[event.producerId]
        ?.getTracks()
        .forEach((track) => track.stop());
      delete userStreams.current.screen[event.producerId];
      userUneffectedStreams.current.screen[event.producerId]
        ?.getTracks()
        .forEach((track) => track.stop());
      delete userUneffectedStreams.current.screen[event.producerId];
    } else if (event.producerType === "audio") {
      userStreams.current.audio?.getTracks().forEach((track) => track.stop());
      userStreams.current.audio = undefined;
      userUneffectedStreams.current.audio
        ?.getTracks()
        .forEach((track) => track.stop());
      userUneffectedStreams.current.audio = undefined;
    }

    if (
      (event.producerType === "camera" || event.producerType === "screen") &&
      userStopStreamEffects.current[event.producerType] &&
      userStopStreamEffects.current[event.producerType]?.[event.producerId] &&
      typeof userStopStreamEffects.current[event.producerType]?.[
        event.producerId
      ] === "function"
    ) {
      userStopStreamEffects.current[event.producerType]?.[event.producerId]();
      delete userStopStreamEffects.current[event.producerType][
        event.producerId
      ];
    } else if (
      event.producerType === "audio" &&
      userStopStreamEffects.current[event.producerType] &&
      typeof userStopStreamEffects.current[event.producerType] === "function"
    ) {
      userStopStreamEffects.current[event.producerType]?.();
      delete userStopStreamEffects.current[event.producerType];
    }

    for (const effectType in userStreamEffects.current) {
      const typedEffectType =
        effectType as keyof typeof userStreamEffects.current;

      if (
        (event.producerType === "camera" || event.producerType === "screen") &&
        userStreamEffects.current[typedEffectType][event.producerType]?.[
          event.producerId
        ]
      ) {
        delete userStreamEffects.current[typedEffectType][event.producerType]?.[
          event.producerId
        ];
      } else if (
        event.producerType === "audio" &&
        userStreamEffects.current[typedEffectType][event.producerType]
      ) {
        delete userStreamEffects.current[typedEffectType][event.producerType];
      }
    }

    if (
      (!userStreams.current.camera ||
        Object.keys(userStreams.current.camera).length === 0) &&
      (!userStreams.current.screen ||
        Object.keys(userStreams.current.screen).length === 0) &&
      !userStreams.current.audio
    ) {
      setBundles((prev) => {
        const newBundles = prev;
        if (newBundles) {
          delete newBundles[event.producerUsername];
        }
        return newBundles;
      });
      producerTransport.current = undefined;
    }
    if (Object.keys(userStreams.current.camera).length === 0) {
      isCamera.current = false;
      setCameraActive(false);
    } else {
      isCamera.current = true;
      setCameraActive(true);
    }
    if (Object.keys(userStreams.current.screen).length === 0) {
      isScreen.current = false;
      setScreenActive(false);
    } else {
      isScreen.current = true;
      setScreenActive(true);
    }
    handleDisableEnableBtns(false);
  } else {
    if (event.producerType === "camera" || event.producerType === "screen") {
      delete remoteTracksMap.current[event.producerUsername]?.[
        event.producerType
      ]?.[event.producerId];
    } else if (event.producerType === "audio") {
      delete remoteTracksMap.current[event.producerUsername]?.[
        event.producerType
      ];
    }

    if (
      remoteTracksMap.current[event.producerUsername] &&
      Object.keys(remoteTracksMap.current[event.producerUsername]).length === 0
    ) {
      delete remoteTracksMap.current[event.producerUsername];
      setBundles((prev) => {
        const newBundles = prev;
        if (newBundles) {
          delete newBundles[event.producerUsername];
        }
        return newBundles;
      });
    }
  }
};

export default onProducerDisconnected;
