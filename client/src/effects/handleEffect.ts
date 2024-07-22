import { EffectTypes } from "../context/StreamsContext";
import CameraMedia from "../lib/CameraMedia";
import ScreenMedia from "../lib/ScreenMedia";

const handleEffect = async (
  effect: EffectTypes,
  blockStateChange: boolean,
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
  // Create empty stream effects
  if (!userStreamEffects.current[effect][type]) {
    if (type === "camera" || type === "screen") {
      userStreamEffects.current[effect][type] = {};
    } else if (type === "audio") {
      userStreamEffects.current[effect][type] = false;
    }
  }
  if (
    (type === "camera" || type === "screen") &&
    !userStreamEffects.current[effect][type]
  ) {
    userStreamEffects.current[effect][type]![id] = false;
  }
  // Fill stream effects
  if (!blockStateChange) {
    if (type === "camera" || type === "screen") {
      userStreamEffects.current[effect][type]![id] =
        !userStreamEffects.current[effect][type]![id];
    } else if (type === "audio") {
      userStreamEffects.current[effect][type] =
        !userStreamEffects.current[effect][type];
    }
  }

  if (type === "camera") {
    // || type === "screen") {
    await userMedia.current[type][id].changeEffects(effect, tintColor.current);
  }
};

export default handleEffect;
