import AudioMedia from "src/lib/AudioMedia";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  AudioEffectTypes,
} from "../context/StreamsContext";
import CameraMedia from "../lib/CameraMedia";
import ScreenMedia from "../lib/ScreenMedia";

const handleEffect = async (
  effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes,
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
    audio: AudioMedia | undefined;
  }>,
  userStreamEffects: React.MutableRefObject<{
    camera: {
      [cameraId: string]: { [effectType in CameraEffectTypes]: boolean };
    };
    screen: {
      [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
    };
    audio: { [effectType in AudioEffectTypes]: boolean };
  }>,
  tintColor: React.MutableRefObject<string>
) => {
  // Fill stream effects if state change isn't blocked
  if (!blockStateChange) {
    if (type === "camera") {
      userStreamEffects.current[type][id][effect as CameraEffectTypes] =
        !userStreamEffects.current[type][id][effect as CameraEffectTypes];
    } else if (type === "screen") {
      userStreamEffects.current[type][id][effect as ScreenEffectTypes] =
        !userStreamEffects.current[type][id][effect as ScreenEffectTypes];
    } else if (type === "audio") {
      userStreamEffects.current[type][effect as AudioEffectTypes] =
        !userStreamEffects.current[type][effect as AudioEffectTypes];
    }
  }

  if (type === "camera") {
    await userMedia.current[type][id].changeEffects(
      effect as CameraEffectTypes,
      tintColor.current,
      blockStateChange
    );
  } else if (type === "screen") {
    await userMedia.current[type][id].changeEffects(
      effect as ScreenEffectTypes,
      tintColor.current,
      blockStateChange
    );
  } else if (type === "audio") {
    userMedia.current[type]?.changeEffects(
      effect as AudioEffectTypes,
      blockStateChange
    );
  }
};

export default handleEffect;
