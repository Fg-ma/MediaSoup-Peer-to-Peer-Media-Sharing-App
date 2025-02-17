import { types } from "mediasoup-client";
import { UserMediaType } from "../../../../context/mediaContext/typeConstant";
import ProducersController from "../../../../lib/ProducersController";
import MediasoupSocketController from "../../../../serverControllers/mediasoupServer/MediasoupSocketController";

class ScreenSectionController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private device: React.MutableRefObject<types.Device | undefined>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,

    private isScreen: React.MutableRefObject<boolean>,
    private setScreenActive: (value: React.SetStateAction<boolean>) => void,

    private userMedia: React.MutableRefObject<UserMediaType>,

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
      this.producersController.createNewProducer("screen");
    } else if (!this.isScreen.current) {
      const screenIds = Object.keys(this.userMedia.current.screen);

      if (screenIds.length > 0 && screenIds[screenIds.length - 1]) {
        this.mediasoupSocket.current?.sendMessage({
          type: "removeProducer",
          header: {
            table_id: this.table_id.current,
            username: this.username.current,
            instance: this.instance.current,
            producerType: "screen",
            producerId: screenIds[screenIds.length - 1],
          },
        });

        if (
          this.userMedia.current.screenAudio[
            `${screenIds[screenIds.length - 1]}_audio`
          ]
        ) {
          this.mediasoupSocket.current?.sendMessage({
            type: "removeProducer",
            header: {
              table_id: this.table_id.current,
              username: this.username.current,
              instance: this.instance.current,
              producerType: "screenAudio",
              producerId: `${screenIds[screenIds.length - 1]}_audio`,
            },
          });
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

    if (this.device.current) {
      this.producersController.createNewProducer("screen");
    }
  };
}

export default ScreenSectionController;
