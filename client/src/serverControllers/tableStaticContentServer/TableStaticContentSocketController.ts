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
  ContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";

class TableStaticContentSocketController {
  private ws: WebSocket | undefined;
  private messageListeners: Set<
    (message: IncomingTableStaticContentMessages) => void
  > = new Set();

  constructor(
    private url: string,
    private table_id: string,
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
          table_id: this.table_id,
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

  getFile = (
    contentType: StaticContentTypes,
    contentId: string,
    key: string,
  ) => {
    this.sendMessage({
      type: "getFile",
      header: {
        table_id: this.table_id,
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
        table_id: this.table_id,
        contentType,
        contentId,
        instanceId,
      },
      data: {
        filename,
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
        table_id: this.table_id,
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
        table_id: this.table_id,
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
    state: ContentStateTypes[],
  ) => {
    this.sendMessage({
      type: "changeContentState",
      header: {
        table_id: this.table_id,
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
        table_id: this.table_id,
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
        table_id: this.table_id,
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
        table_id: this.table_id,
      },
      data: {
        updates,
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

    if (
      this.userMedia.current[contentType] &&
      this.userMedia.current[contentType].instances[instanceId]
    ) {
      this.userMedia.current[contentType].instances[instanceId].deconstructor();
      delete this.userMedia.current[contentType].instances[instanceId];
    }

    if (
      this.userMedia.current[contentType] &&
      Object.keys(this.userMedia.current[contentType].instances).length === 0 &&
      this.userMedia.current[contentType].all[contentId] &&
      !this.userMedia.current[contentType].all[contentId].state.includes(
        "tabled",
      ) &&
      !this.userMedia.current[contentType].all[contentId].state.includes(
        "muteStyle",
      )
    ) {
      this.userMedia.current[contentType].all[contentId].deconstructor();
      delete this.userMedia.current[contentType].all[contentId];
    }
  };

  private onContentStateChanged = (event: onContentStateChangedType) => {
    const { contentType, contentId } = event.header;
    const { state } = event.data;

    this.userMedia.current[contentType].all[contentId].setState(state);
  };

  private onRequestedCatchUpVideoPosition = (
    event: onRequestedCatchUpVideoPositionType,
  ) => {
    const { username, instance, contentType, contentId, instanceId } =
      event.header;

    const currentVideoPosition =
      this.userMedia.current[contentType].instances[instanceId]?.instanceVideo
        ?.currentTime;

    if (currentVideoPosition) {
      this.sendMessage({
        type: "responseCatchUpVideoPosition",
        header: {
          table_id: this.table_id,
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
      this.userMedia.current[contentType].instances[instanceId] &&
      this.userMedia.current[contentType].instances[instanceId].instanceVideo
    )
      this.userMedia.current[contentType].instances[
        instanceId
      ].instanceVideo.currentTime = currentVideoPosition;
  };
}

export default TableStaticContentSocketController;
