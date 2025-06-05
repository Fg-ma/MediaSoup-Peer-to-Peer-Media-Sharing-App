import TableStaticContentSocketController from "../../../../../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import TableVideoMediaInstance from "../../../../../../media/fgTableVideo/TableVideoMediaInstance";
import { GroupSignals } from "../../../../../../context/signalContext/lib/typeConstant";

class VideoSettingsController {
  constructor(
    private videoMediaInstance: React.MutableRefObject<TableVideoMediaInstance>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private sendGroupSignal: (signal: GroupSignals) => void,
  ) {}

  handleSetAsBackground = () => {
    this.videoMediaInstance.current.settings.background.value =
      !this.videoMediaInstance.current.settings.background.value;

    this.videoMediaInstance.current.settingsChanged();

    setTimeout(() => {
      this.sendGroupSignal({
        type: "removeGroupElement",
        data: {
          removeType: "video",
          removeId: this.videoMediaInstance.current.videoInstanceId,
        },
      });
    }, 0);

    this.setRerender((prev) => !prev);
  };

  handleSync = () => {
    this.videoMediaInstance.current.settings.synced.value =
      !this.videoMediaInstance.current.settings.synced.value;

    if (this.videoMediaInstance.current.settings.synced.value) {
      this.tableStaticContentSocket.current?.requestCatchUpEffects(
        "video",
        this.videoMediaInstance.current.videoMedia.videoId,
        this.videoMediaInstance.current.videoInstanceId,
      );
    }

    this.setRerender((prev) => !prev);
  };
}

export default VideoSettingsController;
