import { Socket } from "socket.io-client";
import ProducersController from "src/lib/ProducersController";

class AudioSectionController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<Socket>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private producersController: ProducersController,

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
      this.producersController.createNewProducer("audio");
    } else if (!this.isAudio.current) {
      const msg = {
        type: "removeProducer",
        header: {
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
          producerType: "audio",
        },
      };
      this.mediasoupSocket.current.emit("message", msg);
    }
  };
}

export default AudioSectionController;
