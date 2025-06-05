import { GroupSignals } from "../../../../context/signalContext/lib/typeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import TableTextMediaInstance from "../../TableTextMediaInstance";

class LowerTextController {
  constructor(
    private textMediaInstance: TableTextMediaInstance,
    private tableTopRef: React.RefObject<HTMLDivElement>,
    private textContainerRef: React.RefObject<HTMLDivElement>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private textAreaContainerRef: React.RefObject<HTMLDivElement>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private initializing: React.MutableRefObject<boolean>,
    private forceFinishInitialization: React.MutableRefObject<boolean>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private sendGroupSignal: (signal: GroupSignals) => void,
  ) {}

  handleKeyDown = (event: KeyboardEvent) => {
    const tagName = document.activeElement?.tagName.toLowerCase();
    if (
      event.key.toLowerCase() === "s" &&
      event.ctrlKey &&
      tagName === "textarea" &&
      this.textContainerRef.current?.classList.contains("in-media") &&
      !this.textMediaInstance.isReadOnly
    ) {
      event.preventDefault();
      this.handleSave();
      return;
    }
    if (
      event.key.toLowerCase() === "i" &&
      event.ctrlKey &&
      this.textContainerRef.current?.classList.contains("in-media") &&
      this.textMediaInstance.isReadOnly
    ) {
      this.handleForceFinishInitialization();
      return;
    }

    if (
      !event.key ||
      !this.textContainerRef.current?.classList.contains("in-media") ||
      event.ctrlKey ||
      event.shiftKey ||
      !this.textMediaInstance.isReadOnly ||
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
    this.textMediaInstance.settings.background.value =
      !this.textMediaInstance.settings.background.value;

    this.setSettingsActive(false);

    setTimeout(() => {
      this.sendGroupSignal({
        type: "removeGroupElement",
        data: {
          removeType: "text",
          removeId: this.textMediaInstance.textInstanceId,
        },
      });
    }, 0);

    this.setRerender((prev) => !prev);
  };

  handleSync = () => {
    this.textMediaInstance.settings.synced.value =
      !this.textMediaInstance.settings.synced.value;

    if (this.textMediaInstance.settings.synced.value) {
      this.tableStaticContentSocket.current?.requestCatchUpEffects(
        "text",
        this.textMediaInstance.textMedia.textId,
        this.textMediaInstance.textInstanceId,
      );
    }

    this.setRerender((prev) => !prev);
  };

  handleEdit = () => {
    this.setSettingsActive(false);

    this.textMediaInstance.isReadOnly = !this.textMediaInstance.isReadOnly;

    this.setRerender((prev) => !prev);
  };

  handleMinimap = () => {
    this.textMediaInstance.settings.minimap.value =
      !this.textMediaInstance.settings.minimap.value;

    this.setRerender((prev) => !prev);
  };

  handlePointerDown = (event: PointerEvent) => {
    if (
      this.tableTopRef.current?.contains(event.target as Node) &&
      !this.textAreaContainerRef.current?.contains(event.target as Node)
    ) {
      this.textMediaInstance.isReadOnly = true;
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
