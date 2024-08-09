import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import CameraMedia from "../../lib/CameraMedia";
import ScreenMedia from "../../lib/ScreenMedia";
import AudioMedia from "../../lib/AudioMedia";

class AudioSectionController {
  private socket: React.MutableRefObject<Socket>;
  private device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  private table_id: React.MutableRefObject<string>;
  private username: React.MutableRefObject<string>;

  private isAudio: React.MutableRefObject<boolean>;
  private setAudioActive: (value: React.SetStateAction<boolean>) => void;

  private handleDisableEnableBtns: (disabled: boolean) => void;

  constructor(
    socket: React.MutableRefObject<Socket>,
    device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    table_id: React.MutableRefObject<string>,
    username: React.MutableRefObject<string>,

    isAudio: React.MutableRefObject<boolean>,
    setAudioActive: (value: React.SetStateAction<boolean>) => void,

    handleDisableEnableBtns: (disabled: boolean) => void
  ) {
    this.socket = socket;
    this.device = device;
    this.table_id = table_id;
    this.username = username;
    this.isAudio = isAudio;
    this.setAudioActive = setAudioActive;
    this.handleDisableEnableBtns = handleDisableEnableBtns;
  }

  shareAudio() {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.handleDisableEnableBtns(true);
    this.isAudio.current = !this.isAudio.current;
    this.setAudioActive((prev) => !prev);

    if (this.isAudio.current) {
      if (this.device.current) {
        const msg = {
          type: "createProducerTransport",
          forceTcp: false,
          rtpCapabilities: this.device.current.rtpCapabilities,
          producerType: "audio",
          table_id: this.table_id.current,
          username: this.username.current,
        };
        this.socket.current.emit("message", msg);
      }
    } else if (!this.isAudio.current) {
      const msg = {
        type: "removeProducer",
        table_id: this.table_id.current,
        username: this.username.current,
        producerType: "audio",
      };
      this.socket.current.emit("message", msg);
    }
  }
}

export default AudioSectionController;
