import { types } from "mediasoup-client";
import { Socket } from "socket.io-client";
import CameraMedia from "../../../../lib/CameraMedia";
import ScreenMedia from "../../../../lib/ScreenMedia";
import AudioMedia from "../../../../lib/AudioMedia";
import ProducersController from "../../../../lib/ProducersController";

class CameraSectionController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private device: React.MutableRefObject<types.Device | undefined>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private isCamera: React.MutableRefObject<boolean>,
    private setCameraActive: (value: React.SetStateAction<boolean>) => void,

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

  shareCamera = () => {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }

    this.handleDisableEnableBtns(true);
    this.isCamera.current = !this.isCamera.current;
    this.setCameraActive((prev) => !prev);

    if (this.isCamera.current) {
      this.producersController.createNewProducer("camera");
    } else if (!this.isCamera.current) {
      const cameraIds = Object.keys(this.userMedia.current.camera);

      if (cameraIds.length > 0 && cameraIds[cameraIds.length - 1]) {
        const msg = {
          type: "removeProducer",
          data: {
            table_id: this.table_id.current,
            username: this.username.current,
            instance: this.instance.current,
            producerType: "camera",
            producerId: cameraIds[cameraIds.length - 1],
          },
        };
        this.socket.current.emit("message", msg);
      }
    }
  };

  shareNewCamera = () => {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.handleDisableEnableBtns(true);

    if (this.device.current) {
      this.producersController.createNewProducer("camera");
    }
  };
}

export default CameraSectionController;
