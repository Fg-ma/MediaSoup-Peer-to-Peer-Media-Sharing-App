import { DataConsumer } from "mediasoup-client/lib/DataConsumer";
import { Permissions } from "../../../context/permissionsContext/typeConstant";
import {
  IncomingMediasoupMessages,
  onResponsedCatchUpDataType,
} from "../../../serverControllers/mediasoupServer/lib/typeConstant";
import ReactController from "../../../elements/reactButton/lib/ReactController";
import TableSocketController from "../../../serverControllers/tableServer/TableSocketController";
import {
  IncomingTableMessages,
  onReactionOccurredType,
} from "../../../serverControllers/tableServer/lib/typeConstant";

class FgAudioElementContainerController {
  reactController: ReactController;

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
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private tableSocket: React.MutableRefObject<
      TableSocketController | undefined
    >,
    private behindEffectsContainerRef: React.RefObject<HTMLDivElement>,
    private frontEffectsContainerRef: React.RefObject<HTMLDivElement>
  ) {
    this.reactController = new ReactController(
      `audio_${this.table_id}_${this.username}_${this.instance}`,
      "audio",
      this.behindEffectsContainerRef,
      this.frontEffectsContainerRef,
      this.tableSocket
    );
  }

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

  reactionOccurred = (event: onReactionOccurredType) => {
    const { contentType, contentId } = event.header;
    const { reaction, reactionStyle } = event.data;

    if (
      contentType === "audio" &&
      contentId === `audio_${this.table_id}_${this.username}_${this.instance}`
    ) {
      this.reactController.handleReaction(reaction, false, reactionStyle);
    }
  };

  handleTableMessage = (event: IncomingTableMessages) => {
    switch (event.type) {
      case "reactionOccurred":
        this.reactionOccurred(event);
        break;
      default:
        break;
    }
  };
}

export default FgAudioElementContainerController;
