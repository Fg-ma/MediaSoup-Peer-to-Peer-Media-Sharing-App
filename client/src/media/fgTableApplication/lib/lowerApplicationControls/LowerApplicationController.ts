import {
  ApplicationEffectTypes,
  StaticContentEffectsType,
  StaticContentEffectsStylesType,
} from "../../../../../../universal/effectsTypeConstant";
import { downloadRecordingMimeMap, Settings } from "../typeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import TableApplicationMediaInstance from "../../TableApplicationMediaInstance";

class LowerApplicationController {
  constructor(
    private applicationInstanceId: string,
    private applicationMediaInstance: TableApplicationMediaInstance,
    private applicationContainerRef: React.RefObject<HTMLDivElement>,
    private setApplicationEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private tintColor: React.MutableRefObject<string>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private settings: Settings,
    private recording: React.MutableRefObject<boolean>,
    private downloadRecordingReady: React.MutableRefObject<boolean>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private setSettings: React.Dispatch<React.SetStateAction<Settings>>,
  ) {}

  handleApplicationEffects = () => {
    this.setApplicationEffectsActive((prev) => !prev);
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.applicationContainerRef.current?.classList.contains("in-media") ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") return;

    switch (event.key.toLowerCase()) {
      case "e":
        this.handleApplicationEffects();
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

  handleApplicationEffect = async (
    effect: ApplicationEffectTypes,
    blockStateChange: boolean,
  ) => {
    if (!blockStateChange) {
      this.staticContentEffects.current.application[this.applicationInstanceId][
        effect
      ] =
        !this.staticContentEffects.current.application[
          this.applicationInstanceId
        ][effect];
    }

    this.applicationMediaInstance.changeEffects(
      effect,
      this.tintColor.current,
      blockStateChange,
    );

    this.tableStaticContentSocket.current?.updateContentEffects(
      "application",
      this.applicationMediaInstance.applicationMedia.applicationId,
      this.applicationInstanceId,
      this.staticContentEffects.current.application[this.applicationInstanceId],
      this.staticContentEffectsStyles.current.application[
        this.applicationInstanceId
      ],
    );
  };

  handleDownload = () => {
    if (this.settings.downloadType.value === "snapShot") {
      this.applicationMediaInstance.babylonScene?.downloadSnapShot();
    } else if (this.settings.downloadType.value === "original") {
      this.applicationMediaInstance.applicationMedia.downloadApplication();
    } else if (this.settings.downloadType.value === "record") {
      if (!this.recording.current) {
        this.applicationMediaInstance.babylonScene?.startRecording(
          downloadRecordingMimeMap[
            this.settings.downloadType.downloadTypeOptions.mimeType.value
          ],
          parseInt(
            this.settings.downloadType.downloadTypeOptions.fps.value.slice(
              0,
              -4,
            ),
          ),
        );
        this.downloadRecordingReady.current = false;
      } else {
        this.applicationMediaInstance.babylonScene?.stopRecording();
        this.downloadRecordingReady.current = true;
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  handleDownloadRecording = () => {
    this.applicationMediaInstance.babylonScene?.downloadRecording();
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

export default LowerApplicationController;
