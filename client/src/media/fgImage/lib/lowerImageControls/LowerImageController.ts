import { UserMediaType } from "../../../../context/mediaContext/typeConstant";
import {
  UserEffectsType,
  ImageEffectTypes,
  UserEffectsStylesType,
} from "../../../../../../universal/effectsTypeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
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
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private settings: Settings,
    private recording: React.MutableRefObject<boolean>,
    private downloadRecordingReady: React.MutableRefObject<boolean>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private setSettings: React.Dispatch<React.SetStateAction<Settings>>
  ) {}

  handleImageEffects = () => {
    this.setImageEffectsActive((prev) => !prev);
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
      case "b":
        this.handleSetAsBackground();
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
    effect: ImageEffectTypes | "clearAll",
    blockStateChange: boolean
  ) => {
    if (effect !== "clearAll") {
      if (!blockStateChange) {
        this.userEffects.current.image[this.imageId][effect] =
          !this.userEffects.current.image[this.imageId][effect];
      }

      this.userMedia.current.image[this.imageId].changeEffects(
        effect,
        this.tintColor.current,
        blockStateChange
      );

      this.tableStaticContentSocket.current?.updateContentEffects(
        "image",
        this.imageId,
        this.userEffects.current.image[this.imageId],
        this.userEffectsStyles.current.image[this.imageId]
      );
    } else {
      this.userMedia.current.image[this.imageId].clearAllEffects();

      this.tableStaticContentSocket.current?.updateContentEffects(
        "image",
        this.imageId,
        this.userEffects.current.image[this.imageId],
        this.userEffectsStyles.current.image[this.imageId]
      );
    }
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

  handleSetAsBackground = () => {
    this.setSettings((prev) => {
      const newSettings = { ...prev };

      if (newSettings.background.value === "true") {
        newSettings.background.value = "false";
      } else {
        newSettings.background.value = "true";
      }

      return newSettings;
    });
  };
}

export default LowerImageController;
