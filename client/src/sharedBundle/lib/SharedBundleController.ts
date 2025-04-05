import VideoMedia from "../../media/fgVideo/VideoMedia";
import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import {
  IncomingTableStaticContentMessages,
  onResponsedCatchUpTableDataType,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import SharedBundleSocket from "./SharedBundleSocket";
import ImageMedia from "../../media/fgImage/ImageMedia";
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
import TextMedia from "../../media/fgText/TextMedia";
import ApplicationMedia from "../../media/fgApplication/ApplicationMedia";
import SvgMediaInstance from "../../media/fgSvg/SvgMediaInstance";
import SvgMedia from "../../media/fgSvg/SvgMedia";
import ImageMediaInstance from "../../media/fgImage/ImageMediaInstance";
import TextMediaInstance from "../../media/fgText/TextMediaInstance";
import ApplicationMediaInstance from "../../media/fgApplication/ApplicationMediaInstance";
import VideoMediaInstance from "src/media/fgVideo/VideoMediaInstance";

class SharedBundleController extends SharedBundleSocket {
  constructor(
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private userDevice: UserDevice,
    private deadbanding: Deadbanding,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >
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
    event: onResponsedCatchUpTableDataType
  ) => {
    if (!this.tableStaticContentSocket.current) return;

    const { images, svgs, videos, text, applications, soundClips } = event.data;

    if (videos) {
      for (const video of videos) {
        const newVideoMedia = new VideoMedia(
          video.videoId,
          video.filename,
          video.mimeType as TableTopStaticMimeType,
          video.tabled,
          this.userEffects,
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener
        );

        this.userMedia.current.video.all[video.videoId] = newVideoMedia;

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

          this.userMedia.current.video.instances[instance.videoInstanceId] =
            new VideoMediaInstance(
              newVideoMedia,
              instance.videoInstanceId,
              this.userDevice,
              this.deadbanding,
              this.userEffectsStyles,
              this.userEffects,
              this.userMedia,
              instance.positioning,
              this.tableStaticContentSocket.current.requestCatchUpVideoPosition
            );
        }
      }
    }
    if (images) {
      for (const image of images) {
        const newImageMedia = new ImageMedia(
          image.imageId,
          image.filename,
          image.mimeType as TableTopStaticMimeType,
          image.tabled,
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener
        );

        this.userMedia.current.image.all[image.imageId] = newImageMedia;

        for (const instance of image.instances) {
          this.userEffects.current.image[instance.imageInstanceId] =
            instance.effects as {
              [effectType in ImageEffectTypes]: boolean;
            };
          this.userEffectsStyles.current.image[instance.imageInstanceId] =
            instance.effectStyles as ImageEffectStylesType;

          this.userMedia.current.image.instances[instance.imageInstanceId] =
            new ImageMediaInstance(
              newImageMedia,
              instance.imageInstanceId,
              this.userEffectsStyles,
              this.userEffects,
              this.userDevice,
              this.deadbanding,
              this.userMedia,
              instance.positioning
            );
        }
      }
    }
    if (svgs) {
      for (const svg of svgs) {
        const newSvgMedia = new SvgMedia(
          svg.svgId,
          svg.filename,
          svg.mimeType as TableTopStaticMimeType,
          svg.tabled,
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener
        );

        this.userMedia.current.svg.all[svg.svgId] = newSvgMedia;

        for (const instance of svg.instances) {
          this.userEffects.current.svg[instance.svgInstanceId] =
            instance.effects as {
              [effectType in SvgEffectTypes]: boolean;
            };
          this.userEffectsStyles.current.svg[instance.svgInstanceId] =
            instance.effectStyles as SvgEffectStylesType;

          this.userMedia.current.svg.instances[instance.svgInstanceId] =
            new SvgMediaInstance(
              newSvgMedia,
              instance.svgInstanceId,
              this.userEffectsStyles,
              this.userEffects,
              instance.positioning
            );
        }
      }
    }
    if (text) {
      for (const textItem of text) {
        this.userMedia.current.text.all[textItem.textId] = new TextMedia(
          textItem.textId,
          textItem.filename,
          textItem.mimeType as TableTopStaticMimeType,
          textItem.tabled,
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener
        );

        for (const instance of textItem.instances) {
          this.userMedia.current.text.instances[instance.textInstanceId] =
            new TextMediaInstance(
              textItem.textId,
              instance.textInstanceId,
              textItem.filename,
              textItem.mimeType as TableTopStaticMimeType,
              textItem.tabled,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener,
              instance.positioning
            );
        }
      }
    }
    if (applications) {
      for (const application of applications) {
        const newApplication = new ApplicationMedia(
          application.applicationId,
          application.filename,
          application.mimeType as TableTopStaticMimeType,
          application.tabled,
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener
        );

        this.userMedia.current.application.all[application.applicationId] =
          newApplication;

        for (const instance of application.instances) {
          this.userEffects.current.application[instance.applicationInstanceId] =
            instance.effects as {
              [effectType in ApplicationEffectTypes]: boolean;
            };
          this.userEffectsStyles.current.application[
            instance.applicationInstanceId
          ] = instance.effectStyles as ApplicationEffectStylesType;

          this.userMedia.current.application.instances[
            instance.applicationInstanceId
          ] = new ApplicationMediaInstance(
            newApplication,
            instance.applicationInstanceId,
            this.userEffectsStyles,
            this.userEffects,
            this.userDevice,
            this.userMedia,
            instance.positioning
          );
        }
      }
    }

    setTimeout(() => {
      this.setRerender((prev) => !prev);
    }, 100);
  };

  handleTableStaticContentMessage = (
    message: IncomingTableStaticContentMessages
  ) => {
    switch (message.type) {
      case "responsedCatchUpTableData":
        this.onResponsedCatchUpTableData(message);
        break;
      case "videoUploadedToTable":
        {
          const { contentId, instanceId } = message.header;
          const { filename, mimeType } = message.data;
          if (this.tableStaticContentSocket.current) {
            const newVideoMedia = new VideoMedia(
              contentId,
              filename,
              mimeType,
              false,
              this.userEffects,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener
            );

            this.userMedia.current.video.all[contentId] = newVideoMedia;

            this.userMedia.current.video.instances[instanceId] =
              new VideoMediaInstance(
                newVideoMedia,
                instanceId,
                this.userDevice,
                this.deadbanding,
                this.userEffectsStyles,
                this.userEffects,
                this.userMedia,
                {
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
                this.tableStaticContentSocket.current.requestCatchUpVideoPosition
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
          const { filename, mimeType } = message.data;

          if (this.tableStaticContentSocket.current) {
            const newImageMedia = new ImageMedia(
              contentId,
              filename,
              mimeType,
              false,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener
            );

            this.userMedia.current.image.all[contentId] = newImageMedia;

            this.userMedia.current.image.instances[instanceId] =
              new ImageMediaInstance(
                newImageMedia,
                instanceId,
                this.userEffectsStyles,
                this.userEffects,
                this.userDevice,
                this.deadbanding,
                this.userMedia,
                {
                  position: {
                    left: 50,
                    top: 50,
                  },
                  scale: {
                    x: 25,
                    y: 25,
                  },
                  rotation: 0,
                }
              );
          }
          this.setRerender((prev) => !prev);
        }
        break;
      case "imageUploadedToTabled":
        {
          const { contentId } = message.header;
          const { filename, mimeType } = message.data;

          if (this.tableStaticContentSocket.current) {
            this.userMedia.current.image.all[contentId] = new ImageMedia(
              contentId,
              filename,
              mimeType,
              true,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener
            );
          }

          this.setRerender((prev) => !prev);
        }
        break;
      case "svgUploadedToTable":
        {
          const { contentId, instanceId } = message.header;
          const { filename, mimeType } = message.data;

          if (this.tableStaticContentSocket.current) {
            const newSvgMedia = new SvgMedia(
              contentId,
              filename,
              mimeType,
              false,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener
            );

            this.userMedia.current.svg.all[contentId] = newSvgMedia;

            this.userMedia.current.svg.instances[instanceId] =
              new SvgMediaInstance(
                newSvgMedia,
                instanceId,
                this.userEffectsStyles,
                this.userEffects,
                {
                  position: {
                    left: 50,
                    top: 50,
                  },
                  scale: {
                    x: 25,
                    y: 25,
                  },
                  rotation: 0,
                }
              );
          }

          this.setRerender((prev) => !prev);
        }
        break;
      case "svgUploadedToTabled":
        {
          const { contentId } = message.header;
          const { filename, mimeType } = message.data;

          if (this.tableStaticContentSocket.current) {
            this.userMedia.current.svg.all[contentId] = new SvgMedia(
              contentId,
              filename,
              mimeType,
              true,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener
            );
          }

          this.setRerender((prev) => !prev);
        }
        break;
      case "svgReuploaded":
        {
          const { contentId } = message.header;

          this.userMedia.current.svg.all[contentId].reloadContent();

          this.setRerender((prev) => !prev);
        }
        break;
      case "textUploadedToTable":
        {
          const { contentId, instanceId } = message.header;
          const { filename, mimeType } = message.data;

          if (this.tableStaticContentSocket.current) {
            this.userMedia.current.text.instances[instanceId] =
              new TextMediaInstance(
                contentId,
                instanceId,
                filename,
                mimeType,
                false,
                this.tableStaticContentSocket.current.getFile,
                this.tableStaticContentSocket.current.addMessageListener,
                this.tableStaticContentSocket.current.removeMessageListener,
                {
                  position: {
                    left: 50,
                    top: 50,
                  },
                  scale: {
                    x: 25,
                    y: 25,
                  },
                  rotation: 0,
                }
              );
          }
          this.setRerender((prev) => !prev);
        }
        break;
      case "contentDeleted":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };
}

export default SharedBundleController;
