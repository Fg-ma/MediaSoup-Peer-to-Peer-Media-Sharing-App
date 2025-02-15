import { UserMediaType } from "../../../../context/mediaContext/typeConstant";
import {
  UserStreamEffectsType,
  ApplicationsEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import ApplicationsMedia from "../../ApplicationsMedia";
import { downloadRecordingMimeMap, Settings } from "../typeConstant";

class LowerApplicationsController {
  constructor(
    private applicationsId: string,
    private applicationsMedia: ApplicationsMedia,
    private applicationsContainerRef: React.RefObject<HTMLDivElement>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private setApplicationsEffectsActive: React.Dispatch<
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

  handleApplicationsEffects = () => {
    this.setApplicationsEffectsActive((prev) => !prev);
  };

  handleFullScreen = () => {
    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .then(() => {
          this.applicationsContainerRef.current?.classList.remove(
            "full-screen"
          );
        })
        .catch((error) => {
          console.error("Failed to exit full screen:", error);
        });
    } else {
      this.applicationsContainerRef.current
        ?.requestFullscreen()
        .then(() => {
          this.applicationsContainerRef.current?.classList.add("full-screen");
        })
        .catch((error) => {
          console.error("Failed to request full screen:", error);
        });
    }
  };

  handleFullScreenChange = () => {
    if (!document.fullscreenElement) {
      this.applicationsContainerRef.current?.classList.remove("full-screen");
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.applicationsContainerRef.current?.classList.contains("in-media") ||
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
        this.handleApplicationsEffects();
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

  handleApplicationsEffect = async (
    effect: ApplicationsEffectTypes,
    blockStateChange: boolean
  ) => {
    if (!blockStateChange) {
      this.userStreamEffects.current.applications[this.applicationsId][effect] =
        !this.userStreamEffects.current.applications[this.applicationsId][
          effect
        ];
    }

    this.userMedia.current.applications[this.applicationsId].changeEffects(
      effect,
      this.tintColor.current,
      blockStateChange
    );
  };

  handleDownload = () => {
    if (this.settings.downloadType.value === "snapShot") {
      this.applicationsMedia.babylonScene?.downloadSnapShot();
    } else if (this.settings.downloadType.value === "original") {
      this.applicationsMedia.downloadApplications();
    } else if (this.settings.downloadType.value === "record") {
      if (!this.recording.current) {
        this.applicationsMedia.babylonScene?.startRecording(
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
        this.applicationsMedia.babylonScene?.stopRecording();
        this.downloadRecordingReady.current = true;
      }

      this.recording.current = !this.recording.current;
      this.setRerender((prev) => !prev);
    }
  };

  handleDownloadRecording = () => {
    this.applicationsMedia.babylonScene?.downloadRecording();
  };

  handleSettings = () => {
    this.setSettingsActive((prev) => !prev);
  };
}

export default LowerApplicationsController;
