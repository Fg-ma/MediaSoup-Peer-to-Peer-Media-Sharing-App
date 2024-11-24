import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

class AudioSectionController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private isCamera: React.MutableRefObject<boolean>,
    private isScreen: React.MutableRefObject<boolean>,
    private isAudio: React.MutableRefObject<boolean>,
    private setAudioActive: (value: React.SetStateAction<boolean>) => void,

    private handleDisableEnableBtns: (disabled: boolean) => void
  ) {}

  shareAudio = () => {
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
          instance: this.instance.current,
        };
        this.socket.current.emit("message", msg);
      }
    } else if (!this.isAudio.current) {
      const msg = {
        type: "removeProducer",
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
        producerType: "audio",
      };
      this.socket.current.emit("message", msg);

      if (!this.isCamera.current && !this.isScreen.current) {
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
    }
  };
}

export default AudioSectionController;
