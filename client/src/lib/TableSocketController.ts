import { FgBackground } from "../fgElements/fgBackgroundSelector/lib/typeConstant";

type OutGoingTableMessages =
  | onJoinTableType
  | onLeaveTableType
  | onChangeTableBackgroundType;

type onJoinTableType = {
  type: "joinTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

type onLeaveTableType = {
  type: "leaveTable";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

type onChangeTableBackgroundType = {
  type: "changeTableBackground";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
  data: { background: FgBackground };
};

export type IncomingTableMessages = onTableBackgroundChangedType;

type onTableBackgroundChangedType = {
  type: "tableBackgroundChanged";
  data: { background: FgBackground };
};

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
}

export default TableSocketController;
