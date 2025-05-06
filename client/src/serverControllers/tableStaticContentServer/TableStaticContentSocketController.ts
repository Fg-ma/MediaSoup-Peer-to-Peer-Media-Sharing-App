import {
  ApplicationEffectStylesType,
  ImageEffectStylesType,
  SvgEffectStylesType,
  VideoEffectStylesType,
} from "../../../../universal/effectsTypeConstant";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import {
  IncomingTableStaticContentMessages,
  onContentDeletedType,
  onContentStateChangedType,
  onRequestedCatchUpVideoPositionType,
  onRespondedCatchUpVideoPositionType,
  OutGoingTableStaticContentMessages,
} from "./lib/typeConstant";
import {
  TableContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";

class TableStaticContentSocketController {
  private ws: WebSocket | undefined;
  private messageListeners: Set<
    (message: IncomingTableStaticContentMessages) => void
  > = new Set();

  constructor(
    private url: string,
    private tableId: string,
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
          ? (JSON.parse(event.data) as IncomingTableStaticContentMessages)
          : { type: undefined };

      this.handleMessage(message);

      this.messageListeners.forEach((listener) => {
        listener(message);
      });
    };

    this.ws.onopen = () => {
      this.joinTable();

      this.sendMessage({
        type: "requestCatchUpTableData",
        header: {
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
        },
      });
    };
  };

  addMessageListener = (
    listener: (message: IncomingTableStaticContentMessages) => void,
  ): void => {
    this.messageListeners.add(listener);
  };

  removeMessageListener = (
    listener: (message: IncomingTableStaticContentMessages) => void,
  ): void => {
    this.messageListeners.delete(listener);
  };

  sendMessage = (message: OutGoingTableStaticContentMessages) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
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

  getFile = (
    contentType: StaticContentTypes,
    contentId: string,
    key: string,
  ) => {
    this.sendMessage({
      type: "getFile",
      header: {
        tableId: this.tableId,
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
  ) => {
    this.sendMessage({
      type: "deleteContent",
      header: {
        tableId: this.tableId,
        contentType,
        contentId,
        instanceId,
      },
    });
  };

  updateContentPositioning = (
    contentType: StaticContentTypes,
    contentId: string,
    instanceId: string,
    positioning: {
      position?: {
        left: number;
        top: number;
      };
      scale?: {
        x: number;
        y: number;
      };
      rotation?: number;
    },
  ) => {
    this.sendMessage({
      type: "updateContentPositioning",
      header: {
        tableId: this.tableId,
        contentType,
        contentId,
        instanceId,
      },
      data: {
        positioning,
      },
    });
  };

  updateContentEffects = (
    contentType: StaticContentTypes,
    contentId: string,
    instanceId: string,
    effects: {
      [effectType: string]: boolean;
    },
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
      | ApplicationEffectStylesType
      | SvgEffectStylesType,
  ) => {
    this.sendMessage({
      type: "updateContentEffects",
      header: {
        tableId: this.tableId,
        contentType,
        contentId,
        instanceId,
      },
      data: {
        effects,
        effectStyles,
      },
    });
  };

  changeContentState = (
    contentType: StaticContentTypes,
    contentId: string,
    state: TableContentStateTypes[],
  ) => {
    this.sendMessage({
      type: "changeContentState",
      header: {
        tableId: this.tableId,
        contentType,
        contentId,
      },
      data: {
        state,
      },
    });
  };

  updateVideoPosition = (
    contentType: "video",
    contentId: string,
    instanceId: string,
    videoPosition: number,
  ) => {
    this.sendMessage({
      type: "updateVideoPosition",
      header: {
        tableId: this.tableId,
        contentType,
        contentId,
        instanceId,
      },
      data: {
        videoPosition,
      },
    });
  };

  requestCatchUpVideoPosition = (
    contentType: "video",
    contentId: string,
    instanceId: string,
  ) => {
    this.sendMessage({
      type: "requestCatchUpVideoPosition",
      header: {
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
        contentType,
        contentId,
        instanceId,
      },
    });
  };

  createNewInstances = (
    updates: {
      contentType: StaticContentTypes;
      contentId: string;
      instances: {
        instanceId: string;
        positioning: {
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
      }[];
    }[],
  ) => {
    this.sendMessage({
      type: "createNewInstances",
      header: {
        tableId: this.tableId,
      },
      data: {
        updates,
      },
    });
  };

  searchTabledContent = (
    contentType: StaticContentTypes | "all",
    name: string,
  ) => {
    this.sendMessage({
      type: "searchTabledContentRequest",
      header: {
        tableId: this.tableId,
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
    message: { type: undefined } | IncomingTableStaticContentMessages,
  ) => {
    switch (message.type) {
      case "contentDeleted":
        this.onContentDeleted(message);
        break;
      case "contentStateChanged":
        this.onContentStateChanged(message);
        break;
      case "requestedCatchUpVideoPosition":
        this.onRequestedCatchUpVideoPosition(message);
        break;
      case "respondedCatchUpVideoPosition":
        this.onRespondedCatchUpVideoPosition(message);
        break;
      default:
        break;
    }
  };

  private onContentDeleted = (event: onContentDeletedType) => {
    const { contentType, contentId, instanceId } = event.header;

    if (this.userMedia.current[contentType].tableInstances[instanceId]) {
      this.userMedia.current[contentType].tableInstances[
        instanceId
      ].deconstructor();
      delete this.userMedia.current[contentType].tableInstances[instanceId];
    }

    if (
      Object.keys(this.userMedia.current[contentType].tableInstances).length ===
        0 &&
      this.userMedia.current[contentType].table[contentId] &&
      !this.userMedia.current[contentType].table[contentId].state.includes(
        "tabled",
      )
    ) {
      this.userMedia.current[contentType].table[contentId].deconstructor();
      delete this.userMedia.current[contentType].table[contentId];
    }
  };

  private onContentStateChanged = (event: onContentStateChangedType) => {
    const { contentType, contentId } = event.header;
    const { state } = event.data;

    this.userMedia.current[contentType].table[contentId].setState(state);
  };

  private onRequestedCatchUpVideoPosition = (
    event: onRequestedCatchUpVideoPositionType,
  ) => {
    const { username, instance, contentType, contentId, instanceId } =
      event.header;

    const currentVideoPosition =
      this.userMedia.current[contentType].tableInstances[instanceId]
        ?.instanceVideo?.currentTime;

    if (currentVideoPosition) {
      this.sendMessage({
        type: "responseCatchUpVideoPosition",
        header: {
          tableId: this.tableId,
          username,
          instance,
          contentType,
          contentId,
          instanceId,
        },
        data: {
          currentVideoPosition,
        },
      });
    }
  };

  private onRespondedCatchUpVideoPosition = (
    event: onRespondedCatchUpVideoPositionType,
  ) => {
    const { contentType, instanceId } = event.header;
    const { currentVideoPosition } = event.data;

    if (
      this.userMedia.current[contentType].tableInstances[instanceId] &&
      this.userMedia.current[contentType].tableInstances[instanceId]
        .instanceVideo
    )
      this.userMedia.current[contentType].tableInstances[
        instanceId
      ].instanceVideo.currentTime = currentVideoPosition;
  };
}

export default TableStaticContentSocketController;
