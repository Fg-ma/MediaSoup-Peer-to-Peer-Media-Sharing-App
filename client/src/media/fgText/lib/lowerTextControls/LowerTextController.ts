import TextMedia from "../../TextMedia";
import { Settings } from "../typeConstant";
class LowerTextController {
  constructor(
    private textMedia: TextMedia,
    private textContainerRef: React.RefObject<HTMLDivElement>,
    private shiftPressed: React.MutableRefObject<boolean>,
    private controlPressed: React.MutableRefObject<boolean>,
    private setSettings: React.Dispatch<React.SetStateAction<Settings>>
  ) {}

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
      case "d":
        this.handleDownload();
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

  handleDownload = () => {
    this.textMedia.downloadText();
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

export default LowerTextController;
