import {
  UserStreamEffectsType,
  ImageEffectTypes,
} from "../../../context/effectsContext/typeConstant";

class LowerImageController {
  constructor(
    private imageId: string,
    private imageContainerRef: React.RefObject<HTMLDivElement>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private setImageEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>
  ) {}

  handleImageEffects = () => {
    this.setImageEffectsActive((prev) => !prev);
  };

  handleFullScreen = () => {
    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .then(() => {
          this.imageContainerRef.current?.classList.remove("full-screen");
        })
        .catch((error) => {
          console.error("Failed to exit full screen:", error);
        });
    } else {
      this.imageContainerRef.current
        ?.requestFullscreen()
        .then(() => {
          this.imageContainerRef.current?.classList.add("full-screen");
        })
        .catch((error) => {
          console.error("Failed to request full screen:", error);
        });
    }
  };

  handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      this.imageContainerRef.current?.classList.remove("full-screen");
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.imageContainerRef.current?.classList.contains("in-media") ||
      this.controlPressed.current ||
      this.shiftPressed.current
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input") return;

    switch (event.key.toLowerCase()) {
      case "shift":
        this.shiftPressed.current = true;
        break;
      case "control":
        this.controlPressed.current = true;
        break;
      case "f":
        this.handleFullScreen();
        break;
      case "e":
        this.handleImageEffects();
        break;
      default:
        break;
    }
  };

  handleKeyUp = (event: KeyboardEvent) => {
    if (!event.key) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case "shift":
        this.shiftPressed.current = false;
        break;
      case "control":
        this.controlPressed.current = false;
        break;
    }
  };

  handleImageEffect = async (
    effect: ImageEffectTypes,
    blockStateChange: boolean
  ) => {
    if (!blockStateChange) {
      this.userStreamEffects.current.image[this.imageId][effect] =
        !this.userStreamEffects.current.image[this.imageId][effect];
    }
  };
}

export default LowerImageController;
