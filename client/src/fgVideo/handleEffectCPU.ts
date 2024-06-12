import * as mediasoup from "mediasoup-client";
import { EffectTypes } from "src/context/StreamsContext";
import { applyBoxBlur, applyTint } from "./effects";

const EffectSectionCPU = async (
  effect: EffectTypes,
  type: "webcam" | "screen" | "audio",
  id: string,
  userStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  userUneffectedStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      webcam?:
        | {
            [webcamId: string]: boolean;
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
    webcam: {
      [webcamId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
  }>,
  producerTransport:
    | React.MutableRefObject<
        mediasoup.types.Transport<mediasoup.types.AppData> | undefined
      >
    | undefined,
  tintColor: React.MutableRefObject<string>,
  blockStateChange: boolean = false
) => {
  if (
    !userStreamEffects ||
    !userStreamEffects.current ||
    !producerTransport ||
    !producerTransport.current
  ) {
    return;
  }

  // Set uneffected screen if necesary
  let activeEffect = false;
  for (const effect in userStreamEffects.current) {
    const effectType = effect as keyof typeof userStreamEffects.current;
    for (const kind in userStreamEffects.current[effectType]) {
      const kindType = kind as "webcam" | "screen" | "audio";
      if (type === kindType) {
        if (kindType === "webcam" || kindType === "screen") {
          for (const kindId in userStreamEffects.current[effectType][
            kindType
          ]) {
            if (kindId === id) {
              if (userStreamEffects.current[effectType][kindType]![id]) {
                activeEffect = true;
              }
            }
          }
        } else if (kindType === "audio") {
          if (userStreamEffects.current[effectType][kindType]!) {
            activeEffect = true;
          }
        }
      }
    }
  }
  if (!activeEffect) {
    if (type === "webcam" || type === "screen") {
      userUneffectedStreams.current[type][id] = userStreams.current[type][id];
    } else if (type === "audio") {
      userUneffectedStreams.current[type] = userStreams.current[type];
    }
  }

  // Create empty stream effects
  if (!userStreamEffects.current[effect][type]) {
    if (type === "webcam" || type === "screen") {
      userStreamEffects.current[effect][type] = {};
    } else if (type === "audio") {
      userStreamEffects.current[effect][type] = false;
    }
  }
  if (
    (type === "webcam" || type === "screen") &&
    !userStreamEffects.current[effect][type]
  ) {
    userStreamEffects.current[effect][type]![id] = false;
  }
  if (!blockStateChange) {
    // Fill stream effects
    if (type === "webcam" || type === "screen") {
      userStreamEffects.current[effect][type]![id] =
        !userStreamEffects.current[effect][type]![id];
    } else if (type === "audio") {
      userStreamEffects.current[effect][type] =
        !userStreamEffects.current[effect][type];
    }
  }

  // Stop old effect streams
  for (const kind in userStopStreamEffects.current) {
    const kindType = kind as "webcam" | "screen" | "audio";
    if (type === kindType) {
      if (kindType === "webcam" || kindType === "screen") {
        for (const kindId in userStopStreamEffects.current[kindType]) {
          if (kindId === id) {
            userStopStreamEffects.current[kindType][id]();
          }
        }
      } else if (kindType === "audio") {
        userStopStreamEffects.current[kindType]!();
      }
    }
  }

  // Set user streams
  let effects: { [effect in EffectTypes]?: boolean } = {};

  for (const effect in userStreamEffects.current) {
    const effectType = effect as keyof typeof userStreamEffects.current;
    for (const kind in userStreamEffects.current[effectType]) {
      const kindType = kind as "webcam" | "screen";
      for (const kindId in userStreamEffects.current[effectType][kindType]) {
        if (kindId === id) {
          if (userStreamEffects.current[effectType][kindType]![id]) {
            effects[effectType] = true;
          }
        }
      }
    }
  }

  let finalTrack: MediaStreamTrack | undefined;
  if (Object.keys(effects).length !== 0) {
    // Create a video element to play the track
    const video = document.createElement("video");
    video.srcObject = new MediaStream([
      type === "webcam" || type === "screen"
        ? userUneffectedStreams.current[type][id].getVideoTracks()[0]
        : userUneffectedStreams.current[type]!.getVideoTracks()[0],
    ]);
    video.play();

    // Create a canvas to draw the video frames
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      return;
    }

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth / 4;
      canvas.height = video.videoHeight / 4;
    };

    let isRunning = true;
    const frameRate = 60;
    const intervalId = setInterval(() => {
      if (!isRunning) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if (effects.blur) {
        applyBoxBlur(ctx, canvas);
      }
      if (effects.tint) {
        applyTint(ctx, canvas, hexToRgb(tintColor.current));
      }
    }, 1000 / frameRate);

    const stop = () => {
      isRunning = false;
      clearInterval(intervalId);
      video.pause();
      video.srcObject = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    if (type === "webcam" || type === "screen") {
      userStopStreamEffects.current[type][id] = stop;
    } else if (type === "audio") {
      userStopStreamEffects.current[type] = stop;
    }

    finalTrack = canvas.captureStream().getVideoTracks()[0];
  }

  if (type === "webcam" || type === "screen") {
    if (finalTrack) {
      userStreams.current[type][id] = new MediaStream([finalTrack]);
    } else if (userUneffectedStreams.current[type][id]) {
      userStreams.current[type][id] = userUneffectedStreams.current[type][id];
      delete userUneffectedStreams.current[type][id];
    }
  } else if (type === "audio") {
    if (finalTrack) {
      userStreams.current[type] = new MediaStream([finalTrack]);
    } else if (userUneffectedStreams.current[type]) {
      userStreams.current[type] = userUneffectedStreams.current[type];
      delete userUneffectedStreams.current[type];
    }
  }

  finalTrack = finalTrack
    ? finalTrack
    : type === "webcam" || type === "screen"
    ? userStreams.current[type][id].getTracks()[0]
    : type === "audio"
    ? userStreams.current[type]?.getTracks()[0]
    : undefined;

  if (finalTrack) {
    const params = {
      track: finalTrack,
      appData: {
        producerType: type,
        producerDirection: "swap",
        producerId: id,
      },
    };

    try {
      await producerTransport.current.produce(params);
    } catch (error) {
      console.error("Transport failed to produce: ", error);
      return;
    }
  }
};

function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, "");

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
}

export default EffectSectionCPU;
