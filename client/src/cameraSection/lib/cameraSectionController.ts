import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";
import Producers from "../../lib/Producers";

class CameraSectionController {
  private socket: React.MutableRefObject<Socket>;
  private device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  private table_id: React.MutableRefObject<string>;
  private username: React.MutableRefObject<string>;
  private instance: React.MutableRefObject<string>;

  private isCamera: React.MutableRefObject<boolean>;
  private setCameraActive: (value: React.SetStateAction<boolean>) => void;

  private userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;
  private userCameraCount: React.MutableRefObject<number>;

  private producers: Producers;

  private handleDisableEnableBtns: (disabled: boolean) => void;

  constructor(
    socket: React.MutableRefObject<Socket>,
    device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,
    instance: React.MutableRefObject<string>,

    isCamera: React.MutableRefObject<boolean>,
    setCameraActive: (value: React.SetStateAction<boolean>) => void,

    userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    userCameraCount: React.MutableRefObject<number>,

    producers: Producers,

    handleDisableEnableBtns: (disabled: boolean) => void
  ) {
    this.socket = socket;
    this.device = device;
    this.table_id = table_id;
    this.username = username;
    this.instance = instance;
    this.isCamera = isCamera;
    this.setCameraActive = setCameraActive;
    this.userMedia = userMedia;
    this.userCameraCount = userCameraCount;
    this.producers = producers;
    this.handleDisableEnableBtns = handleDisableEnableBtns;
  }

  shareCamera() {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }

    this.handleDisableEnableBtns(true);
    this.isCamera.current = !this.isCamera.current;
    this.setCameraActive((prev) => !prev);

    if (this.isCamera.current) {
      this.userCameraCount.current = this.userCameraCount.current + 1;
      if (this.device.current) {
        const msg = {
          type: "createProducerTransport",
          forceTcp: false,
          rtpCapabilities: this.device.current.rtpCapabilities,
          producerType: "camera",
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
        };
        this.socket.current.emit("message", msg);
      }
    } else if (!this.isCamera.current) {
      for (let i = this.userCameraCount.current; i >= 0; i--) {
        const producerId = `${this.username.current}_camera_stream_${i}`;

        if (producerId in this.userMedia.current.camera) {
          const msg = {
            type: "removeProducer",
            table_id: this.table_id.current,
            username: this.username.current,
            instance: this.instance.current,
            producerType: "camera",
            producerId: producerId,
          };

          this.socket.current.emit("message", msg);
          break;
        }
      }
    }
  }

  async shareNewCamera() {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.handleDisableEnableBtns(true);
    this.userCameraCount.current = this.userCameraCount.current + 1;

    if (this.device.current) {
      this.producers.createNewProducer("camera");
    }
  }
}

export default CameraSectionController;
