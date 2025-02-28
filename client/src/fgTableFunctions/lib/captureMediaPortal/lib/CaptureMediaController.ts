import { CameraEffectTypes } from "../../../../context/effectsContext/typeConstant";
import CaptureMedia from "../../../../media/capture/CaptureMedia";

class CaptureMediaController {
  constructor(
    private streamEffects: React.MutableRefObject<{
      [effectType in CameraEffectTypes]: boolean;
    }>,
    private captureMedia: React.RefObject<CaptureMedia | undefined>,
    private mediaContainerRef: React.RefObject<HTMLDivElement>,
    private setCaptureMediaEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setInCaptureMedia: React.Dispatch<React.SetStateAction<boolean>>,
    private leaveTimer: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private movementTimeout: React.MutableRefObject<NodeJS.Timeout | undefined>,
    private tintColor: React.MutableRefObject<string>
  ) {}

  handleEffects = () => {
    this.setCaptureMediaEffectsActive((prev) => !prev);
  };

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

  handlePointerMove = () => {
    this.setInCaptureMedia(true);

    if (this.mediaContainerRef.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    this.movementTimeout.current = setTimeout(() => {
      this.setInCaptureMedia(false);
    }, 3500);
  };

  handlePointerEnter = () => {
    this.setInCaptureMedia(true);

    this.mediaContainerRef.current?.addEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.leaveTimer.current) {
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }
  };

  handlePointerLeave = () => {
    this.mediaContainerRef.current?.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );

    if (this.mediaContainerRef.current) {
      clearTimeout(this.movementTimeout.current);
      this.movementTimeout.current = undefined;
    }

    this.leaveTimer.current = setTimeout(() => {
      this.setInCaptureMedia(false);
      clearTimeout(this.leaveTimer.current);
      this.leaveTimer.current = undefined;
    }, 1250);
  };
}

export default CaptureMediaController;
