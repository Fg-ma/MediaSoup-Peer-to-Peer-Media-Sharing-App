import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import CameraMedia from "../../../../lib/CameraMedia";
import ScreenMedia from "../../../../lib/ScreenMedia";
import AudioMedia from "../../../../lib/AudioMedia";
import ProducersController from "../../../../lib/ProducersController";

class CameraSectionController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private device: React.MutableRefObject<mediasoup.types.Device | undefined>,
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
    private userCameraCount: React.MutableRefObject<number>,

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
      this.userCameraCount.current = this.userCameraCount.current + 1;
      this.producersController.createNewProducer("camera");
    } else if (!this.isCamera.current) {
      for (let i = this.userCameraCount.current; i >= 0; i--) {
        const cameraProducerId = `${this.username.current}_camera_stream_${i}`;

        if (cameraProducerId in this.userMedia.current.camera) {
          const msg = {
            type: "removeProducer",
            table_id: this.table_id.current,
            username: this.username.current,
            instance: this.instance.current,
            producerType: "camera",
            producerId: cameraProducerId,
          };
          this.socket.current.emit("message", msg);

          // return after the first stream is removed
          return;
        }
      }
    }
  };

  shareNewCamera = () => {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.handleDisableEnableBtns(true);
    this.userCameraCount.current = this.userCameraCount.current + 1;

    if (this.device.current) {
      this.producersController.createNewProducer("camera");
    }
  };
}

export default CameraSectionController;
