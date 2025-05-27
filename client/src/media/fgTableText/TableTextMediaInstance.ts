import * as Y from "yjs";
import { IncomingLiveTextEditingMessages } from "../../serverControllers/liveTextEditingServer/lib/typeConstant";
import TableTextMedia from "./TableTextMedia";
import LiveTextEditingSocketController from "../../serverControllers/liveTextEditingServer/LiveTextEditingSocketController";

class TableTextMediaInstance {
  ops: Uint8Array<ArrayBuffer>[] = [];

  private positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  };

  constructor(
    public textMedia: TableTextMedia,
    public textInstanceId: string,
    public initPositioning: {
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    },
    private liveTextEditingSocket: React.MutableRefObject<
      LiveTextEditingSocketController | undefined
    >,
  ) {
    this.positioning = this.initPositioning;

    this.liveTextEditingSocket.current?.addMessageListener(
      this.messageListener,
    );
  }

  deconstructor = () => {
    this.liveTextEditingSocket.current?.removeMessageListener(
      this.messageListener,
    );
  };

  messageListener = (msg: IncomingLiveTextEditingMessages) => {
    switch (msg.type) {
      case "docSaved":
        break;
      case "docUpdated": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== this.textMedia.textId ||
          instanceId !== this.textInstanceId
        )
          return;

        this.ops.push(msg.data.payload);
        break;
      }
      case "initialDocResponded": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== this.textMedia.textId ||
          instanceId !== this.textInstanceId
        )
          return;

        if (msg.data.payload.byteLength !== 0) {
          this.ops.push(msg.data.payload);
        }
        break;
      }
      default:
        break;
    }
  };

  setPositioning = (positioning: {
    position: {
      left: number;
      top: number;
    };
    scale: {
      x: number;
      y: number;
    };
    rotation: number;
  }) => {
    this.positioning = positioning;
  };

  getPositioning = () => {
    return this.positioning;
  };

  saveText = () => {
    this.liveTextEditingSocket.current?.docSave(
      this.textMedia.textId,
      this.textInstanceId,
    );
  };
}

export default TableTextMediaInstance;
