import TableTextMediaInstance from "../../TableTextMediaInstance";
import { Settings } from "../typeConstant";

class LowerTextController {
  constructor(
    private textMediaInstance: TableTextMediaInstance,
    private textContainerRef: React.RefObject<HTMLDivElement>,
    private setSettings: React.Dispatch<React.SetStateAction<Settings>>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private textAreaContainerRef: React.RefObject<HTMLDivElement>,
    private isReadOnly: React.MutableRefObject<boolean>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private initializing: React.MutableRefObject<boolean>,
    private forceFinishInitialization: React.MutableRefObject<boolean>,
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    const tagName = document.activeElement?.tagName.toLowerCase();
    if (
      event.key.toLowerCase() === "s" &&
      event.ctrlKey &&
      tagName === "textarea" &&
      this.textContainerRef.current?.classList.contains("in-media") &&
      !this.isReadOnly.current
    ) {
      event.preventDefault();
      this.handleSave();
      return;
    }
    if (
      event.key.toLowerCase() === "i" &&
      event.ctrlKey &&
      this.textContainerRef.current?.classList.contains("in-media") &&
      this.isReadOnly.current
    ) {
      this.handleForceFinishInitialization();
      return;
    }

    if (
      !event.key ||
      !this.textContainerRef.current?.classList.contains("in-media") ||
      event.ctrlKey ||
      event.shiftKey ||
      !this.isReadOnly.current ||
      tagName === "input" ||
      tagName === "textarea"
    ) {
      return;
    }

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

    this.isReadOnly.current = !this.isReadOnly.current;
    this.setRerender((prev) => !prev);
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
      this.isReadOnly.current = true;
      this.setRerender((prev) => !prev);
      document.removeEventListener("pointerdown", this.handlePointerDown);
    }
  };

  handleSave = () => {
    this.textMediaInstance.saveText();
  };

  handleForceFinishInitialization = () => {
    if (!this.forceFinishInitialization.current && this.initializing.current) {
      this.forceFinishInitialization.current = true;
      this.setRerender((prev) => !prev);
    }
  };
}

export default LowerTextController;
