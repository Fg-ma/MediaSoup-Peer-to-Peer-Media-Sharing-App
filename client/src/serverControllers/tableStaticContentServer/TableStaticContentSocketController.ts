import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
  defaultAudioEffects,
  defaultAudioEffectsStyles,
  defaultVideoEffects,
  defaultVideoEffectsStyles,
  ImageEffectStylesType,
  ImageEffectTypes,
  SvgEffectStylesType,
  SvgEffectTypes,
  UserEffectsStylesType,
  UserEffectsType,
  VideoEffectStylesType,
  VideoEffectTypes,
} from "../../../../universal/effectsTypeConstant";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import {
  IncomingTableStaticContentMessages,
  onContentDeletedType,
  onContentStateChangedType,
  onCreatedNewInstancesType,
  onImageUploadedToTabledType,
  onImageUploadedToTableType,
  onRequestedCatchUpVideoPositionType,
  onRespondedCatchUpVideoPositionType,
  onResponsedCatchUpTableDataType,
  onSvgReuploadedType,
  onSvgUploadedToTabledType,
  onSvgUploadedToTableType,
  onTextUploadedToTabledType,
  onTextUploadedToTableType,
  onVideoUploadedToTabledType,
  onVideoUploadedToTableType,
  OutGoingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "./lib/typeConstant";
import {
  TableContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";
import TableVideoMediaInstance from "../../media/fgTableVideo/TableVideoMediaInstance";
import TableVideoMedia from "../../media/fgTableVideo/TableVideoMedia";
import Deadbanding from "../../babylon/Deadbanding";
import UserDevice from "../../tools/userDevice/UserDevice";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import Downloader from "../../tools/downloader/Downloader";
import TableImageMediaInstance from "../../media/fgTableImage/TableImageMediaInstance";
import TableImageMedia from "../../media/fgTableImage/TableImageMedia";
import TableSvgMediaInstance from "../../media/fgTableSvg/TableSvgMediaInstance";
import TableSvgMedia from "../../media/fgTableSvg/TableSvgMedia";
import TableTextMediaInstance from "../../media/fgTableText/TableTextMediaInstance";
import TableTextMedia from "../../media/fgTableText/TableTextMedia";
import TableApplicationMediaInstance from "../../media/fgTableApplication/TableApplicationMediaInstance";
import TableApplicationMedia from "../../media/fgTableApplication/TableApplicationMedia";
import LiveTextEditingSocketController from "../liveTextEditingServer/LiveTextEditingSocketController";
import LiveTextDownloader from "src/tools/liveTextDownloader/LiveTextDownloader";

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
    private deadbanding: React.MutableRefObject<Deadbanding>,
    private userDevice: React.MutableRefObject<UserDevice>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private liveTextEditingSocket: React.MutableRefObject<
      LiveTextEditingSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private addCurrentDownload: (
      id: string,
      upload: Downloader | LiveTextDownloader,
    ) => void,
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
      let message: IncomingTableStaticContentMessages;

      if (event.data instanceof ArrayBuffer) {
        const buf = new Uint8Array(event.data);
        const view = new DataView(buf.buffer);

        // 1) Read first 4 bytes for JSON length
        const headerLen = view.getUint32(0);

        // 2) Slice out the JSON header
        const headerBytes = buf.subarray(4, 4 + headerLen);
        const headerText = new TextDecoder().decode(headerBytes);
        const header = JSON.parse(headerText);

        // 3) The rest of file chunk
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
            ? (JSON.parse(event.data) as IncomingTableStaticContentMessages)
            : { type: undefined };
      }

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

  getFile = (contentType: StaticContentTypes, contentId: string) => {
    this.sendMessage({
      type: "getDownloadMeta",
      header: {
        tableId: this.tableId,
        username: this.username,
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
        tableId: this.tableId,
        username: this.username,
        instance: this.instance,
        contentType,
        contentId,
      },
      data: { range },
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

  deleteUploadSession = (uploadId: string) => {
    this.sendMessage({
      type: "deleteUploadSession",
      header: {
        uploadId,
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
      case "responsedCatchUpTableData":
        this.onResponsedCatchUpTableData(message);
        break;
      case "videoUploadedToTable":
        this.onVideoUploadedToTable(message);
        break;
      case "videoUploadedToTabled":
        this.onVideoUploadedToTabled(message);
        break;
      case "dashVideoReady":
        {
          const { videoId } = message.header;

          // this.userMedia.current.video[videoId]?.preloadDashStream(url);
        }
        break;
      case "imageUploadedToTable":
        this.onImageUploadedToTable(message);
        break;
      case "imageUploadedToTabled":
        this.onImageUploadedToTabled(message);
        break;
      case "svgUploadedToTable":
        this.onSvgUploadedToTable(message);
        break;
      case "svgUploadedToTabled":
        this.onSvgUploadedToTabled(message);
        break;
      case "svgReuploaded":
        this.onSvgReuploaded(message);
        break;
      case "textUploadedToTable":
        this.onTextUploadedToTable(message);
        break;
      case "textUploadedToTabled":
        this.onTextUploadedToTabled(message);
        break;
      case "createdNewInstances":
        this.onCreatedNewInstances(message);
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

  private onVideoUploadedToTable = (message: onVideoUploadedToTableType) => {
    const { contentId, instanceId } = message.header;
    const { filename, mimeType, state, initPositioning } = message.data;

    if (this.tableStaticContentSocket.current) {
      const newVideoMedia = new TableVideoMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.deadbanding,
        this.userDevice,
        this.userEffects,
        this.tableStaticContentSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );

      this.userMedia.current.video.table[contentId] = newVideoMedia;

      this.userMedia.current.video.tableInstances[instanceId] =
        new TableVideoMediaInstance(
          newVideoMedia,
          instanceId,
          this.userDevice,
          this.deadbanding,
          this.userEffectsStyles,
          this.userEffects,
          initPositioning
            ? initPositioning
            : {
                position: {
                  left: 50,
                  top: 50,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
          this.tableStaticContentSocket.current.requestCatchUpVideoPosition,
        );
    }
  };

  private onVideoUploadedToTabled = (message: onVideoUploadedToTabledType) => {
    const { contentId } = message.header;
    const { filename, mimeType, state } = message.data;

    if (this.tableStaticContentSocket.current) {
      this.userMedia.current.video.table[contentId] = new TableVideoMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.deadbanding,
        this.userDevice,
        this.userEffects,
        this.tableStaticContentSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );
    }
  };

  private onImageUploadedToTable = (message: onImageUploadedToTableType) => {
    const { contentId, instanceId } = message.header;
    const { filename, mimeType, state, initPositioning } = message.data;

    if (
      this.userMedia.current.image.table[contentId] ||
      this.userMedia.current.image.tableInstances[instanceId]
    )
      return;

    if (this.tableStaticContentSocket.current) {
      const newImageMedia = new TableImageMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.deadbanding,
        this.userDevice,
        this.tableStaticContentSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );

      this.userMedia.current.image.table[contentId] = newImageMedia;

      this.userMedia.current.image.tableInstances[instanceId] =
        new TableImageMediaInstance(
          newImageMedia,
          instanceId,
          this.userEffectsStyles,
          this.userEffects,
          this.userDevice,
          this.deadbanding,
          initPositioning
            ? initPositioning
            : {
                position: {
                  left: 50,
                  top: 50,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
        );
    }
  };

  private onImageUploadedToTabled = (message: onImageUploadedToTabledType) => {
    const { contentId } = message.header;
    const { filename, mimeType, state } = message.data;

    if (this.tableStaticContentSocket.current) {
      this.userMedia.current.image.table[contentId] = new TableImageMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.deadbanding,
        this.userDevice,
        this.tableStaticContentSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );
    }
  };

  private onSvgUploadedToTable = (message: onSvgUploadedToTableType) => {
    const { contentId, instanceId } = message.header;
    const { filename, mimeType, state, initPositioning } = message.data;

    if (this.tableStaticContentSocket.current) {
      const newSvgMedia = new TableSvgMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.tableStaticContentSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );

      this.userMedia.current.svg.table[contentId] = newSvgMedia;

      this.userMedia.current.svg.tableInstances[instanceId] =
        new TableSvgMediaInstance(
          newSvgMedia,
          instanceId,
          this.userEffectsStyles,
          this.userEffects,
          initPositioning
            ? initPositioning
            : {
                position: {
                  left: 50,
                  top: 50,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
        );
    }
  };

  private onSvgUploadedToTabled = (message: onSvgUploadedToTabledType) => {
    const { contentId } = message.header;
    const { filename, mimeType, state } = message.data;

    if (this.tableStaticContentSocket.current) {
      this.userMedia.current.svg.table[contentId] = new TableSvgMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.tableStaticContentSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );
    }
  };

  private onSvgReuploaded = (message: onSvgReuploadedType) => {
    const { contentId } = message.header;

    this.userMedia.current.svg.table[contentId].reloadContent();
  };

  private onTextUploadedToTable = (message: onTextUploadedToTableType) => {
    const { contentId, instanceId } = message.header;
    const { filename, mimeType, state, initPositioning } = message.data;

    if (this.liveTextEditingSocket.current) {
      const newTextMedia = new TableTextMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.liveTextEditingSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );

      this.userMedia.current.text.table[contentId] = newTextMedia;

      this.userMedia.current.text.tableInstances[instanceId] =
        new TableTextMediaInstance(
          newTextMedia,
          instanceId,
          initPositioning
            ? initPositioning
            : {
                position: {
                  left: 50,
                  top: 50,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
          this.liveTextEditingSocket,
        );
    }
  };

  private onTextUploadedToTabled = (message: onTextUploadedToTabledType) => {
    const { contentId } = message.header;
    const { filename, mimeType, state } = message.data;

    if (this.liveTextEditingSocket.current) {
      this.userMedia.current.text.table[contentId] = new TableTextMedia(
        contentId,
        filename,
        mimeType,
        state,
        this.liveTextEditingSocket,
        this.sendDownloadSignal,
        this.addCurrentDownload,
        this.removeCurrentDownload,
      );
    }
  };

  private onResponsedCatchUpTableData = (
    event: onResponsedCatchUpTableDataType,
  ) => {
    if (!this.tableStaticContentSocket.current) return;

    const { images, svgs, videos, text, applications, soundClips } = event.data;

    if (videos) {
      for (const video of videos) {
        const newVideoMedia = new TableVideoMedia(
          video.videoId,
          video.filename,
          video.mimeType as TableTopStaticMimeType,
          video.state,
          this.deadbanding,
          this.userDevice,
          this.userEffects,
          this.tableStaticContentSocket,
          this.sendDownloadSignal,
          this.addCurrentDownload,
          this.removeCurrentDownload,
        );

        this.userMedia.current.video.table[video.videoId] = newVideoMedia;

        for (const instance of video.instances) {
          if (!this.userEffects.current.video[instance.videoInstanceId]) {
            this.userEffects.current.video[instance.videoInstanceId] = {
              video: structuredClone(defaultVideoEffects),
              audio: structuredClone(defaultAudioEffects),
            };
          }
          this.userEffects.current.video[instance.videoInstanceId].video =
            instance.effects as {
              [effectType in VideoEffectTypes]: boolean;
            };
          if (!this.userEffectsStyles.current.video[instance.videoInstanceId]) {
            this.userEffectsStyles.current.video[instance.videoInstanceId] = {
              video: structuredClone(defaultVideoEffectsStyles),
              audio: structuredClone(defaultAudioEffectsStyles),
            };
          }
          this.userEffectsStyles.current.video[instance.videoInstanceId].video =
            instance.effectStyles as VideoEffectStylesType;

          this.userMedia.current.video.tableInstances[
            instance.videoInstanceId
          ] = new TableVideoMediaInstance(
            newVideoMedia,
            instance.videoInstanceId,
            this.userDevice,
            this.deadbanding,
            this.userEffectsStyles,
            this.userEffects,
            instance.positioning,
            this.tableStaticContentSocket.current.requestCatchUpVideoPosition,
          );
        }
      }
    }
    if (images) {
      for (const image of images) {
        const newImageMedia = new TableImageMedia(
          image.imageId,
          image.filename,
          image.mimeType as TableTopStaticMimeType,
          image.state,
          this.deadbanding,
          this.userDevice,
          this.tableStaticContentSocket,
          this.sendDownloadSignal,
          this.addCurrentDownload,
          this.removeCurrentDownload,
        );

        this.userMedia.current.image.table[image.imageId] = newImageMedia;

        for (const instance of image.instances) {
          this.userEffects.current.image[instance.imageInstanceId] =
            instance.effects as {
              [effectType in ImageEffectTypes]: boolean;
            };
          this.userEffectsStyles.current.image[instance.imageInstanceId] =
            instance.effectStyles as ImageEffectStylesType;

          this.userMedia.current.image.tableInstances[
            instance.imageInstanceId
          ] = new TableImageMediaInstance(
            newImageMedia,
            instance.imageInstanceId,
            this.userEffectsStyles,
            this.userEffects,
            this.userDevice,
            this.deadbanding,
            instance.positioning,
          );
        }
      }
    }
    if (svgs) {
      for (const svg of svgs) {
        const newSvgMedia = new TableSvgMedia(
          svg.svgId,
          svg.filename,
          svg.mimeType as TableTopStaticMimeType,
          svg.state,
          this.tableStaticContentSocket,
          this.sendDownloadSignal,
          this.addCurrentDownload,
          this.removeCurrentDownload,
        );

        this.userMedia.current.svg.table[svg.svgId] = newSvgMedia;

        for (const instance of svg.instances) {
          this.userEffects.current.svg[instance.svgInstanceId] =
            instance.effects as {
              [effectType in SvgEffectTypes]: boolean;
            };
          this.userEffectsStyles.current.svg[instance.svgInstanceId] =
            instance.effectStyles as SvgEffectStylesType;

          this.userMedia.current.svg.tableInstances[instance.svgInstanceId] =
            new TableSvgMediaInstance(
              newSvgMedia,
              instance.svgInstanceId,
              this.userEffectsStyles,
              this.userEffects,
              instance.positioning,
            );
        }
      }
    }
    if (text) {
      for (const textItem of text) {
        const newTextMedia = new TableTextMedia(
          textItem.textId,
          textItem.filename,
          textItem.mimeType as TableTopStaticMimeType,
          textItem.state,
          this.liveTextEditingSocket,
          this.sendDownloadSignal,
          this.addCurrentDownload,
          this.removeCurrentDownload,
        );

        this.userMedia.current.text.table[textItem.textId] = newTextMedia;

        for (const instance of textItem.instances) {
          this.userMedia.current.text.tableInstances[instance.textInstanceId] =
            new TableTextMediaInstance(
              newTextMedia,
              instance.textInstanceId,
              instance.positioning,
              this.liveTextEditingSocket,
            );
        }
      }
    }
    if (applications) {
      for (const application of applications) {
        const newApplication = new TableApplicationMedia(
          application.applicationId,
          application.filename,
          application.mimeType as TableTopStaticMimeType,
          application.state,
          this.tableStaticContentSocket,
          this.sendDownloadSignal,
          this.addCurrentDownload,
          this.removeCurrentDownload,
        );

        this.userMedia.current.application.table[application.applicationId] =
          newApplication;

        for (const instance of application.instances) {
          this.userEffects.current.application[instance.applicationInstanceId] =
            instance.effects as {
              [effectType in ApplicationEffectTypes]: boolean;
            };
          this.userEffectsStyles.current.application[
            instance.applicationInstanceId
          ] = instance.effectStyles as ApplicationEffectStylesType;

          this.userMedia.current.application.tableInstances[
            instance.applicationInstanceId
          ] = new TableApplicationMediaInstance(
            newApplication,
            instance.applicationInstanceId,
            this.userEffectsStyles,
            this.userEffects,
            this.userDevice,
            instance.positioning,
          );
        }
      }
    }
  };

  private onCreatedNewInstances = (event: onCreatedNewInstancesType) => {
    const { newInstances } = event.data;

    newInstances.forEach((instance) => {
      switch (instance.contentType) {
        case "svg":
          if (this.userMedia.current.svg.table[instance.contentId]) {
            instance.instances.forEach((ins) => {
              this.userMedia.current.svg.tableInstances[ins.instanceId] =
                new TableSvgMediaInstance(
                  this.userMedia.current.svg.table[instance.contentId],
                  ins.instanceId,
                  this.userEffectsStyles,
                  this.userEffects,
                  ins.positioning,
                );
            });
          }
          break;
        case "application":
          if (this.userMedia.current.application.table[instance.contentId]) {
            instance.instances.forEach((ins) => {
              this.userMedia.current.application.tableInstances[
                ins.instanceId
              ] = new TableApplicationMediaInstance(
                this.userMedia.current.application.table[instance.contentId],
                ins.instanceId,
                this.userEffectsStyles,
                this.userEffects,
                this.userDevice,
                ins.positioning,
              );
            });
          }
          break;
        case "image":
          if (this.userMedia.current.image.table[instance.contentId]) {
            instance.instances.forEach((ins) => {
              this.userMedia.current.image.tableInstances[ins.instanceId] =
                new TableImageMediaInstance(
                  this.userMedia.current.image.table[instance.contentId],
                  ins.instanceId,
                  this.userEffectsStyles,
                  this.userEffects,
                  this.userDevice,
                  this.deadbanding,
                  ins.positioning,
                );
            });
          }
          break;
        case "text":
          if (this.userMedia.current.text.table[instance.contentId]) {
            instance.instances.forEach((ins) => {
              this.userMedia.current.text.tableInstances[ins.instanceId] =
                new TableTextMediaInstance(
                  this.userMedia.current.text.table[instance.contentId],
                  ins.instanceId,
                  ins.positioning,
                  this.liveTextEditingSocket,
                );
            });
          }
          break;
        case "video":
          if (this.userMedia.current.video.table[instance.contentId]) {
            instance.instances.forEach((ins) => {
              if (this.tableStaticContentSocket.current)
                this.userMedia.current.video.tableInstances[ins.instanceId] =
                  new TableVideoMediaInstance(
                    this.userMedia.current.video.table[instance.contentId],
                    ins.instanceId,
                    this.userDevice,
                    this.deadbanding,
                    this.userEffectsStyles,
                    this.userEffects,
                    ins.positioning,
                    this.tableStaticContentSocket.current.requestCatchUpVideoPosition,
                  );
            });
          }
          break;
        case "soundClip":
          break;
      }
    });
  };
}

export default TableStaticContentSocketController;
