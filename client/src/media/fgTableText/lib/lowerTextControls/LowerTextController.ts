import TableTextMediaInstance from "../../TableTextMediaInstance";
import { Settings } from "../typeConstant";

class LowerTextController {
  constructor(
    private textMediaInstance: TableTextMediaInstance,
    private textContainerRef: React.RefObject<HTMLDivElement>,
    private setSettings: React.Dispatch<React.SetStateAction<Settings>>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private textAreaRef: React.RefObject<HTMLPreElement>,
    private setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
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
    if (tagName === "input") return;

    switch (event.key.toLowerCase()) {
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

    this.setIsEditing(true);

    document.addEventListener("pointerdown", this.handlePointerDown);

    setTimeout(() => {
      const range = document.createRange();
      const selection = window.getSelection();
      if (this.textAreaRef.current)
        range.selectNodeContents(this.textAreaRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }, 0);
  };

  handlePointerDown = (event: PointerEvent) => {
    if (!this.textAreaContainerRef.current?.contains(event.target as Node)) {
      this.setIsEditing(false);
      document.removeEventListener("pointerdown", this.handlePointerDown);
    }
  };
}

export default LowerTextController;
