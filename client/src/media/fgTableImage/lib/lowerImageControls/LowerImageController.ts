import {
  ImageEffectTypes,
  StaticContentEffectsType,
  StaticContentEffectsStylesType,
} from "../../../../../../universal/effectsTypeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { downloadRecordingMimeMap, Settings } from "../typeConstant";
import TableImageMediaInstance from "../../TableImageMediaInstance";

class LowerImageController {
  constructor(
    private imageInstanceId: string,
    private imageMediaInstance: TableImageMediaInstance,
    private imageContainerRef: React.RefObject<HTMLDivElement>,
    private setImageEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private tintColor: React.MutableRefObject<string>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private recording: React.MutableRefObject<boolean>,
    private downloadRecordingReady: React.MutableRefObject<boolean>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
  ) {}

  handleImageEffects = () => {
    this.setImageEffectsActive((prev) => !prev);
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.imageContainerRef.current?.classList.contains("in-media") ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") return;

    switch (event.key.toLowerCase()) {
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
      case "h":
        this.handleSync();
        break;
      default:
        break;
    }
  };

  handleImageEffect = async (
    effect: ImageEffectTypes | "clearAll",
    blockStateChange: boolean,
  ) => {
    if (effect !== "clearAll") {
      if (!blockStateChange) {
        this.staticContentEffects.current.image[this.imageInstanceId][effect] =
          !this.staticContentEffects.current.image[this.imageInstanceId][
            effect
          ];
      }

      this.imageMediaInstance.changeEffects(
        effect,
        this.tintColor.current,
        blockStateChange,
      );

      this.tableStaticContentSocket.current?.updateContentEffects(
        "image",
        this.imageMediaInstance.imageMedia.imageId,
        this.imageInstanceId,
        this.staticContentEffects.current.image[this.imageInstanceId],
        this.staticContentEffectsStyles.current.image[this.imageInstanceId],
      );
    } else {
      this.imageMediaInstance.clearAllEffects();

      this.tableStaticContentSocket.current?.updateContentEffects(
        "image",
        this.imageMediaInstance.imageMedia.imageId,
        this.imageInstanceId,
        this.staticContentEffects.current.image[this.imageInstanceId],
        this.staticContentEffectsStyles.current.image[this.imageInstanceId],
      );
    }
  };

  handleDownload = () => {
    if (this.imageMediaInstance.settings.downloadType.value === "snapShot") {
      this.imageMediaInstance.babylonScene?.downloadSnapShot();
    } else if (
      this.imageMediaInstance.settings.downloadType.value === "original"
    ) {
      this.imageMediaInstance.imageMedia.downloadImage();
    } else if (
      this.imageMediaInstance.settings.downloadType.value === "record"
    ) {
      if (!this.recording.current) {
        this.imageMediaInstance.babylonScene?.startRecording(
          downloadRecordingMimeMap[
            this.imageMediaInstance.settings.downloadType.downloadTypeOptions
              .mimeType.value
          ],
          parseInt(
            this.imageMediaInstance.settings.downloadType.downloadTypeOptions.fps.value.slice(
              0,
              -4,
            ),
          ),
        );
        this.downloadRecordingReady.current = false;
      } else {
        this.imageMediaInstance.babylonScene?.stopRecording();
        this.downloadRecordingReady.current = true;
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  handleDownloadRecording = () => {
    this.imageMediaInstance.babylonScene?.downloadRecording();
  };

  handleSettings = () => {
    this.setSettingsActive((prev) => !prev);
  };

  handleSync = () => {
    this.imageMediaInstance.settings.synced.value =
      !this.imageMediaInstance.settings.synced.value;

    this.setRerender((prev) => !prev);
  };

  handleSetAsBackground = () => {
    this.imageMediaInstance.settings.background.value =
      !this.imageMediaInstance.settings.background.value;

    this.setRerender((prev) => !prev);
  };
}

export default LowerImageController;
