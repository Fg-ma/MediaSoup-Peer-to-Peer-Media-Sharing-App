import CaptureMedia from "../../media/capture/CaptureMedia";
import { FgBackground } from "../../elements/fgBackgroundSelector/lib/typeConstant";
import { IncomingTableMessages } from "../../serverControllers/tableServer/TableSocketController";
import UserDevice from "../../lib/UserDevice";
import Deadbanding from "../../babylon/Deadbanding";
import { VideoEffectStylesType } from "../../context/effectsContext/typeConstant";

class TableFunctionsController {
  constructor(
    private externalBackgroundChange: React.MutableRefObject<boolean>,
    private setTableBackground: React.Dispatch<
      React.SetStateAction<FgBackground | undefined>
    >,
    private setCaptureMediaActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private captureMedia: React.MutableRefObject<CaptureMedia | undefined>,
    private userDevice: UserDevice,
    private deadbanding: Deadbanding,
    private effectsStyles: React.MutableRefObject<VideoEffectStylesType>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  handleTableSocketMessage = (message: IncomingTableMessages) => {
    switch (message.type) {
      case "tableBackgroundChanged":
        this.externalBackgroundChange.current = true;
        this.setTableBackground(message.data.background);
        break;
      default:
        break;
    }
  };

  getVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.captureMedia.current = new CaptureMedia(
        this.userDevice,
        this.deadbanding,
        this.effectsStyles
      );

      this.captureMedia.current.video.srcObject = stream;

      this.setRerender((prev) => !prev);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      this.setCaptureMediaActive(false);
    }
  };

  stopVideo = async () => {
    if (this.captureMedia.current) {
      const stream = this.captureMedia.current.video.srcObject as MediaStream;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        this.captureMedia.current.video.srcObject = null;
      }
    }

    this.setCaptureMediaActive(false);
  };
}

export default TableFunctionsController;
