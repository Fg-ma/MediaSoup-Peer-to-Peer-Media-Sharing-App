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
} from "../../../../universal/effectsTypeConstant";
import Deadbanding from "../../babylon/Deadbanding";
import UserDevice from "../../lib/UserDevice";
import TextMedia from "../../media/fgText/TextMedia";
import SvgMedia from "../../media/fgSvg/SvgMedia";
import ApplicationMedia from "../../media/fgApplication/ApplicationMedia";

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

    const { images, svgs, videos, text, applications, audio } = event.data;

    if (videos) {
      for (const video of videos) {
        if (!this.userEffects.current.video[video.videoId]) {
          this.userEffects.current.video[video.videoId] = {
            video: structuredClone(defaultVideoEffects),
            audio: structuredClone(defaultAudioEffects),
          };
        }
        this.userEffects.current.video[video.videoId].video = video.effects as {
          [effectType in VideoEffectTypes]: boolean;
        };
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
          this.userEffects,
          this.userMedia,
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener,
          video.positioning,
          this.tableStaticContentSocket.current.requestCatchUpVideoPosition
        );
      }
    }
    if (images) {
      for (const image of images) {
        this.userEffects.current.image[image.imageId] = image.effects as {
          [effectType in ImageEffectTypes]: boolean;
        };
        this.userEffectsStyles.current.image[image.imageId] =
          image.effectStyles as ImageEffectStylesType;

        this.userMedia.current.image[image.imageId] = new ImageMedia(
          image.imageId,
          image.filename,
          image.mimeType as TableTopStaticMimeType,
          this.userEffectsStyles,
          this.userEffects,
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener,
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
          this.userEffects,
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener,
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
          this.tableStaticContentSocket.current.getFile,
          this.tableStaticContentSocket.current.addMessageListener,
          this.tableStaticContentSocket.current.removeMessageListener,
          textItem.positioning
        );
      }
    }
    if (applications) {
      for (const application of applications) {
        this.userEffects.current.application[application.applicationId] =
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
            this.userEffects,
            this.tableStaticContentSocket.current.getFile,
            this.tableStaticContentSocket.current.addMessageListener,
            this.tableStaticContentSocket.current.removeMessageListener,
            this.userDevice,
            this.userMedia,
            application.positioning
          );
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
      case "originalVideoReady":
        {
          const { videoId } = message.header;
          const { filename, mimeType } = message.data;
          if (this.tableStaticContentSocket.current) {
            this.userMedia.current.video[videoId] = new VideoMedia(
              videoId,
              filename,
              mimeType,
              this.userDevice,
              this.deadbanding,
              this.userEffectsStyles,
              this.userEffects,
              this.userMedia,
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
      // case "truncatedVideoReady":
      //   shakaPlayer.current?.load(message.url).then(() => {
      //     console.log("Original video loaded successfully");
      //   });
      //   break;
      case "imageReady":
        {
          const { contentId } = message.header;
          const { filename, mimeType } = message.data;

          if (this.tableStaticContentSocket.current) {
            this.userMedia.current.image[contentId] = new ImageMedia(
              contentId,
              filename,
              mimeType,
              this.userEffectsStyles,
              this.userEffects,
              this.tableStaticContentSocket.current.getFile,
              this.tableStaticContentSocket.current.addMessageListener,
              this.tableStaticContentSocket.current.removeMessageListener,
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
      case "svgReady":
        {
          const { contentId } = message.header;
          const { filename, mimeType, visible } = message.data;

          if (!this.userMedia.current.svg[contentId]) {
            if (this.tableStaticContentSocket.current) {
              this.userMedia.current.svg[contentId] = new SvgMedia(
                contentId,
                filename,
                mimeType,
                visible,
                this.userEffectsStyles,
                this.userEffects,
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
          } else {
            this.userMedia.current.svg[contentId].reloadContent(
              filename,
              mimeType,
              visible
            );
          }
          this.setRerender((prev) => !prev);
        }
        break;
      case "textReady":
        {
          const { contentId } = message.header;
          const { filename, mimeType } = message.data;

          if (this.tableStaticContentSocket.current) {
            this.userMedia.current.text[contentId] = new TextMedia(
              contentId,
              filename,
              mimeType,
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
