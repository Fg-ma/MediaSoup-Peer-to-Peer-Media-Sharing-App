import { UserMediaType } from "src/context/mediaContext/typeConstant";
import {
  UserStreamEffectsType,
  ImageEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import ImageMedia from "../../ImageMedia";
import { downloadRecordingMimeMap, Settings } from "../typeConstant";

class LowerImageController {
  constructor(
    private imageId: string,
    private imageMedia: ImageMedia,
    private imageContainerRef: React.RefObject<HTMLDivElement>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private setImageEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private tintColor: React.MutableRefObject<string>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private settings: Settings,
    private recording: React.MutableRefObject<boolean>,
    private downloadRecordingReady: React.MutableRefObject<boolean>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
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
      case "d":
        this.handleDownload();
        break;
      case "u":
        this.handleSettings();
        break;
      case "h":
        this.handleDownloadRecording();
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

    this.userMedia.current.image[this.imageId].changeEffects(
      effect,
      this.tintColor.current,
      blockStateChange
    );
  };

  handleDownload = () => {
    if (this.settings.downloadType.value === "snapShot") {
      this.imageMedia.babylonScene?.downloadSnapShot();
    } else if (this.settings.downloadType.value === "original") {
      this.imageMedia.downloadImage();
    } else if (this.settings.downloadType.value === "record") {
      if (!this.recording.current) {
        this.imageMedia.babylonScene?.startRecording(
          downloadRecordingMimeMap[
            this.settings.downloadType.downloadTypeOptions.mimeType.value
          ],
          parseInt(
            this.settings.downloadType.downloadTypeOptions.fps.value.slice(
              0,
              -4
            )
          )
        );
        this.downloadRecordingReady.current = false;
      } else {
        this.imageMedia.babylonScene?.stopRecording();
        this.downloadRecordingReady.current = true;
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  handleDownloadRecording = () => {
    this.imageMedia.babylonScene?.downloadRecording();
  };

  handleSettings = () => {
    this.setSettingsActive((prev) => !prev);
  };
}

export default LowerImageController;
