import {
  UserEffectsType,
  UserEffectsStylesType,
} from "../../../../../../universal/effectsTypeConstant";
import TableStaticContentSocketController from "../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { Settings } from "../typeConstant";
import SvgMediaInstance from "../../SvgMediaInstance";

class LowerSvgController {
  constructor(
    private svgInstanceId: string,
    private svgMediaInstance: SvgMediaInstance,
    private svgContainerRef: React.RefObject<HTMLDivElement>,
    private setSvgEffectsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private settings: Settings,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private setSettings: React.Dispatch<React.SetStateAction<Settings>>,
    private setEditing: React.Dispatch<React.SetStateAction<boolean>>,
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
    if (tagName === "input") return;

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
      default:
        break;
    }
  };

  handleAlertSvgEffect = () => {
    this.tableStaticContentSocket.current?.updateContentEffects(
      "svg",
      this.svgMediaInstance.svgMedia.svgId,
      this.svgInstanceId,
      this.userEffects.current.svg[this.svgInstanceId],
      this.userEffectsStyles.current.svg[this.svgInstanceId],
    );
  };

  handleSettings = () => {
    this.setSettingsActive((prev) => !prev);
  };

  handleSetAsBackground = () => {
    this.setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.background.value = !newSettings.background.value;

      return newSettings;
    });
  };

  handleSync = () => {
    this.setSettings((prev) => {
      const newSettings = { ...prev };

      newSettings.synced.value = !newSettings.synced.value;

      return newSettings;
    });
  };

  handleEdit = () => {
    this.setEditing((prev) => !prev);
    this.setSettingsActive(false);
  };

  handleDownload = () => {
    this.svgMediaInstance.downloadSvg(
      this.settings.downloadOptions.mimeType.value,
      this.settings.downloadOptions.size.width.value,
      this.settings.downloadOptions.size.height.value,
      this.settings.downloadOptions.compression.value,
    );
  };

  handleCopyToClipBoard = () => {
    this.svgMediaInstance.copyToClipboard(
      this.settings.downloadOptions.compression.value,
    );
  };
}

export default LowerSvgController;
