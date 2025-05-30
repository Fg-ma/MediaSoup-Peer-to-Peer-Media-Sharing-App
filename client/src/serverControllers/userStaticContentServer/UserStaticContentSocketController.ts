import { StaticContentMediaType } from "../../context/mediaContext/lib/typeConstant";
import {
  IncomingUserStaticContentMessages,
  onApplicationUploadedToUserContentType,
  onContentDeletedType,
  onContentStateChangedType,
  onImageUploadedToUserContentType,
  onMuteStylesResponseType,
  onSoundClipUploadedToUserContentType,
  onSvgUploadedToUserContentType,
  onTextUploadedToUserContentType,
  onVideoUploadedToUserContentType,
  OutGoingUserStaticContentMessages,
} from "./lib/typeConstant";
import {
  StaticContentTypes,
  UserContentStateTypes,
} from "../../../../universal/contentTypeConstant";
import UserApplicationMedia from "../../media/fgUserApplication /UserApplicationMedia";
import UserImageMedia from "../../media/fgUserImage/UserImageMedia";
import UserSoundClipMedia from "../../media/fgUserSoundClip/UserSoundClipMedia";
import UserSvgMedia from "../../media/fgUserSvg/UserSvgMedia";
import UserTextMedia from "../../media/fgUserText/UserTextMedia";
import UserVideoMedia from "../../media/fgUserVideo/UserVideoMedia";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import Downloader from "../../tools/downloader/Downloader";

class UserStaticContentSocketController {
  private ws: WebSocket | undefined;
  private messageListeners: Set<
    (message: IncomingUserStaticContentMessages) => void
  > = new Set();

  constructor(
    private url: string,
    private userId: string,
    private instance: string,
    private staticContentMedia: React.MutableRefObject<StaticContentMediaType>,
    private userStaticContentSocket: React.MutableRefObject<
      UserStaticContentSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private addCurrentDownload: (id: string, upload: Downloader) => void,
    private removeCurrentDownload: (id: string) => void,
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
      let message: IncomingUserStaticContentMessages;

      if (event.data instanceof ArrayBuffer) {
        const buf = new Uint8Array(event.data);
        const view = new DataView(buf.buffer);

        // 1) Read first 4 bytes for JSON length
        const headerLen = view.getUint32(0);

        // 2) Slice out the JSON header
        const headerBytes = buf.subarray(4, 4 + headerLen);
        const headerText = new TextDecoder().decode(headerBytes);
        const header = JSON.parse(headerText);

        // 3) The rest is your file chunk
        const fileBuffer = buf.subarray(4 + headerLen);

        switch (header.type) {
          case "oneShotDownload":
            message = {
              type: header.type,
              header: {
                contentType: header.header.contentType,
                contentId: header.header.contentId,
              },
              data: {
                buffer: fileBuffer,
              },
            };
            break;
          case "chunk":
            message = {
              type: header.type,
              header: {
                contentType: header.header.contentType,
                contentId: header.header.contentId,
                range: header.header.range,
              },
              data: {
                chunk: fileBuffer,
              },
            };
            break;
          default:
            return;
        }
      } else {
        message =
          typeof event.data === "string"
            ? (JSON.parse(event.data) as IncomingUserStaticContentMessages)
            : { type: undefined };
      }

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

  getFile = (contentType: StaticContentTypes, contentId: string) => {
    this.sendMessage({
      type: "getDownloadMeta",
      header: {
        userId: this.userId,
        instance: this.instance,
        contentType,
        contentId,
      },
    });
  };

  getChunk = (
    contentType: StaticContentTypes,
    contentId: string,
    range: string,
  ) => {
    this.sendMessage({
      type: "getFileChunk",
      header: {
        userId: this.userId,
        instance: this.instance,
        contentType,
        contentId,
      },
      data: { range },
    });
  };

  deleteContent = (contentType: StaticContentTypes, contentId: string) => {
    this.sendMessage({
      type: "deleteContent",
      header: {
        userId: this.userId,
        contentType,
        contentId,
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
        instance: this.instance,
        contentType,
      },
      data: {
        name,
      },
    });
  };

  requestMuteStyles = () => {
    this.sendMessage({
      type: "muteStylesRequest",
      header: {
        userId: this.userId,
        instance: this.instance,
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
      case "applicationUploadedToUserContent":
        this.onApplicationUploadedToUserContent(message);
        break;
      case "imageUploadedToUserContent":
        this.onImageUploadedToUserContent(message);
        break;
      case "soundClipUploadedToUserContent":
        this.onSoundClipUploadedToUserContent(message);
        break;
      case "svgUploadedToUserContent":
        this.onSvgUploadedToUserContent(message);
        break;
      case "textUploadedToUserContent":
        this.onTextUploadedToUserContent(message);
        break;
      case "videoUploadedToUserContent":
        this.onVideoUploadedToUserContent(message);
        break;
      case "muteStylesResponse":
        this.onMuteStylesResponse(message);
        break;
      default:
        break;
    }
  };

  private onApplicationUploadedToUserContent = (
    event: onApplicationUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.staticContentMedia.current.application.user[contentId] =
      new UserApplicationMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.userStaticContentSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );
  };

  private onImageUploadedToUserContent = (
    event: onImageUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.staticContentMedia.current.image.user[contentId] = new UserImageMedia(
      contentId,
      filename,
      mimeType,
      state,
      this.userStaticContentSocket,
      this.sendDownloadSignal,
      this.addCurrentDownload,
      this.removeCurrentDownload,
    );
  };

  private onSoundClipUploadedToUserContent = (
    event: onSoundClipUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.staticContentMedia.current.soundClip.user[contentId] =
      new UserSoundClipMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.userStaticContentSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );
  };

  private onSvgUploadedToUserContent = (
    event: onSvgUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.staticContentMedia.current.svg.user[contentId] = new UserSvgMedia(
      contentId,
      filename,
      mimeType,
      state,
      this.userStaticContentSocket,
      this.sendDownloadSignal,
      this.addCurrentDownload,
      this.removeCurrentDownload,
    );
  };

  private onTextUploadedToUserContent = (
    event: onTextUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.staticContentMedia.current.text.user[contentId] = new UserTextMedia(
      contentId,
      filename,
      mimeType,
      state,
      this.userStaticContentSocket,
      this.sendDownloadSignal,
      this.addCurrentDownload,
      this.removeCurrentDownload,
    );
  };

  private onVideoUploadedToUserContent = (
    event: onVideoUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.staticContentMedia.current.video.user[contentId] = new UserVideoMedia(
      contentId,
      filename,
      mimeType,
      state,
      this.userStaticContentSocket,
      this.sendDownloadSignal,
      this.addCurrentDownload,
      this.removeCurrentDownload,
    );
  };

  private onContentDeleted = (event: onContentDeletedType) => {
    const { contentType, contentId } = event.header;

    if (this.staticContentMedia.current[contentType].user[contentId]) {
      this.staticContentMedia.current[contentType].user[
        contentId
      ].deconstructor();
      delete this.staticContentMedia.current[contentType].user[contentId];
    }
  };

  private onContentStateChanged = (event: onContentStateChangedType) => {
    const { contentType, contentId } = event.header;
    const { state } = event.data;

    this.staticContentMedia.current[contentType].user[contentId].setState(
      state,
    );
  };

  private onMuteStylesResponse = (event: onMuteStylesResponseType) => {
    const { svgs } = event.data;

    for (const svg of svgs) {
      if (this.staticContentMedia.current.svg.user[svg.svgId]) continue;

      this.staticContentMedia.current.svg.user[svg.svgId] = new UserSvgMedia(
        svg.svgId,
        svg.filename,
        svg.mimeType,
        svg.state,
        this.userStaticContentSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );
    }
  };
}

export default UserStaticContentSocketController;
