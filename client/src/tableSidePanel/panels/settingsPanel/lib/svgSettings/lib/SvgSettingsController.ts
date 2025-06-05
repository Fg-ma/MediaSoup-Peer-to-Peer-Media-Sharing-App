import TableStaticContentSocketController from "../../../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import TableSvgMediaInstance from "../../../../../../media/fgTableSvg/TableSvgMediaInstance";
import { GroupSignals } from "../../../../../../context/signalContext/lib/typeConstant";

class SvgSettingsController {
  constructor(
    private svgMediaInstance: React.MutableRefObject<TableSvgMediaInstance>,
    private setEditing: React.Dispatch<React.SetStateAction<boolean>>,
    private setDownloadOptionsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private sendGroupSignal: (signal: GroupSignals) => void,
  ) {}

  handleSetAsBackground = () => {
    this.svgMediaInstance.current.settings.background.value =
      !this.svgMediaInstance.current.settings.background.value;

    this.svgMediaInstance.current.settingsChanged();

    setTimeout(() => {
      this.sendGroupSignal({
        type: "removeGroupElement",
        data: {
          removeType: "svg",
          removeId: this.svgMediaInstance.current.svgInstanceId,
        },
      });
    }, 0);

    this.setRerender((prev) => !prev);
  };

  handleSync = () => {
    this.svgMediaInstance.current.settings.synced.value =
      !this.svgMediaInstance.current.settings.synced.value;

    if (this.svgMediaInstance.current.settings.synced.value) {
      this.tableStaticContentSocket.current?.requestCatchUpEffects(
        "svg",
        this.svgMediaInstance.current.svgMedia.svgId,
        this.svgMediaInstance.current.svgInstanceId,
      );
    }

    this.setRerender((prev) => !prev);
  };

  handleEdit = () => {
    this.setEditing((prev) => !prev);
  };

  handleDownload = () => {
    this.svgMediaInstance.current.downloadSvg(
      this.svgMediaInstance.current.settings.downloadOptions.mimeType.value,
      this.svgMediaInstance.current.settings.downloadOptions.size.width.value,
      this.svgMediaInstance.current.settings.downloadOptions.size.height.value,
      this.svgMediaInstance.current.settings.downloadOptions.compression.value,
    );
  };

  handleCopyToClipBoard = () => {
    this.svgMediaInstance.current.copyToClipboard(
      this.svgMediaInstance.current.settings.downloadOptions.compression.value,
    );
  };

  handleDownloadOptionsActive = () => {
    this.setDownloadOptionsActive((prev) => !prev);
  };
}

export default SvgSettingsController;
