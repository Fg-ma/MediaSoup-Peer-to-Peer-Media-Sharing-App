import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../context/streamsContext/typeConstant";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";

const handleVisualEffect = async (
  effect: CameraEffectTypes | ScreenEffectTypes,
  blockStateChange: boolean,
  type: "camera" | "screen",
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
  }
};

export default handleVisualEffect;
