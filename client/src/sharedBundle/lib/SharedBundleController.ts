import VideoMedia from "../../media/fgVideo/VideoMedia";
import TableStaticContentSocketController from "../../serverControllers/tableStaticContentServer/TableStaticContentSocketController";
import { IncomingTableStaticContentMessages } from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import SharedBundleSocket from "./SharedBundleSocket";
import ImageMedia from "../../media/fgImage/ImageMedia";
import { UserMediaType } from "../../context/mediaContext/typeConstant";
import {
  UserEffectsStylesType,
  UserStreamEffectsType,
} from "../../context/effectsContext/typeConstant";
import Deadbanding from "../../babylon/Deadbanding";
import UserDevice from "../../lib/UserDevice";
import TextMedia from "../../media/fgText/TextMedia";
import SvgMedia from "../../media/fgSvg/SvgMedia";

class SharedBundleController extends SharedBundleSocket {
  constructor(
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private userDevice: UserDevice,
    private deadbanding: Deadbanding,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
    private userStreamEffects: React.MutableRefObject<UserStreamEffectsType>,
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

  handleTableStaticContentMessage = (
    message: IncomingTableStaticContentMessages
  ) => {
    switch (message.type) {
      case "responsedCatchUpTableData":
        this.setRerender((prev) => !prev);
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
              this.userStreamEffects,
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
              this.userStreamEffects,
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

          if (this.tableStaticContentSocket.current) {
            this.userMedia.current.svg[contentId] = new SvgMedia(
              contentId,
              filename,
              mimeType,
              visible,
              this.userEffectsStyles,
              this.userStreamEffects,
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
