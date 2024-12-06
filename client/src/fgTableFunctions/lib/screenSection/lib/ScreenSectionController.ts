import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import CameraMedia from "../../../../lib/CameraMedia";
import ScreenMedia from "../../../../lib/ScreenMedia";
import AudioMedia from "../../../../lib/AudioMedia";
import ProducersController from "../../../../lib/ProducersController";

class ScreenSectionController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private isCamera: React.MutableRefObject<boolean>,
    private isScreen: React.MutableRefObject<boolean>,
    private isAudio: React.MutableRefObject<boolean>,
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
    private userScreenCount: React.MutableRefObject<number>,

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
      this.userScreenCount.current = this.userScreenCount.current + 1;
      if (this.device.current) {
        const msg = {
          type: "createProducerTransport",
          forceTcp: false,
          rtpCapabilities: this.device.current.rtpCapabilities,
          producerType: "screen",
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
        };
        this.socket.current.emit("message", msg);
      }
    } else if (!this.isScreen.current) {
      for (let i = this.userScreenCount.current; i >= 0; i--) {
        const producerId = `${this.username.current}_screen_stream_${i}`;

        if (producerId in this.userMedia.current.screen) {
          // Remove screen producer
          const msg = {
            type: "removeProducer",
            table_id: this.table_id.current,
            username: this.username.current,
            instance: this.instance.current,
            producerType: "screen",
            producerId: producerId,
          };
          this.socket.current.emit("message", msg);

          if (
            Object.keys(this.userMedia.current.screen).length === 1 &&
            !this.isCamera.current &&
            !this.isAudio.current
          ) {
            // Remove positionRotationScale producer
            const message = {
              type: "removeProducer",
              table_id: this.table_id.current,
              username: this.username.current,
              instance: this.instance.current,
              producerType: "json",
              dataStreamType: "positionScaleRotation",
            };
            this.socket.current.emit("message", message);
          }

          // return after the first stream is removed
          return;
        }
      }
    }
  };

  shareNewScreen = () => {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.handleDisableEnableBtns(true);
    this.userScreenCount.current = this.userScreenCount.current + 1;

    if (this.device.current) {
      this.producersController.createNewProducer("screen");
    }
  };
}

export default ScreenSectionController;
