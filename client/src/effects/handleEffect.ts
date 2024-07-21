import * as mediasoup from "mediasoup-client";
import handleEffectCPU from "./EffectsCPU/handleEffectCPU";
import { EffectTypes } from "../context/StreamsContext";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import CameraMedia from "../lib/CameraMedia";
import ScreenMedia from "../lib/ScreenMedia";

const handleEffect = async (
  effect: EffectTypes,
  type: "camera" | "screen" | "audio",
  id: string,
  userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: string | undefined;
  }>,
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
  tintColor: React.MutableRefObject<string>
) => {
  if (!userStreamEffects || !userStreamEffects.current) {
    return new Error("No userStreamEffects, userStreamEffects.current");
  }

  // Set user streams
  let effects: { [effect in EffectTypes]?: boolean } = {};

  for (const effect in userStreamEffects.current) {
    const effectType = effect as keyof typeof userStreamEffects.current;
    for (const kind in userStreamEffects.current[effectType]) {
      const kindType = kind as "camera" | "screen";
      for (const kindId in userStreamEffects.current[effectType][kindType]) {
        if (kindId === id) {
          if (userStreamEffects.current[effectType][kindType]![id]) {
            effects[effectType] = true;
          }
        }
      }
    }
  }

  if (type === "camera" || type === "screen") {
    await userMedia.current[type][id].changeEffects(effect, tintColor.current);
  }
};

export default handleEffect;
