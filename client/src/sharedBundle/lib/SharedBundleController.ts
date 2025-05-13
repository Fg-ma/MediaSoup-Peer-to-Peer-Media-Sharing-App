import TableVideoMedia from "../../media/fgTableVideo/TableVideoMedia";
import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import {
  IncomingTableStaticContentMessages,
  onCreatedNewInstancesType,
  onResponsedCatchUpTableDataType,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import SharedBundleSocket from "./SharedBundleSocket";
import TableImageMedia from "../../media/fgTableImage/TableImageMedia";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import {
  ApplicationEffectStylesType,
  ApplicationEffectTypes,
  defaultAudioEffectsStyles,
  defaultAudioEffects,
  defaultVideoEffectsStyles,
  defaultVideoEffects,
  ImageEffectStylesType,
  ImageEffectTypes,
  UserEffectsStylesType,
  UserEffectsType,
  VideoEffectStylesType,
  VideoEffectTypes,
  SvgEffectTypes,
  SvgEffectStylesType,
} from "../../../../universal/effectsTypeConstant";
import Deadbanding from "../../babylon/Deadbanding";
import UserDevice from "../../lib/UserDevice";
import TableTextMedia from "../../media/fgTableText/TableTextMedia";
import TableApplicationMedia from "../../media/fgTableApplication/TableApplicationMedia";
import TableSvgMediaInstance from "../../media/fgTableSvg/TableSvgMediaInstance";
import TableSvgMedia from "../../media/fgTableSvg/TableSvgMedia";
import TableImageMediaInstance from "../../media/fgTableImage/TableImageMediaInstance";
import TableTextMediaInstance from "../../media/fgTableText/TableTextMediaInstance";
import TableApplicationMediaInstance from "../../media/fgTableApplication/TableApplicationMediaInstance";
import TableVideoMediaInstance from "../../media/fgTableVideo/TableVideoMediaInstance";
import { DownloadSignals } from "../../context/uploadDownloadContext/lib/typeConstant";
import Downloader from "../../downloader/Downloader";

class SharedBundleController extends SharedBundleSocket {
  constructor(
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private userDevice: React.MutableRefObject<UserDevice>,
    private deadbanding: React.MutableRefObject<Deadbanding>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private sendDownloadSignal: (signal: DownloadSignals) => void,
    private addCurrentDownload: (id: string, upload: Downloader) => void,
    private removeCurrentDownload: (id: string) => void,
  ) {
    super();
  }

  gameSignalingListener = (event: { data: string }) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case "gameClosed":
        this.setRerender((prev) => !prev);
        break;
      case "userJoinedTable":
        this.setRerender((prev) => !prev);
        break;
      case "gameInitiated":
        setTimeout(() => {
          this.setRerender((prev) => !prev);
        }, 100);
        break;
      default:
        break;
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
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener,
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
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener,
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
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener,
        );

        this.userMedia.current.text.table[textItem.textId] = newTextMedia;

        for (const instance of textItem.instances) {
          this.userMedia.current.text.tableInstances[instance.textInstanceId] =
            new TableTextMediaInstance(
              newTextMedia,
              instance.textInstanceId,
              instance.positioning,
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
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener,
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

    setTimeout(() => {
      this.setRerender((prev) => !prev);
    }, 100);
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

    this.setRerender((prev) => !prev);
  };

  handleTableStaticContentMessage = (
    message: IncomingTableStaticContentMessages,
  ) => {
    switch (message.type) {
      case "responsedCatchUpTableData":
        this.onResponsedCatchUpTableData(message);
        break;
      case "videoUploadedToTable":
        {
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
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener,
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

          this.setRerender((prev) => !prev);
        }
        break;
      case "dashVideoReady":
        {
          const { videoId } = message.header;

          // this.userMedia.current.video[videoId]?.preloadDashStream(url);
        }
        break;
      case "imageUploadedToTable":
        {
          const { contentId, instanceId } = message.header;
          const { filename, mimeType, state, initPositioning } = message.data;

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
          this.setRerender((prev) => !prev);
        }
        break;
      case "imageUploadedToTabled":
        {
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

          this.setRerender((prev) => !prev);
        }
        break;
      case "svgUploadedToTable":
        {
          const { contentId, instanceId } = message.header;
          const { filename, mimeType, state, initPositioning } = message.data;

          if (this.tableStaticContentSocket.current) {
            const newSvgMedia = new TableSvgMedia(
              contentId,
              filename,
              mimeType,
              state,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener,
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

          this.setRerender((prev) => !prev);
        }
        break;
      case "svgUploadedToTabled":
        {
          const { contentId } = message.header;
          const { filename, mimeType, state } = message.data;

          if (this.tableStaticContentSocket.current) {
            this.userMedia.current.svg.table[contentId] = new TableSvgMedia(
              contentId,
              filename,
              mimeType,
              state,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener,
            );
          }

          this.setRerender((prev) => !prev);
        }
        break;
      case "svgReuploaded":
        {
          const { contentId } = message.header;

          this.userMedia.current.svg.table[contentId].reloadContent();

          this.setRerender((prev) => !prev);
        }
        break;
      case "textUploadedToTable":
        {
          const { contentId, instanceId } = message.header;
          const { filename, mimeType, state, initPositioning } = message.data;

          if (this.tableStaticContentSocket.current) {
            const newTextMedia = new TableTextMedia(
              contentId,
              filename,
              mimeType,
              state,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener,
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
              );
          }
          this.setRerender((prev) => !prev);
        }
        break;
      case "contentDeleted":
        this.setRerender((prev) => !prev);
        break;
      case "createdNewInstances":
        this.onCreatedNewInstances(message);
        break;
      default:
        break;
    }
  };
}

export default SharedBundleController;
