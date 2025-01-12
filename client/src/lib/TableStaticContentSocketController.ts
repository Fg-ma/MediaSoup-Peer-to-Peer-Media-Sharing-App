import {
  UserEffectsStylesType,
  UserStreamEffectsType,
} from "../context/effectsContext/typeConstant";
import { UserMediaType } from "../context/mediaContext/typeConstant";
import Deadbanding from "../babylon/Deadbanding";
import UserDevice from "./UserDevice";
import VideoMedia from "./VideoMedia";

type OutGoingTableStaticContentMessages =
  | onJoinTableType
  | onLeaveTableType
  | onRequestCatchUpTableDataType
  | onRequestCatchUpContentDataType
  | onDeleteContentType
  | onCatchUpContentDataResponseType;

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

type onRequestCatchUpTableDataType = {
  type: "requestCatchUpTableData";
  header: {
    table_id: string;
    username: string;
    instance: string;
  };
};

type onRequestCatchUpContentDataType = {
  type: "requestCatchUpContentData";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    contentType: TableContentTypes;
    contentId: string;
  };
};

type onDeleteContentType = {
  type: "deleteContent";
  header: {
    table_id: string;
    contentType: TableContentTypes;
    contentId: string;
  };
};

type onCatchUpContentDataResponseType = {
  type: "catchUpContentDataResponse";
  header: {
    table_id: string;
    inquiringUsername: string;
    inquiringInstance: string;
    contentType: TableContentTypes;
    contentId: string;
  };
  data: {
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
    videoTime: number;
    timeMeasured: number;
  };
};

export type TableContentTypes = "video";

export type IncomingTableStaticContentMessages =
  | onOriginalVideoReadyType
  | onDashVideoReadyType
  | onResponsedCatchUpTableDataType
  | onRequestedCatchUpContentDataType
  | onContentDeletedType
  | onCatchUpContentDataRespondedType;

export type onOriginalVideoReadyType = {
  type: "originalVideoReady";
  header: {
    videoId: string;
  };
  data: {
    filename: string;
    url: string;
  };
};

export type onDashVideoReadyType = {
  type: "dashVideoReady";
  header: {
    videoId: string;
  };
  data: {
    filename: string;
    url: string;
  };
};

export type onResponsedCatchUpTableDataType = {
  type: "responsedCatchUpTableData";
  data: {
    [tableContentType in TableContentTypes]?: {
      [contentId: string]: {
        originalURL: string | undefined;
        dashURL: string | undefined;
      };
    };
  };
};

export type onRequestedCatchUpContentDataType = {
  type: "requestedCatchUpContentData";
  header: {
    inquiringUsername: string;
    inquiringInstance: string;
    contentType: TableContentTypes;
    contentId: string;
  };
};

export type onContentDeletedType = {
  type: "contentDeleted";
  header: {
    contentType: TableContentTypes;
    contentId: string;
  };
};

export type onCatchUpContentDataRespondedType = {
  type: "catchUpContentDataResponded";
  header: {
    contentType: TableContentTypes;
    contentId: string;
  };
  data: {
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
    videoTime: number;
    timeMeasured: number;
  };
};

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
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userDevice: UserDevice,
    private deadbanding: Deadbanding
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
        const message = JSON.parse(
          event.data
        ) as IncomingTableStaticContentMessages;

        this.handleMessage(message);

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
    listener: (message: IncomingTableStaticContentMessages) => void
  ): void => {
    this.messageListeners.add(listener);
  };

  removeMessageListener = (
    listener: (message: IncomingTableStaticContentMessages) => void
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

  deleteContent = (contentType: TableContentTypes, contentId: string) => {
    this.sendMessage({
      type: "deleteContent",
      header: {
        table_id: this.table_id,
        contentType: contentType,
        contentId: contentId,
      },
    });
  };

  requestCatchUpContentData = (
    contentType: TableContentTypes,
    contentId: string
  ) => {
    this.sendMessage({
      type: "requestCatchUpContentData",
      header: {
        table_id: this.table_id,
        inquiringUsername: this.username,
        inquiringInstance: this.instance,
        contentType,
        contentId,
      },
    });
  };

  catchUpContentDataResponse = (
    inquiringUsername: string,
    inquiringInstance: string,
    contentType: TableContentTypes,
    contentId: string,
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
    },
    videoTime: number,
    timeMeasured: number
  ) => {
    this.sendMessage({
      type: "catchUpContentDataResponse",
      header: {
        table_id: this.table_id,
        inquiringUsername,
        inquiringInstance,
        contentType,
        contentId,
      },
      data: {
        positioning,
        videoTime,
        timeMeasured,
      },
    });
  };

  private handleMessage = (message: IncomingTableStaticContentMessages) => {
    switch (message.type) {
      case "responsedCatchUpTableData":
        this.onResponsedCatchUpTableData(message);
        break;
      case "requestedCatchUpContentData":
        this.onRequestedCatchUpContentData(message);
        break;
      case "contentDeleted":
        this.onContentDeleted(message);
        break;
      default:
        break;
    }
  };

  private onResponsedCatchUpTableData = (
    event: onResponsedCatchUpTableDataType
  ) => {
    const tableContent = event.data;
    for (const contentType in tableContent) {
      for (const contentId in tableContent[contentType as TableContentTypes]) {
        const tableContentData =
          tableContent[contentType as TableContentTypes]?.[contentId];
        if (tableContentData) {
          if (contentType === "video") {
            if (tableContentData.originalURL) {
              this.userMedia.current.video[contentId] = new VideoMedia(
                contentId,
                this.getFilename(tableContentData.originalURL),
                tableContentData.originalURL,
                this.userDevice,
                this.deadbanding,
                this.userEffectsStyles,
                this.userStreamEffects,
                this.userMedia,
                tableContentData.dashURL
              );
            }
          }
        }
      }
    }
  };

  private onRequestedCatchUpContentData = (
    event: onRequestedCatchUpContentDataType
  ) => {
    const { inquiringUsername, inquiringInstance } = event.header;
  };

  private onContentDeleted = (event: onContentDeletedType) => {
    const { contentType, contentId } = event.header;

    if (this.userMedia.current[contentType][contentId]) {
      this.userMedia.current[contentType][contentId].deconstructor();
      delete this.userMedia.current[contentType][contentId];
    }
  };

  private getFilename = (input: string): string => {
    const lastSlashIndex = input.lastIndexOf("/");
    if (lastSlashIndex === -1) {
      return input;
    }
    return input.substring(lastSlashIndex + 1);
  };
}

export default TableStaticContentSocketController;
