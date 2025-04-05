import { UserMediaType } from "../../../../context/mediaContext/typeConstant";
import {
  UserEffectsType,
  ApplicationEffectTypes,
  UserEffectsStylesType,
} from "../../../../../../universal/effectsTypeConstant";
import { downloadRecordingMimeMap, Settings } from "../typeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import ApplicationMediaInstance from "../../ApplicationMediaInstance";

class LowerApplicationController {
  constructor(
    private applicationInstanceId: string,
    private applicationMedia: ApplicationMediaInstance,
    private applicationContainerRef: React.RefObject<HTMLDivElement>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private setApplicationEffectsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private tintColor: React.MutableRefObject<string>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
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

  handleApplicationEffects = () => {
    this.setApplicationEffectsActive((prev) => !prev);
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.applicationContainerRef.current?.classList.contains("in-media") ||
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

  handleApplicationEffect = async (
    effect: ApplicationEffectTypes,
    blockStateChange: boolean
  ) => {
    if (!blockStateChange) {
      this.userEffects.current.application[this.applicationInstanceId][effect] =
        !this.userEffects.current.application[this.applicationInstanceId][
          effect
        ];
    }

    this.applicationMedia.changeEffects(
      effect,
      this.tintColor.current,
      blockStateChange
    );

    this.tableStaticContentSocket.current?.updateContentEffects(
      "application",
      this.applicationMedia.applicationId,
      this.applicationInstanceId,
      this.userEffects.current.application[this.applicationInstanceId],
      this.userEffectsStyles.current.application[this.applicationInstanceId]
    );
  };

  handleDownload = () => {
    if (this.settings.downloadType.value === "snapShot") {
      this.applicationMedia.babylonScene?.downloadSnapShot();
    } else if (this.settings.downloadType.value === "original") {
      this.applicationMedia.downloadApplication();
    } else if (this.settings.downloadType.value === "record") {
      if (!this.recording.current) {
        this.applicationMedia.babylonScene?.startRecording(
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
        this.applicationMedia.babylonScene?.stopRecording();
        this.downloadRecordingReady.current = true;
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  handleDownloadRecording = () => {
    this.applicationMedia.babylonScene?.downloadRecording();
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
