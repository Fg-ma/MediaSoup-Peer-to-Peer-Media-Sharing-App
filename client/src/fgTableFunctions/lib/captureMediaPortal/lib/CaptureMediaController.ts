import { CameraEffectTypes } from "../../../../context/effectsContext/typeConstant";
import CaptureMedia from "../../../../media/capture/CaptureMedia";

class CaptureMediaController {
  constructor(
    private streamEffects: React.MutableRefObject<{
      [effectType in CameraEffectTypes]: boolean;
    }>,
    private captureMedia: React.RefObject<CaptureMedia | undefined>,
    private tintColor: React.MutableRefObject<string>
  ) {}

  handleEffects = () => {};

  handleCaptureEffect = async (
    effect: CameraEffectTypes,
    blockStateChange: boolean
  ) => {
    if (!blockStateChange) {
      this.streamEffects.current[effect] = !this.streamEffects.current[effect];
    }

    this.captureMedia.current?.changeEffects(
      effect,
      this.tintColor.current,
      blockStateChange
    );
  };
}

export default CaptureMediaController;
