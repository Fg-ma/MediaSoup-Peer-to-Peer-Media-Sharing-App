import * as mediasoup from "mediasoup-client";
import handleEffectWebGL from "./EffectsWebGL/handleEffectWebGL";
import handleEffectCPU from "./EffectsCPU/handleEffectCPU";
import { EffectTypes } from "../context/StreamsContext";

const handleEffect = async (
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
    return new Error(
      "No userStreamEffects, userStreamEffects.current, producerTransport, or producerTransport.current"
    );
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
  // Fill stream effects
  if (!blockStateChange) {
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
    const webGlEffect = await handleEffectWebGL(
      type,
      id,
      userUneffectedStreams,
      userStopStreamEffects,
      tintColor,
      effects
    );
    if (webGlEffect instanceof Error) {
      console.error(
        "Failed to render with WebGL defaulting to CPU render, which may effect performance!",
        webGlEffect
      );

      const cpuEffect = await handleEffectCPU(
        type,
        id,
        userUneffectedStreams,
        userStopStreamEffects,
        tintColor,
        effects
      );

      if (cpuEffect instanceof MediaStreamTrack) {
        finalTrack = cpuEffect;
      }
    } else {
      finalTrack = webGlEffect;
    }
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
      return new Error(`Transport failed to produce: ${error}`);
    }
  }
};

export default handleEffect;
