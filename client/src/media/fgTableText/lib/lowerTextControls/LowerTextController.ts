import TableTextMediaInstance from "../../TableTextMediaInstance";
import { Settings } from "../typeConstant";

class LowerTextController {
  constructor(
    private textMediaInstance: TableTextMediaInstance,
    private textContainerRef: React.RefObject<HTMLDivElement>,
    private setSettings: React.Dispatch<React.SetStateAction<Settings>>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setIsReadOnly: React.Dispatch<React.SetStateAction<boolean>>,
    private textAreaContainerRef: React.RefObject<HTMLDivElement>,
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.textContainerRef.current?.classList.contains("in-media") ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") return;

    switch (event.key.toLowerCase()) {
      case "d":
        this.handleDownload();
        break;
      case "b":
        this.handleSetAsBackground();
        break;
      case "m":
        this.handleMinimap();
        break;
      case "e":
        this.handleEdit();
        break;
      default:
        break;
    }
  };

  handleDownload = () => {
    this.textMediaInstance.textMedia.downloadText();
  };

  handleSetAsBackground = () => {
    this.setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.background.value = !newSettings.background.value;

      return newSettings;
    });
  };

  handleSync = () => {};

  handleEdit = () => {
    this.setSettingsActive(false);

    this.setIsReadOnly((prev) => !prev);
  };

  handleMinimap = () => {
    this.setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.minimap.value = !newSettings.minimap.value;

      return newSettings;
    });
  };

  handlePointerDown = (event: PointerEvent) => {
    if (!this.textAreaContainerRef.current?.contains(event.target as Node)) {
      this.setIsReadOnly(true);
      document.removeEventListener("pointerdown", this.handlePointerDown);
    }
  };
}

export default LowerTextController;
