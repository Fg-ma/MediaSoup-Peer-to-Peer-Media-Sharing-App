import TableStaticContentSocketController from "../../../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import TableImageMediaInstance from "../../../../../../media/fgTableImage/TableImageMediaInstance";
import { GroupSignals } from "../../../../../../context/signalContext/lib/typeConstant";

class ImageSettingsController {
  constructor(
    private imageMediaInstance: React.MutableRefObject<TableImageMediaInstance>,
    private setDownloadTypePageActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private sendGroupSignal: (signal: GroupSignals) => void,
  ) {}

  handleSetAsBackground = () => {
    this.imageMediaInstance.current.settings.background.value =
      !this.imageMediaInstance.current.settings.background.value;

    this.imageMediaInstance.current.settingsChanged();

    setTimeout(() => {
      this.sendGroupSignal({
        type: "removeGroupElement",
        data: {
          removeType: "image",
          removeId: this.imageMediaInstance.current.imageInstanceId,
        },
      });
    }, 0);

    this.setRerender((prev) => !prev);
  };

  handleSync = () => {
    this.imageMediaInstance.current.settings.synced.value =
      !this.imageMediaInstance.current.settings.synced.value;

    if (this.imageMediaInstance.current.settings.synced.value) {
      this.tableStaticContentSocket.current?.requestCatchUpEffects(
        "image",
        this.imageMediaInstance.current.imageMedia.imageId,
        this.imageMediaInstance.current.imageInstanceId,
      );
    }

    this.setRerender((prev) => !prev);
  };

  handleDownloadTypePageActive = () => {
    this.setDownloadTypePageActive((prev) => !prev);
  };
}

export default ImageSettingsController;
