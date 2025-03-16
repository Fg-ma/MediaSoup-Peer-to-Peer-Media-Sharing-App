import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
  defaultAudioEffectsStyles,
  defaultAudioStreamEffects,
  defaultVideoEffectsStyles,
  defaultVideoStreamEffects,
  ImageEffectStylesType,
  ImageEffectTypes,
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
import SvgMedia from "../../media/fgSvg/SvgMedia";
import TextMedia from "../../media/fgText/TextMedia";
import ApplicationMedia from "../../media/fgApplication/ApplicationMedia";
import {
  IncomingTableStaticContentMessages,
  onContentDeletedType,
  onRequestedCatchUpVideoPositionType,
  onRespondedCatchUpVideoPositionType,
  onResponsedCatchUpTableDataType,
  OutGoingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "./lib/typeConstant";
import { StaticContentTypes } from "../../../../universal/typeConstant";

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
    contentType: StaticContentTypes,
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
    contentType: StaticContentTypes,
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
    contentType: StaticContentTypes,
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
    contentType: StaticContentTypes,
    contentId: string,
    effects: {
      [effectType: string]: boolean;
    },
    effectStyles?:
      | VideoEffectStylesType
      | ImageEffectStylesType
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

  updateVideoPosition = (
    contentType: "video",
    contentId: string,
    videoPosition: number
  ) => {
    this.sendMessage({
      type: "updateVideoPosition",
      header: {
        table_id: this.table_id,
        contentType,
        contentId,
      },
      data: {
        videoPosition,
      },
    });
  };

  requestCatchUpVideoPosition = (contentType: "video", contentId: string) => {
    this.sendMessage({
      type: "requestCatchUpVideoPosition",
      header: {
        table_id: this.table_id,
        username: this.username,
        instance: this.instance,
        contentType,
        contentId,
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

  private onResponsedCatchUpTableData = (
    event: onResponsedCatchUpTableDataType
  ) => {
    const { images, svgs, videos, text, applications, audio } = event.data;

    if (videos) {
      for (const video of videos) {
        if (!this.userStreamEffects.current.video[video.videoId]) {
          this.userStreamEffects.current.video[video.videoId] = {
            video: structuredClone(defaultVideoStreamEffects),
            audio: structuredClone(defaultAudioStreamEffects),
          };
        }
        this.userStreamEffects.current.video[video.videoId].video =
          video.effects as { [effectType in VideoEffectTypes]: boolean };
        if (!this.userEffectsStyles.current.video[video.videoId]) {
          this.userEffectsStyles.current.video[video.videoId] = {
            video: structuredClone(defaultVideoEffectsStyles),
            audio: structuredClone(defaultAudioEffectsStyles),
          };
        }
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
          video.positioning,
          this.requestCatchUpVideoPosition
        );
      }
    }
    if (images) {
      for (const image of images) {
        this.userStreamEffects.current.image[image.imageId] = image.effects as {
          [effectType in ImageEffectTypes]: boolean;
        };
        this.userEffectsStyles.current.image[image.imageId] =
          image.effectStyles as ImageEffectStylesType;

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
    if (svgs) {
      for (const svg of svgs) {
        this.userMedia.current.svg[svg.svgId] = new SvgMedia(
          svg.svgId,
          svg.filename,
          svg.mimeType as TableTopStaticMimeType,
          svg.visible,
          this.userEffectsStyles,
          this.userStreamEffects,
          this.getFile,
          this.addMessageListener,
          this.removeMessageListener,
          svg.positioning
        );
      }
    }
    if (text) {
      for (const textItem of text) {
        this.userMedia.current.text[textItem.textId] = new TextMedia(
          textItem.textId,
          textItem.filename,
          textItem.mimeType as TableTopStaticMimeType,
          this.getFile,
          this.addMessageListener,
          this.removeMessageListener,
          textItem.positioning
        );
      }
    }
    if (applications) {
      for (const application of applications) {
        this.userStreamEffects.current.application[application.applicationId] =
          application.effects as {
            [effectType in ApplicationEffectTypes]: boolean;
          };
        this.userEffectsStyles.current.application[application.applicationId] =
          application.effectStyles as ApplicationEffectStylesType;

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

    if (
      this.userMedia.current[contentType] &&
      this.userMedia.current[contentType][contentId]
    ) {
      this.userMedia.current[contentType][contentId].deconstructor();
      delete this.userMedia.current[contentType][contentId];
    }
  };

  private onRequestedCatchUpVideoPosition = (
    event: onRequestedCatchUpVideoPositionType
  ) => {
    const { username, instance, contentType, contentId } = event.header;

    const currentVideoPosition =
      this.userMedia.current[contentType][contentId]?.video.currentTime;

    if (currentVideoPosition) {
      this.sendMessage({
        type: "responseCatchUpVideoPosition",
        header: {
          table_id: this.table_id,
          username,
          instance,
          contentType,
          contentId,
        },
        data: {
          currentVideoPosition,
        },
      });
    }
  };

  private onRespondedCatchUpVideoPosition = (
    event: onRespondedCatchUpVideoPositionType
  ) => {
    const { contentType, contentId } = event.header;
    const { currentVideoPosition } = event.data;

    if (this.userMedia.current[contentType][contentId])
      this.userMedia.current[contentType][contentId].video.currentTime =
        currentVideoPosition;
  };
}

export default TableStaticContentSocketController;
