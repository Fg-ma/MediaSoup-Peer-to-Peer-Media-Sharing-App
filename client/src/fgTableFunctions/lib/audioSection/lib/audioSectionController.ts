import MediasoupSocketController from "../../../../lib/MediasoupSocketController";
import ProducersController from "../../../../lib/ProducersController";

class AudioSectionController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
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
      this.mediasoupSocket.current?.sendMessage({
        type: "removeProducer",
        header: {
          table_id: this.table_id.current,
          username: this.username.current,
          instance: this.instance.current,
          producerType: "audio",
        },
      });
    }
  };
}

export default AudioSectionController;
