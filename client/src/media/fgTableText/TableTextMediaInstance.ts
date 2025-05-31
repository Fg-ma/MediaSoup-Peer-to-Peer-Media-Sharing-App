import * as Y from "yjs";
import { IncomingLiveTextEditingMessages } from "../../serverControllers/liveTextEditingServer/lib/typeConstant";
import TableTextMedia, { TextListenerTypes } from "./TableTextMedia";
import LiveTextEditingSocketController from "../../serverControllers/liveTextEditingServer/LiveTextEditingSocketController";
import {
  defaultTextEffectsStyles,
  StaticContentEffectsStylesType,
} from "../../../../universal/effectsTypeConstant";

export type TextInstanceListenerTypes =
  | { type: "initialized" }
  | { type: "saved" };

class TableTextMediaInstance {
  initializingState: "initializing" | "initialized" = "initializing";
  saveState: "saved" | "unsaved" | "saving" | "failed" = "saved";
  unsavedChanges = false;

  ydoc = new Y.Doc();
  yText = this.ydoc.getText("monaco");

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

  private textInstanceListeners: Set<
    (message: TextInstanceListenerTypes) => void
  > = new Set();

  private lastSavedOps: Uint8Array[] = [];
  private saveOnDownload = false;

  constructor(
    public textMedia: TableTextMedia,
    private staticContentEffectsStyles: React.MutableRefObject<StaticContentEffectsStylesType>,
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
    if (!this.staticContentEffectsStyles.current.text[this.textInstanceId]) {
      this.staticContentEffectsStyles.current.text[this.textInstanceId] =
        structuredClone(defaultTextEffectsStyles);
    }

    this.positioning = this.initPositioning;

    this.textMedia.addTextListener(this.handleTextMessage);

    this.liveTextEditingSocket.current?.addMessageListener(
      this.messageListener,
    );

    if (this.textMedia.textData) {
      Y.applyUpdate(this.ydoc, this.textMedia.textData);

      this.liveTextEditingSocket.current?.getInitialDocState(
        this.textMedia.textId,
        this.textInstanceId,
      );
    }
  }

  deconstructor = () => {
    this.textMedia.removeTextListener(this.handleTextMessage);
    this.liveTextEditingSocket.current?.removeMessageListener(
      this.messageListener,
    );
  };

  handleTextMessage = (msg: TextListenerTypes) => {
    switch (msg.type) {
      case "downloadComplete":
        if (!this.textMedia.textData) return;

        if (!this.saveOnDownload) {
          Y.applyUpdate(this.ydoc, this.textMedia.textData);

          this.liveTextEditingSocket.current?.getInitialDocState(
            this.textMedia.textId,
            this.textInstanceId,
          );
        } else {
          this.saveOnDownload = false;

          if (this.lastSavedOps.length === 0) {
            this.liveTextEditingSocket.current?.getSavedOps(
              this.textMedia.textId,
              this.textInstanceId,
            );
            return;
          }

          if (this.ydoc) {
            this.ydoc.destroy();
          }

          this.ydoc = new Y.Doc();
          this.yText = this.ydoc.getText("monaco");

          Y.applyUpdate(this.ydoc, this.textMedia.textData);
          for (const op of this.lastSavedOps) {
            Y.applyUpdate(this.ydoc, op);
          }

          const state = Y.encodeStateAsUpdate(this.ydoc);
          this.textMedia.textData = state;

          this.lastSavedOps.length = 0;

          this.liveTextEditingSocket.current?.getInitialDocState(
            this.textMedia.textId,
            this.textInstanceId,
          );

          this.textInstanceListeners.forEach((listener) => {
            listener({ type: "saved" });
          });
        }
        break;
      default:
        break;
    }
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

        const payload = msg.data.payload;
        Y.applyUpdate(this.ydoc, payload);

        if (this.saveState !== "saving") {
          this.saveState = "unsaved";
        }
        this.unsavedChanges = true;
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
            Y.applyUpdate(this.ydoc, op, "noup");
          }
        }
        if (lastOps && ops.length) {
          this.saveState = "unsaved";
        }
        if (lastOps || ops.length === 0) {
          this.initializingState = "initialized";

          this.textInstanceListeners.forEach((listener) => {
            listener({ type: "initialized" });
          });
        }
        break;
      }
      case "docSaved": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== this.textMedia.textId ||
          instanceId !== this.textInstanceId
        )
          return;

        if (!this.textMedia.textData) {
          this.saveOnDownload = true;
          return;
        }
        if (this.lastSavedOps.length === 0) {
          this.liveTextEditingSocket.current?.getSavedOps(
            this.textMedia.textId,
            this.textInstanceId,
          );
          return;
        }

        if (this.ydoc) {
          this.ydoc.destroy();
        }

        this.ydoc = new Y.Doc();
        this.yText = this.ydoc.getText("monaco");

        Y.applyUpdate(this.ydoc, this.textMedia.textData);
        for (const op of this.lastSavedOps) {
          Y.applyUpdate(this.ydoc, op);
        }

        const state = Y.encodeStateAsUpdate(this.ydoc);
        this.textMedia.textData = state;

        this.lastSavedOps.length = 0;

        this.liveTextEditingSocket.current?.getInitialDocState(
          this.textMedia.textId,
          this.textInstanceId,
        );

        this.textInstanceListeners.forEach((listener) => {
          listener({ type: "saved" });
        });
        break;
      }
      case "docSavedNewContent": {
        const { newContentId, instanceId } = msg.header;
        if (
          newContentId !== this.textMedia.textId ||
          instanceId !== this.textInstanceId
        )
          return;

        if (!this.textMedia.textData) {
          this.saveOnDownload = true;
          return;
        }
        if (this.lastSavedOps.length === 0) {
          this.liveTextEditingSocket.current?.getSavedOps(
            this.textMedia.textId,
            this.textInstanceId,
          );
          return;
        }

        if (this.ydoc) {
          this.ydoc.destroy();
        }

        this.ydoc = new Y.Doc();
        this.yText = this.ydoc.getText("monaco");

        Y.applyUpdate(this.ydoc, this.textMedia.textData);
        for (const op of this.lastSavedOps) {
          Y.applyUpdate(this.ydoc, op);
        }

        const state = Y.encodeStateAsUpdate(this.ydoc);
        this.textMedia.textData = state;

        this.lastSavedOps.length = 0;

        this.liveTextEditingSocket.current?.getInitialDocState(
          this.textMedia.textId,
          this.textInstanceId,
        );

        this.textInstanceListeners.forEach((listener) => {
          listener({ type: "saved" });
        });
        break;
      }
      case "savedOps": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== this.textMedia.textId ||
          instanceId !== this.textInstanceId
        )
          return;

        const ops = msg.data.payload;
        this.lastSavedOps.push(...ops);
        break;
      }
      case "getSavedOpsResponse": {
        const { contentId, instanceId, lastOps } = msg.header;
        if (
          contentId !== this.textMedia.textId ||
          instanceId !== this.textInstanceId
        )
          return;

        const ops = msg.data.payload;
        this.lastSavedOps.push(...ops);

        if (lastOps && this.textMedia.textData) {
          if (this.ydoc) {
            this.ydoc.destroy();
          }

          this.ydoc = new Y.Doc();
          this.yText = this.ydoc.getText("monaco");

          Y.applyUpdate(this.ydoc, this.textMedia.textData);
          for (const op of this.lastSavedOps) {
            Y.applyUpdate(this.ydoc, op);
          }

          const state = Y.encodeStateAsUpdate(this.ydoc);
          this.textMedia.textData = state;

          this.lastSavedOps.length = 0;

          this.liveTextEditingSocket.current?.getInitialDocState(
            this.textMedia.textId,
            this.textInstanceId,
          );

          this.textInstanceListeners.forEach((listener) => {
            listener({ type: "saved" });
          });
        }
        break;
      }
      case "docSavedFail": {
        const { contentId, instanceId } = msg.header;
        if (
          contentId !== this.textMedia.textId &&
          instanceId !== this.textInstanceId
        )
          return;

        this.unsavedChanges = this.saveState === "saving";
        this.saveState = "failed";
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

  addTextInstanceListener = (
    listener: (message: TextInstanceListenerTypes) => void,
  ): void => {
    this.textInstanceListeners.add(listener);
  };

  removeTextInstanceListener = (
    listener: (message: TextInstanceListenerTypes) => void,
  ): void => {
    this.textInstanceListeners.delete(listener);
  };
}

export default TableTextMediaInstance;
