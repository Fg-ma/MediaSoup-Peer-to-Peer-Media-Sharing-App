import { UserMediaType } from "../../context/mediaContext/typeConstant";
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

class UserStaticContentSocketController {
  private ws: WebSocket | undefined;
  private messageListeners: Set<
    (message: IncomingUserStaticContentMessages) => void
  > = new Set();

  constructor(
    private url: string,
    private userId: string,
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
        instance: this.instance,
        contentType,
        contentId,
      },
      data: { key },
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

    this.userMedia.current.application.user[contentId] =
      new UserApplicationMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.getFile,
        this.addMessageListener,
        this.removeMessageListener,
      );
  };

  private onImageUploadedToUserContent = (
    event: onImageUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.userMedia.current.image.user[contentId] = new UserImageMedia(
      contentId,
      filename,
      mimeType,
      state,
      this.getFile,
      this.addMessageListener,
      this.removeMessageListener,
    );
  };

  private onSoundClipUploadedToUserContent = (
    event: onSoundClipUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.userMedia.current.soundClip.user[contentId] = new UserSoundClipMedia(
      contentId,
      filename,
      mimeType,
      state,
      this.getFile,
      this.addMessageListener,
      this.removeMessageListener,
    );
  };

  private onSvgUploadedToUserContent = (
    event: onSvgUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.userMedia.current.svg.user[contentId] = new UserSvgMedia(
      contentId,
      filename,
      mimeType,
      state,
      this.getFile,
      this.addMessageListener,
      this.removeMessageListener,
    );
  };

  private onTextUploadedToUserContent = (
    event: onTextUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.userMedia.current.text.user[contentId] = new UserTextMedia(
      contentId,
      filename,
      mimeType,
      state,
      this.getFile,
      this.addMessageListener,
      this.removeMessageListener,
    );
  };

  private onVideoUploadedToUserContent = (
    event: onVideoUploadedToUserContentType,
  ) => {
    const { contentId } = event.header;
    const { filename, mimeType, state } = event.data;

    this.userMedia.current.video.user[contentId] = new UserVideoMedia(
      contentId,
      filename,
      mimeType,
      state,
      this.getFile,
      this.addMessageListener,
      this.removeMessageListener,
    );
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

  private onMuteStylesResponse = (event: onMuteStylesResponseType) => {
    const { svgs } = event.data;

    for (const svg of svgs) {
      if (this.userMedia.current.svg.user[svg.svgId]) continue;

      this.userMedia.current.svg.user[svg.svgId] = new UserSvgMedia(
        svg.svgId,
        svg.filename,
        svg.mimeType,
        svg.state,
        this.getFile,
        this.addMessageListener,
        this.removeMessageListener,
      );
    }
  };
}

export default UserStaticContentSocketController;
