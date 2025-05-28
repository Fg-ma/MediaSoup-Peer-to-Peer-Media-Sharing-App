import { IncomingLiveTextEditingMessages } from "../../serverControllers/liveTextEditingServer/lib/typeConstant";
import TableTextMedia from "./TableTextMedia";
import LiveTextEditingSocketController from "../../serverControllers/liveTextEditingServer/LiveTextEditingSocketController";

class TableTextMediaInstance {
  saveState: "saved" | "unsaved" | "saving" = "saved";
  unsavedChanges = false;

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
        const { contentId, instanceId, lastOps } = msg.header;
        if (
          contentId !== this.textMedia.textId ||
          instanceId !== this.textInstanceId
        )
          return;

        const ops = msg.data.payload;

        if (ops.length !== 0 && ops[0].byteLength !== 0) {
          for (const op of ops) {
            this.ops.push(op);
          }
        }
        if (lastOps) {
          if (this.ops.length) this.saveState = "unsaved";
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
