import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
  AudioEffectTypes,
  ImageEffectStylesType,
  ImageEffectTypes,
  TextEffectStylesType,
  TextEffectTypes,
  UserEffectsStylesType,
  UserStreamEffectsType,
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../context/effectsContext/typeConstant";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import Deadbanding from "../../babylon/Deadbanding";
import UserDevice from "../../lib/UserDevice";
import VideoMedia from "../../media/fgVideo/VideoMedia";
import ImageMedia from "../../media/fgImage/ImageMedia";
import TextMedia from "../../media/fgText/TextMedia";
import ApplicationMedia from "../../media/fgApplication/ApplicationMedia";

export type TableTopStaticMimeType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "video/mp4"
  | "video/mpeg"
  | "image/gif"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type OutGoingTableStaticContentMessages =
  | onJoinTableType
  | onLeaveTableType
  | onRequestCatchUpTableDataType
  | onDeleteContentType
  | onGetFileType
  | onUpdateContentPositioningType
  | onUpdateContentEffectsType;

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

type onDeleteContentType = {
  type: "deleteContent";
  header: {
    table_id: string;
    contentType: TableContentTypes;
    contentId: string;
  };
  data: {
    filename: string;
  };
};

type onGetFileType = {
  type: "getFile";
  header: {
    table_id: string;
    username: string;
    instance: string;
    contentType: TableContentTypes;
    contentId: string;
  };
  data: { key: string };
};

type onUpdateContentPositioningType = {
  type: "updateContentPositioning";
  header: {
    table_id: string;
    contentType: TableContentTypes;
    contentId: string;
  };
  data: {
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
    };
  };
};

type onUpdateContentEffectsType = {
  type: "updateContentEffects";
  header: {
    table_id: string;
    contentType: TableContentTypes;
    contentId: string;
  };
  data: {
    effects: {
      [effectType: string]: boolean;
    };
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
      | TextEffectStylesType
      | ApplicationEffectStylesType;
  };
};

export type TableContentTypes =
  | "video"
  | "image"
  | "text"
  | "application"
  | "audio";

export type IncomingTableStaticContentMessages =
  | { type: undefined }
  | onOriginalVideoReadyType
  | onDashVideoReadyType
  | onImageReadyType
  | onChunkType
  | onDownloadCompleteType
  | onResponsedCatchUpTableDataType
  | onContentDeletedType;

export type onOriginalVideoReadyType = {
  type: "originalVideoReady";
  header: {
    videoId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
  };
};

export type onDashVideoReadyType = {
  type: "dashVideoReady";
  header: {
    videoId: string;
  };
  data: {
    filename: string;
  };
};

export type onImageReadyType = {
  type: "imageReady";
  header: {
    contentId: string;
  };
  data: {
    filename: string;
    mimeType: TableTopStaticMimeType;
  };
};

export type onChunkType = {
  type: "chunk";
  header: {
    contentType: TableContentTypes;
    contentId: string;
    key: string;
  };
  data: {
    chunk: { data: number[] };
  };
};

export type onDownloadCompleteType = {
  type: "downloadComplete";
  header: {
    contentType: TableContentTypes;
    contentId: string;
    key: string;
  };
};

export type onResponsedCatchUpTableDataType = {
  type: "responsedCatchUpTableData";
  data: {
    images:
      | {
          table_id: string;
          imageId: string;
          filename: string;
          mimeType: string;
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
          effects: { [effectType in ImageEffectTypes]: boolean };
          effectStyles: ImageEffectStylesType;
        }[]
      | undefined;
    videos:
      | {
          table_id: string;
          videoId: string;
          filename: string;
          mimeType: string;
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
          effects: { [effectType in VideoEffectTypes]: boolean };
          effectStyles: VideoEffectStylesType;
        }[]
      | undefined;
    text:
      | {
          table_id: string;
          textId: string;
          filename: string;
          mimeType: string;
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
          effects: { [effectType in TextEffectTypes]: boolean };
          effectStyles: TextEffectStylesType;
        }[]
      | undefined;
    audio:
      | {
          table_id: string;
          audioId: string;
          filename: string;
          mimeType: string;
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
          effects: { [effectType in AudioEffectTypes]: boolean };
        }[]
      | undefined;
    applications:
      | {
          table_id: string;
          applicationId: string;
          filename: string;
          mimeType: string;
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
          effects: { [effectType in ApplicationEffectTypes]: boolean };
          effectStyles: ApplicationEffectStylesType;
        }[]
      | undefined;
  };
};

export type onContentDeletedType = {
  type: "contentDeleted";
  header: {
    contentType: TableContentTypes;
    contentId: string;
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

  getFile = (
    contentType: TableContentTypes,
    contentId: string,
    key: string
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
    contentType: TableContentTypes,
    contentId: string,
    filename: string
  ) => {
    this.sendMessage({
      type: "deleteContent",
      header: {
        table_id: this.table_id,
        contentType: contentType,
        contentId: contentId,
      },
      data: {
        filename,
      },
    });
  };

  updateContentPositioning = (
    contentType: TableContentTypes,
    contentId: string,
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
    }
  ) => {
    this.sendMessage({
      type: "updateContentPositioning",
      header: {
        table_id: this.table_id,
        contentType,
        contentId,
      },
      data: {
        positioning,
      },
    });
  };

  updateContentEffects = (
    contentType: TableContentTypes,
    contentId: string,
    effects: {
      [effectType: string]: boolean;
    },
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
      | TextEffectStylesType
      | ApplicationEffectStylesType
  ) => {
    this.sendMessage({
      type: "updateContentEffects",
      header: {
        table_id: this.table_id,
        contentType,
        contentId,
      },
      data: {
        effects,
        effectStyles,
      },
    });
  };

  private handleMessage = (
    message: { type: undefined } | IncomingTableStaticContentMessages
  ) => {
    switch (message.type) {
      case "responsedCatchUpTableData":
        this.onResponsedCatchUpTableData(message);
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
    const { images, videos, text, applications, audio } = event.data;

    if (videos) {
      for (const video of videos) {
        this.userStreamEffects.current.video[video.videoId].video =
          video.effects as { [effectType in VideoEffectTypes]: boolean };
        this.userEffectsStyles.current.video[video.videoId].video =
          video.effectStyles as VideoEffectStylesType;

        this.userMedia.current.video[video.videoId] = new VideoMedia(
          video.videoId,
          video.filename,
          video.mimeType as TableTopStaticMimeType,
          this.userDevice,
          this.deadbanding,
          this.userEffectsStyles,
          this.userStreamEffects,
          this.userMedia,
          this.getFile,
          this.addMessageListener,
          this.removeMessageListener,
          video.positioning
        );
      }
    }
    if (images) {
      for (const image of images) {
        this.userStreamEffects.current.image[image.imageId] = image.effects as {
          [effectType in VideoEffectTypes]: boolean;
        };
        this.userEffectsStyles.current.image[image.imageId] =
          image.effectStyles as VideoEffectStylesType;

        this.userMedia.current.image[image.imageId] = new ImageMedia(
          image.imageId,
          image.filename,
          image.mimeType as TableTopStaticMimeType,
          this.userEffectsStyles,
          this.userStreamEffects,
          this.getFile,
          this.addMessageListener,
          this.removeMessageListener,
          this.userDevice,
          this.deadbanding,
          this.userMedia,
          image.positioning
        );
      }
    }
    if (text) {
      for (const textItem of text) {
        this.userStreamEffects.current.text[textItem.textId] =
          textItem.effects as {
            [effectType in VideoEffectTypes]: boolean;
          };
        this.userEffectsStyles.current.text[textItem.textId] =
          textItem.effectStyles as VideoEffectStylesType;

        this.userMedia.current.text[textItem.textId] = new TextMedia(
          textItem.textId,
          textItem.filename,
          textItem.mimeType as TableTopStaticMimeType,
          this.userEffectsStyles,
          this.userStreamEffects,
          this.getFile,
          this.addMessageListener,
          this.removeMessageListener,
          this.userDevice,
          this.userMedia,
          textItem.positioning
        );
      }
    }
    if (applications) {
      for (const application of applications) {
        this.userStreamEffects.current.application[application.applicationId] =
          application.effects as {
            [effectType in VideoEffectTypes]: boolean;
          };
        this.userEffectsStyles.current.application[application.applicationId] =
          application.effectStyles as VideoEffectStylesType;

        this.userMedia.current.application[application.applicationId] =
          new ApplicationMedia(
            application.applicationId,
            application.filename,
            application.mimeType as TableTopStaticMimeType,
            this.userEffectsStyles,
            this.userStreamEffects,
            this.getFile,
            this.addMessageListener,
            this.removeMessageListener,
            this.userDevice,
            this.userMedia,
            application.positioning
          );
      }
    }
  };

  private onContentDeleted = (event: onContentDeletedType) => {
    const { contentType, contentId } = event.header;

    if (this.userMedia.current[contentType][contentId]) {
      this.userMedia.current[contentType][contentId].deconstructor();
      delete this.userMedia.current[contentType][contentId];
    }
  };
}

export default TableStaticContentSocketController;
