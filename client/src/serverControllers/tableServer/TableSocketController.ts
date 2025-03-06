import {
  ContentTypes,
  TableReactions,
  TableReactionStyles,
} from "../../../../universal/typeConstant";
import { FgBackground } from "../../elements/fgBackgroundSelector/lib/typeConstant";
import {
  IncomingTableMessages,
  OutGoingTableMessages,
} from "./lib/typeConstant";

class TableSocketController {
  private ws: WebSocket | undefined;
  private messageListeners: Set<(message: IncomingTableMessages) => void> =
    new Set();

  constructor(
    private url: string,
    private table_id: string,
    private username: string,
    private instance: string
  ) {
    this.connect(this.url);
  }

  deconstructor = () => {
    if (this.ws) {
      this.ws.close();
      this.ws.onmessage = null;
      this.ws.onopen = null;
      this.ws.onclose = null;
      this.ws.onerror = null;

      this.ws = undefined;
    }

    this.messageListeners.clear();
  };

  private connect = (url: string) => {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event: MessageEvent) => {
      this.messageListeners.forEach((listener) => {
        const message = JSON.parse(event.data);

        listener(message as IncomingTableMessages);
      });
    };

    this.ws.onopen = () => {
      this.joinTable();
    };
  };

  addMessageListener = (
    listener: (message: IncomingTableMessages) => void
  ): void => {
    this.messageListeners.add(listener);
  };

  removeMessageListener = (
    listener: (message: IncomingTableMessages) => void
  ): void => {
    this.messageListeners.delete(listener);
  };

  sendMessage = (message: OutGoingTableMessages) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  };

  joinTable = () => {
    this.sendMessage({
      type: "joinTable",
      header: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
      },
    });
  };

  leaveTable = () => {
    this.sendMessage({
      type: "leaveTable",
      header: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
      },
    });
  };

  changeTableBackground = (background: FgBackground) => {
    this.sendMessage({
      type: "changeTableBackground",
      header: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
      },
      data: { background },
    });
  };

  moveSeats = (direction: "left" | "right", username: string) => {
    this.sendMessage({
      type: "moveSeats",
      header: {
        table_id: this.table_id,
        username,
      },
      data: { direction },
    });
  };

  swapSeats = (targetUsername: string) => {
    if (targetUsername === this.username) return;

    this.sendMessage({
      type: "swapSeats",
      header: {
        table_id: this.table_id,
        username: this.username,
        targetUsername,
      },
    });
  };

  kickFromTable = (targetUsername: string) => {
    if (targetUsername === this.username) return;

    this.sendMessage({
      type: "kickFromTable",
      header: {
        table_id: this.table_id,
        username: this.username,
        targetUsername,
      },
    });
  };

  reaction = (
    contentType: ContentTypes,
    contentId: string,
    reaction: TableReactions,
    reactionStyle: TableReactionStyles
  ) => {
    this.sendMessage({
      type: "reaction",
      header: {
        table_id: this.table_id,
        contentType,
        contentId,
      },
      data: { reaction, reactionStyle },
    });
  };
}

export default TableSocketController;
