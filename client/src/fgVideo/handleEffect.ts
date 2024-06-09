import * as mediasoup from "mediasoup-client";
import { EffectTypes } from "src/context/StreamsContext";
import handleBlur from "./blur";

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
  userStreamEffects:
    | React.MutableRefObject<{
        [effectType in EffectTypes]: {
          webcam?:
            | {
                [webcamId: string]: {
                  active: boolean;
                  stopFunction: () => void;
                };
              }
            | undefined;
          screen?:
            | {
                [screenId: string]: {
                  active: boolean;
                  stopFunction: () => void;
                };
              }
            | undefined;
          audio?:
            | {
                active: boolean;
                stopFunction: () => void;
              }
            | undefined;
        };
      }>
    | undefined,
  producerTransport:
    | React.MutableRefObject<
        mediasoup.types.Transport<mediasoup.types.AppData> | undefined
      >
    | undefined
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
              if (userStreamEffects.current[effectType][kindType]![id].active) {
                activeEffect = true;
              }
            }
          }
        } else if (kindType === "audio") {
          if (userStreamEffects.current[effectType][kindType]!.active) {
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
      userStreamEffects.current[effect][type] = {
        active: false,
        stopFunction: () => {},
      };
    }
  }
  if (
    (type === "webcam" || type === "screen") &&
    !userStreamEffects.current[effect][type]![id]
  ) {
    userStreamEffects.current[effect][type]![id] = {
      active: false,
      stopFunction: () => {},
    };
  }
  // Fill stream effects
  if (type === "webcam" || type === "screen") {
    userStreamEffects.current[effect][type]![id].active =
      !userStreamEffects.current[effect][type]![id].active;
  } else if (type === "audio") {
    userStreamEffects.current[effect][type]!.active =
      !userStreamEffects.current[effect][type]!.active;
  }

  // Stop old effect streams
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
              userStreamEffects.current[effectType][kindType]![
                id
              ].stopFunction();
            }
          }
        } else if (kindType === "audio") {
          userStreamEffects.current[effectType][kindType]!.stopFunction();
        }
      }
    }
  }

  // Set user streams
  let finalTrack: MediaStreamTrack | undefined;

  for (const effect in userStreamEffects.current) {
    const effectType = effect as keyof typeof userStreamEffects.current;
    for (const kind in userStreamEffects.current[effectType]) {
      const kindType = kind as "webcam" | "screen";
      for (const kindId in userStreamEffects.current[effectType][kindType]) {
        if (kindId === id) {
          if (userStreamEffects.current[effectType][kindType]![id].active) {
            if (effectType === "blur") {
              const { blurredTrack, stop } = await handleBlur(
                finalTrack
                  ? finalTrack
                  : userUneffectedStreams.current[kindType][
                      kindId
                    ].getVideoTracks()[0]
              );
              finalTrack = blurredTrack;
              userStreamEffects.current[effectType][kindType]![
                id
              ].stopFunction = stop;
            }
          }
        }
      }
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
      console.error("Transport failed to produce: ", error);
      return;
    }
  }
};

export default handleEffect;
