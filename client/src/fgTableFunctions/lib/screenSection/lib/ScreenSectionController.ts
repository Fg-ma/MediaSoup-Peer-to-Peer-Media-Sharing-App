import { types } from "mediasoup-client";
import { Socket } from "socket.io-client";
import CameraMedia from "../../../../lib/CameraMedia";
import ScreenMedia from "../../../../lib/ScreenMedia";
import AudioMedia from "../../../../lib/AudioMedia";
import ProducersController from "../../../../lib/ProducersController";

class ScreenSectionController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private device: React.MutableRefObject<types.Device | undefined>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private isScreen: React.MutableRefObject<boolean>,
    private setScreenActive: (value: React.SetStateAction<boolean>) => void,

    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,

    private producersController: ProducersController,

    private handleDisableEnableBtns: (disabled: boolean) => void
  ) {}

  shareScreen = () => {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.handleDisableEnableBtns(true);
    this.isScreen.current = !this.isScreen.current;
    this.setScreenActive((prev) => !prev);

    if (this.isScreen.current) {
      this.producersController.createNewProducer("screen");
    } else if (!this.isScreen.current) {
      const screenIds = Object.keys(this.userMedia.current.screen);

      if (screenIds.length > 0 && screenIds[screenIds.length - 1]) {
        const msg = {
          type: "removeProducer",
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
          producerType: "screen",
          producerId: screenIds[screenIds.length - 1],
        };
        this.socket.current.emit("message", msg);

        const message = {
          type: "removeProducer",
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
          producerType: "screen",
          producerId: `${screenIds[screenIds.length - 1]}_audio`,
        };
        this.socket.current.emit("message", message);
      }
    }
  };

  shareNewScreen = () => {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.handleDisableEnableBtns(true);

    if (this.device.current) {
      this.producersController.createNewProducer("screen");
    }
  };
}

export default ScreenSectionController;
