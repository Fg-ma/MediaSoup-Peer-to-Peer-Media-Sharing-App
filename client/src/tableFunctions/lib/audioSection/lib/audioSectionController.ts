import MediasoupSocketController from "../../../../serverControllers/mediasoupServer/MediasoupSocketController";
import ProducersController from "../../../../lib/ProducersController";

class AudioSectionController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private tableId: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private producersController: React.MutableRefObject<ProducersController>,

    private isAudio: React.MutableRefObject<boolean>,
    private setAudioActive: (value: React.SetStateAction<boolean>) => void,

    private handleDisableEnableBtns: (disabled: boolean) => void,
  ) {}

  shareAudio = () => {
    if (!this.tableId.current || !this.username.current) {
      console.error("Missing tableId or username!");
      return;
    }
    this.handleDisableEnableBtns(true);
    this.isAudio.current = !this.isAudio.current;
    this.setAudioActive((prev) => !prev);

    if (this.isAudio.current) {
      this.producersController.current.createNewProducer("audio");
    } else if (!this.isAudio.current) {
      this.mediasoupSocket.current?.sendMessage({
        type: "removeProducer",
        header: {
          tableId: this.tableId.current,
          username: this.username.current,
          instance: this.instance.current,
          producerType: "audio",
        },
      });
    }
  };
}

export default AudioSectionController;
