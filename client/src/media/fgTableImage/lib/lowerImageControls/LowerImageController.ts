import {
  ImageEffectTypes,
  StaticContentEffectsType,
  StaticContentEffectsStylesType,
} from "../../../../../../universal/effectsTypeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { downloadRecordingMimeMap } from "../typeConstant";
import TableImageMediaInstance from "../../TableImageMediaInstance";
import {
  GeneralSignals,
  GroupSignals,
} from "../../../../context/signalContext/lib/typeConstant";

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
    private sendGroupSignal: (signal: GroupSignals) => void,
    private sendGeneralSignal: (signal: GeneralSignals) => void,
    private setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  handleImageEffects = () => {
    this.setImageEffectsActive((prev) => !prev);
  };

  handleEdit = () => {
    if (this.imageMediaInstance.imageMedia.loadingState !== "reuploading") {
      if (this.imageMediaInstance.imageMedia.loadingState === "downloaded") {
        this.setIsEditing((prev) => !prev);
        this.setSettingsActive(false);
      }
    } else {
      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: "Cannot edit while image is reuploading",
          timeout: 2500,
        },
      });
    }
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
      case "m":
        this.handleEdit();
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

      if (this.imageMediaInstance.settings.synced.value) {
        this.tableStaticContentSocket.current?.updateContentEffects(
          "image",
          this.imageMediaInstance.imageMedia.imageId,
          this.imageInstanceId,
          this.staticContentEffects.current.image[this.imageInstanceId],
          this.staticContentEffectsStyles.current.image[this.imageInstanceId],
        );
      }
    } else {
      this.imageMediaInstance.clearAllEffects();

      if (this.imageMediaInstance.settings.synced.value) {
        this.tableStaticContentSocket.current?.updateContentEffects(
          "image",
          this.imageMediaInstance.imageMedia.imageId,
          this.imageInstanceId,
          this.staticContentEffects.current.image[this.imageInstanceId],
          this.staticContentEffectsStyles.current.image[this.imageInstanceId],
        );
      }
    }
  };

  handleDownload = () => {
    if (this.imageMediaInstance.settings.downloadType.value === "snapShot") {
      this.imageMediaInstance.babylonScene?.downloadSnapShot(
        this.imageMediaInstance.settings.downloadType
          .downloadSnapShotTypeOptions.mimeType.value,
        this.imageMediaInstance.settings.downloadType
          .downloadSnapShotTypeOptions.quality.value,
      );
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
            this.imageMediaInstance.settings.downloadType
              .downloadRecordTypeOptions.mimeType.value
          ],
          parseInt(
            this.imageMediaInstance.settings.downloadType.downloadRecordTypeOptions.fps.value.slice(
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

    if (this.imageMediaInstance.settings.synced.value) {
      this.tableStaticContentSocket.current?.requestCatchUpEffects(
        "image",
        this.imageMediaInstance.imageMedia.imageId,
        this.imageMediaInstance.imageInstanceId,
      );
    }

    this.setRerender((prev) => !prev);
  };

  handleSetAsBackground = () => {
    this.imageMediaInstance.settings.background.value =
      !this.imageMediaInstance.settings.background.value;

    this.setSettingsActive(false);

    setTimeout(() => {
      this.sendGroupSignal({
        type: "removeGroupElement",
        data: { removeType: "image", removeId: this.imageInstanceId },
      });
    }, 0);

    this.setRerender((prev) => !prev);
  };
}

export default LowerImageController;
