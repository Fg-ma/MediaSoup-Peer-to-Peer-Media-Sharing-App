import { GroupSignals } from "../../../../context/signalContext/lib/typeConstant";
import {
  StaticContentEffectsType,
  StaticContentEffectsStylesType,
} from "../../../../../../universal/effectsTypeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import TableSvgMediaInstance from "../../TableSvgMediaInstance";

class LowerSvgController {
  constructor(
    private svgInstanceId: string,
    private svgMediaInstance: TableSvgMediaInstance,
    private svgContainerRef: React.RefObject<HTMLDivElement>,
    private setSvgEffectsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private setEditing: React.Dispatch<React.SetStateAction<boolean>>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private sendGroupSignal: (signal: GroupSignals) => void,
  ) {}

  handleSvgEffects = () => {
    this.setSvgEffectsActive((prev) => !prev);
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (
      !event.key ||
      !this.svgContainerRef.current?.classList.contains("in-media") ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    const tagName = document.activeElement?.tagName.toLowerCase();
    if (tagName === "input" || tagName === "textarea") return;

    switch (event.key.toLowerCase()) {
      case "e":
        this.handleSvgEffects();
        break;
      case "d":
        this.handleDownload();
        break;
      case "c":
        this.handleCopyToClipBoard();
        break;
      case "u":
        this.handleSettings();
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

  handleAlertSvgEffect = () => {
    if (this.svgMediaInstance.settings.synced.value) {
      this.tableStaticContentSocket.current?.updateContentEffects(
        "svg",
        this.svgMediaInstance.svgMedia.svgId,
        this.svgInstanceId,
        this.staticContentEffects.current.svg[this.svgInstanceId],
        this.staticContentEffectsStyles.current.svg[this.svgInstanceId],
      );
    }
  };

  handleSettings = () => {
    this.setSettingsActive((prev) => !prev);
  };

  handleSetAsBackground = () => {
    this.svgMediaInstance.settings.background.value =
      !this.svgMediaInstance.settings.background.value;

    this.setSettingsActive(false);

    setTimeout(() => {
      this.sendGroupSignal({
        type: "removeGroupElement",
        data: { removeType: "svg", removeId: this.svgInstanceId },
      });
    }, 0);

    this.setRerender((prev) => !prev);
  };

  handleSync = () => {
    this.svgMediaInstance.settings.synced.value =
      !this.svgMediaInstance.settings.synced.value;

    if (this.svgMediaInstance.settings.synced.value) {
      this.tableStaticContentSocket.current?.requestCatchUpEffects(
        "svg",
        this.svgMediaInstance.svgMedia.svgId,
        this.svgMediaInstance.svgInstanceId,
      );
    }

    this.setRerender((prev) => !prev);
  };

  handleEdit = () => {
    this.setEditing((prev) => !prev);
    this.setSettingsActive(false);
  };

  handleDownload = () => {
    this.svgMediaInstance.downloadSvg(
      this.svgMediaInstance.settings.downloadOptions.mimeType.value,
      this.svgMediaInstance.settings.downloadOptions.size.width.value,
      this.svgMediaInstance.settings.downloadOptions.size.height.value,
      this.svgMediaInstance.settings.downloadOptions.compression.value,
    );
  };

  handleCopyToClipBoard = () => {
    this.svgMediaInstance.copyToClipboard(
      this.svgMediaInstance.settings.downloadOptions.compression.value,
    );
  };
}

export default LowerSvgController;
