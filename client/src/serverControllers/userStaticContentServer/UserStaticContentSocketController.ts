import { UserMediaType } from "../../context/mediaContext/typeConstant";
import {
  IncomingUserStaticContentMessages,
  onContentDeletedType,
  onContentStateChangedType,
  OutGoingUserStaticContentMessages,
} from "./lib/typeConstant";
import {
  StaticContentTypes,
  UserContentStateTypes,
} from "../../../../universal/contentTypeConstant";

class UserStaticContentSocketController {
  private ws: WebSocket | undefined;
  private messageListeners: Set<
    (message: IncomingUserStaticContentMessages) => void
  > = new Set();

  constructor(
    private url: string,
    private userId: string,
    private username: string,
    private instance: string,
    private userMedia: React.MutableRefObject<UserMediaType>,
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
      const message =
        typeof event.data === "string"
          ? (JSON.parse(event.data) as IncomingUserStaticContentMessages)
          : { type: undefined };

      this.handleMessage(message);

      this.messageListeners.forEach((listener) => {
        listener(message);
      });
    };

    this.ws.onopen = () => {
      this.sendMessage({
        type: "connect",
        header: {
          userId: this.userId,
          instance: this.instance,
        },
      });
    };
  };

  addMessageListener = (
    listener: (message: IncomingUserStaticContentMessages) => void,
  ): void => {
    this.messageListeners.add(listener);
  };

  removeMessageListener = (
    listener: (message: IncomingUserStaticContentMessages) => void,
  ): void => {
    this.messageListeners.delete(listener);
  };

  sendMessage = (message: OutGoingUserStaticContentMessages) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  };

  getFile = (
    contentType: StaticContentTypes,
    contentId: string,
    key: string,
  ) => {
    this.sendMessage({
      type: "getFile",
      header: {
        userId: this.userId,
        username: this.username,
        instance: this.instance,
        contentType,
        contentId,
      },
      data: { key },
    });
  };

  deleteContent = (
    contentType: StaticContentTypes,
    contentId: string,
    instanceId: string,
    filename: string,
  ) => {
    this.sendMessage({
      type: "deleteContent",
      header: {
        userId: this.userId,
        contentType,
        contentId,
        instanceId,
      },
      data: {
        filename,
      },
    });
  };

  changeContentState = (
    contentType: StaticContentTypes,
    contentId: string,
    state: UserContentStateTypes[],
  ) => {
    this.sendMessage({
      type: "changeContentState",
      header: {
        userId: this.userId,
        contentType,
        contentId,
      },
      data: {
        state,
      },
    });
  };

  searchUserContent = (
    contentType: StaticContentTypes | "all",
    name: string,
  ) => {
    this.sendMessage({
      type: "searchUserContentRequest",
      header: {
        userId: this.userId,
        username: this.username,
        instance: this.instance,
        contentType,
      },
      data: {
        name,
      },
    });
  };

  private handleMessage = (
    message: { type: undefined } | IncomingUserStaticContentMessages,
  ) => {
    switch (message.type) {
      case "contentDeleted":
        this.onContentDeleted(message);
        break;
      case "contentStateChanged":
        this.onContentStateChanged(message);
        break;
      default:
        break;
    }
  };

  private onContentDeleted = (event: onContentDeletedType) => {
    const { contentType, contentId } = event.header;

    if (this.userMedia.current[contentType].user[contentId]) {
      this.userMedia.current[contentType].user[contentId].deconstructor();
      delete this.userMedia.current[contentType].user[contentId];
    }
  };

  private onContentStateChanged = (event: onContentStateChangedType) => {
    const { contentType, contentId } = event.header;
    const { state } = event.data;

    this.userMedia.current[contentType].user[contentId].setState(state);
  };
}

export default UserStaticContentSocketController;
