import {
  IncomingLiveTextEditingMessages,
  OutGoingLiveTextEditingMessages,
} from "./lib/typeConstant";

class LiveTextEditingSocketController {
  private ws: WebSocket | undefined;
  private messageListeners: Set<
    (message: IncomingLiveTextEditingMessages) => void
  > = new Set();

  constructor(
    private url: string,
    private tableId: string,
    private username: string,
    private instance: string,
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
    this.ws.binaryType = "arraybuffer";

    this.ws.onmessage = (event: MessageEvent) => {
      let message: IncomingLiveTextEditingMessages | undefined = undefined;

      if (event.data instanceof ArrayBuffer) {
        const buf = new Uint8Array(event.data);
        const view = new DataView(buf.buffer);

        // 1) Read first 4 bytes for JSON length
        const headerLen = view.getUint32(0, true);

        // 2) Slice out the JSON header
        const headerBytes = buf.subarray(4, 4 + headerLen);
        const headerText = new TextDecoder().decode(headerBytes);
        const header = JSON.parse(headerText);

        // 3) The rest of file chunk
        const fileBuffer = buf.subarray(4 + headerLen);

        switch (header.type) {
          case "docUpdated":
            message = {
              type: header.type,
              header: {
                contentId: header.header.contentId,
              },
              data: {
                payload: fileBuffer,
              },
            };
            break;
          case "initialDocResponded":
            message = {
              type: header.type,
              header: {
                contentId: header.header.contentId,
              },
              data: {
                payload: fileBuffer,
              },
            };
            break;
          default:
            return;
        }
      } else {
        if (typeof event.data === "string") {
          message = JSON.parse(event.data) as IncomingLiveTextEditingMessages;
        }
      }

      if (message)
        this.messageListeners.forEach((listener) => {
          listener(message);
        });
    };

    this.ws.onopen = () => {
      this.joinTable();
    };
    this.ws.onclose = (event) => {
      console.warn("WebSocket closed", event.code, event.reason);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  addMessageListener = (
    listener: (message: IncomingLiveTextEditingMessages) => void,
  ): void => {
    this.messageListeners.add(listener);
  };

  removeMessageListener = (
    listener: (message: IncomingLiveTextEditingMessages) => void,
  ): void => {
    this.messageListeners.delete(listener);
  };

  sendMessage = (message: OutGoingLiveTextEditingMessages) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const jsonStr = JSON.stringify(message);
      const encoder = new TextEncoder();
      const jsonBytes = encoder.encode(jsonStr);

      const messageBuffer = new Uint8Array(1 + jsonBytes.length);
      messageBuffer[0] = 0x00;
      messageBuffer.set(jsonBytes, 1);

      this.ws.send(messageBuffer);
    }
  };

  sendBinaryMessage = (type: string, header: object, data: Uint8Array) => {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // 1) Build the JSON header
    const headerObj = { type, header };
    const headerStr = JSON.stringify(headerObj);
    const encoder = new TextEncoder();
    const headerBytes = encoder.encode(headerStr);
    const headerLen = headerBytes.length;

    // 2) Allocate a buffer: 1 for prefix + 4 bytes for length + header + data
    const message = new Uint8Array(5 + headerLen + data.length);

    message[0] = 0x01;

    // 3) Write header length LE
    new DataView(message.buffer).setUint32(1, headerLen, true);

    // 4) Copy in the header bytes, then the data bytes
    message.set(headerBytes, 5);
    message.set(data, 5 + headerLen);

    this.ws.send(message);
  };

  joinTable = () => {
    this.sendMessage({
      type: "joinTable",
      header: {
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
      },
    });
  };

  leaveTable = () => {
    this.sendMessage({
      type: "leaveTable",
      header: {
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
      },
    });
  };

  getInitialDocState = (contentId: string) => {
    this.sendMessage({
      type: "getInitialDocState",
      header: {
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
        contentId,
      },
    });
  };

  docUpdate = (contentId: string, data: Uint8Array) => {
    this.sendBinaryMessage(
      "docUpdate",
      {
        tableId: this.tableId,
        contentId,
      },
      data,
    );
  };
}

export default LiveTextEditingSocketController;
