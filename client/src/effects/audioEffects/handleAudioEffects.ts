import {
  CameraEffectTypes,
  ScreenEffectTypes,
  AudioEffectTypes,
} from "../../context/StreamsContext";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";

const handleAudioEffect = async (
  effect: AudioEffectTypes,
  blockStateChange: boolean,
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
  }>
) => {
  // Fill stream effects if state change isn't blocked
  if (!blockStateChange) {
    userStreamEffects.current.audio[effect as AudioEffectTypes] =
      !userStreamEffects.current.audio[effect as AudioEffectTypes];
  }

  if (userMedia.current.audio) {
    await userMedia.current.audio.changeEffects(effect, blockStateChange);
  }
};

export default handleAudioEffect;
