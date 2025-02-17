import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import { Permissions } from "../../context/permissionsContext/typeConstant";
import {
  IncomingMediasoupMessages,
  onResponsedCatchUpDataType,
} from "../../serverControllers/mediasoupServer/MediasoupSocketController";

class FgAudioElementContainerController {
  constructor(
    private isUser: boolean,
    private table_id: string,
    private username: string,
    private instance: string,
    private positioning: React.MutableRefObject<{
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    }>,
    private permissions: Permissions,
    private remoteDataStreams: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: {
          positionScaleRotation?: DataConsumer | undefined;
        };
      };
    }>,
    private positioningListeners: React.MutableRefObject<{
      [username: string]: {
        [instance: string]: () => void;
      };
    }>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  onResponsedCatchUpData = (event: onResponsedCatchUpDataType) => {
    const { inquiredUsername, inquiredInstance, inquiredType } = event.header;

    if (
      !this.isUser &&
      this.username === inquiredUsername &&
      this.instance === inquiredInstance &&
      inquiredType === "audio" &&
      event.data &&
      Object.keys(event.data.positioning).length !== 0
    ) {
      this.positioning.current = event.data.positioning;
    }
  };

  onNewConsumerWasCreated = () => {
    for (const remoteUsername in this.remoteDataStreams.current) {
      const remoteUserStreams = this.remoteDataStreams.current[remoteUsername];
      for (const remoteInstance in remoteUserStreams) {
        const stream = remoteUserStreams[remoteInstance].positionScaleRotation;
        if (
          stream &&
          (!this.positioningListeners.current[remoteUsername] ||
            !this.positioningListeners.current[remoteUsername][remoteInstance])
        ) {
          const handleMessage = (message: string) => {
            const data = JSON.parse(message);
            if (
              data.table_id === this.table_id &&
              data.username === this.username &&
              data.instance === this.instance &&
              data.type === "audio"
            ) {
              this.positioning.current = data.positioning;
              this.setRerender((prev) => !prev);
            }
          };

          stream.on("message", handleMessage);

          // Store cleanup function
          if (!this.positioningListeners.current[remoteUsername]) {
            this.positioningListeners.current[remoteUsername] = {};
          }
          this.positioningListeners.current[remoteUsername][remoteInstance] =
            () => stream.off("message", handleMessage);
        }
      }
    }
  };

  handleMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "responsedCatchUpData":
        this.onResponsedCatchUpData(event);
        break;
      case "newConsumerWasCreated":
        this.onNewConsumerWasCreated();
        break;
      default:
        break;
    }
  };

  attachListeners = () => {
    for (const remoteUsername in this.remoteDataStreams.current) {
      const remoteUserStreams = this.remoteDataStreams.current[remoteUsername];
      for (const remoteInstance in remoteUserStreams) {
        const stream = remoteUserStreams[remoteInstance].positionScaleRotation;
        if (stream) {
          const handleMessage = (message: string) => {
            const data = JSON.parse(message);
            if (
              this.permissions.acceptsAudioEffects &&
              data.table_id === this.table_id &&
              data.username === this.username &&
              data.instance === this.instance &&
              data.type === "audio"
            ) {
              this.positioning.current = data.positioning;
              this.setRerender((prev) => !prev);
            }
          };

          stream.on("message", handleMessage);

          // Store cleanup function
          if (!this.positioningListeners.current[remoteUsername]) {
            this.positioningListeners.current[remoteUsername] = {};
          }
          this.positioningListeners.current[remoteUsername][remoteInstance] =
            () => stream.off("message", handleMessage);
        }
      }
    }
  };
}

export default FgAudioElementContainerController;
