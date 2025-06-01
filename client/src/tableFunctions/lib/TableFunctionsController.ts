import CaptureMedia from "../../media/capture/CaptureMedia";
import { FgBackground } from "../../elements/fgBackgroundSelector/lib/typeConstant";
import { IncomingTableMessages } from "../../serverControllers/tableServer/lib/typeConstant";
import UserDevice from "../../tools/userDevice/UserDevice";
import Deadbanding from "../../babylon/Deadbanding";
import {
  CaptureEffectStylesType,
  CaptureEffectsType,
} from "../../../../universal/effectsTypeConstant";
import { GeneralSignals } from "../../context/signalContext/lib/typeConstant";

class TableFunctionsController {
  constructor(
    private externalBackgroundChange: React.MutableRefObject<boolean>,
    private setTableBackground: React.Dispatch<
      React.SetStateAction<FgBackground | undefined>
    >,
    private setCaptureMediaActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private setMoreTableFunctionsActive: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    private sendGeneralSignal: (signal: GeneralSignals) => void,
    private captureMedia: React.MutableRefObject<CaptureMedia | undefined>,
    private userDevice: React.MutableRefObject<UserDevice>,
    private deadbanding: React.MutableRefObject<Deadbanding>,
    private captureEffects: React.MutableRefObject<CaptureEffectsType>,
    private captureEffectsStyles: React.MutableRefObject<CaptureEffectStylesType>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
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
        this.captureEffects,
        this.captureEffectsStyles,
      );

      this.captureMedia.current.video.srcObject = stream;

      this.setRerender((prev) => !prev);

      this.setMoreTableFunctionsActive(false);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: "Error accessing camera",
          timeout: 1750,
        },
      });
      this.setCaptureMediaActive(false);
    }
  };

  stopVideo = async () => {
    if (this.captureMedia.current) {
      this.captureMedia.current.deconstructor();
      this.captureMedia.current = undefined;
    }

    this.setCaptureMediaActive(false);
  };
}

export default TableFunctionsController;
