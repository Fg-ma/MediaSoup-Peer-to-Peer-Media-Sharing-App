import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";
import Producers from "src/lib/Producers";

class ScreenSectionController {
  private socket: React.MutableRefObject<Socket>;
  private device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  private table_id: React.MutableRefObject<string>;
  private username: React.MutableRefObject<string>;
  private instance: React.MutableRefObject<string>;

  private isScreen: React.MutableRefObject<boolean>;
  private setScreenActive: (value: React.SetStateAction<boolean>) => void;

  private userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;
  private userScreenCount: React.MutableRefObject<number>;

  private producers: Producers;

  private handleDisableEnableBtns: (disabled: boolean) => void;

  constructor(
    socket: React.MutableRefObject<Socket>,
    device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,
    instance: React.MutableRefObject<string>,

    isScreen: React.MutableRefObject<boolean>,
    setScreenActive: (value: React.SetStateAction<boolean>) => void,

    userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    userScreenCount: React.MutableRefObject<number>,

    producers: Producers,

    handleDisableEnableBtns: (disabled: boolean) => void
  ) {
    this.socket = socket;
    this.device = device;
    this.table_id = table_id;
    this.username = username;
    this.instance = instance;
    this.isScreen = isScreen;
    this.setScreenActive = setScreenActive;
    this.userMedia = userMedia;
    this.userScreenCount = userScreenCount;
    this.producers = producers;
    this.handleDisableEnableBtns = handleDisableEnableBtns;
  }

  shareScreen() {
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
          const msg = {
            type: "removeProducer",
            table_id: this.table_id.current,
            username: this.username.current,
            instance: this.instance.current,
            producerType: "screen",
            producerId: producerId,
          };
          this.socket.current.emit("message", msg);
          break;
        }
      }
    }
  }

  shareNewScreen() {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.handleDisableEnableBtns(true);
    this.userScreenCount.current = this.userScreenCount.current + 1;

    if (this.device.current) {
      this.producers.createNewProducer("screen");
    }
  }
}

export default ScreenSectionController;
