import { UserMediaType } from "../../../../context/mediaContext/typeConstant";
import {
  UserStreamEffectsType,
  TextEffectTypes,
  TextEffectStylesType,
  UserEffectsStylesType,
} from "../../../../context/effectsContext/typeConstant";
import { downloadRecordingMimeMap, Settings } from "../typeConstant";
import TextMedia from "../../TextMedia";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";

class LowerTextController {
  constructor(
    private textId: string,
    private textMedia: TextMedia,
    private textContainerRef: React.RefObject<HTMLDivElement>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private setTextEffectsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private tintColor: React.MutableRefObject<string>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private settings: Settings,
    private recording: React.MutableRefObject<boolean>,
    private downloadRecordingReady: React.MutableRefObject<boolean>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >
  ) {}

  handleTextEffects = () => {
    this.setTextEffectsActive((prev) => !prev);
  };

  handleFullScreen = () => {
    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .then(() => {
          this.textContainerRef.current?.classList.remove("full-screen");
        })
        .catch((error) => {
          console.error("Failed to exit full screen:", error);
        });
    } else {
      this.textContainerRef.current
        ?.requestFullscreen()
        .then(() => {
          this.textContainerRef.current?.classList.add("full-screen");
        })
        .catch((error) => {
          console.error("Failed to request full screen:", error);
        });
    }
  };

  handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      this.textContainerRef.current?.classList.remove("full-screen");
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.textContainerRef.current?.classList.contains("in-media") ||
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
        this.handleTextEffects();
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

  handleTextEffect = async (
    effect: TextEffectTypes,
    blockStateChange: boolean
  ) => {
    if (!blockStateChange) {
      this.userStreamEffects.current.text[this.textId][effect] =
        !this.userStreamEffects.current.text[this.textId][effect];
    }

    this.userMedia.current.text[this.textId].changeEffects(
      effect,
      this.tintColor.current,
      blockStateChange
    );

    this.tableStaticContentSocket.current?.updateContentEffects(
      "text",
      this.textId,
      this.userStreamEffects.current.text[this.textId],
      this.userEffectsStyles.current.text[this.textId]
    );
  };

  handleDownload = () => {
    if (this.settings.downloadType.value === "snapShot") {
      this.textMedia.babylonScene?.downloadSnapShot();
    } else if (this.settings.downloadType.value === "original") {
      this.textMedia.downloadText();
    } else if (this.settings.downloadType.value === "record") {
      if (!this.recording.current) {
        this.textMedia.babylonScene?.startRecording(
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
        this.textMedia.babylonScene?.stopRecording();
        this.downloadRecordingReady.current = true;
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  handleDownloadRecording = () => {
    this.textMedia.babylonScene?.downloadRecording();
  };

  handleSettings = () => {
    this.setSettingsActive((prev) => !prev);
  };
}

export default LowerTextController;
