import { ImageOptions } from "./typeConstant";
import TableStaticContentSocketController, {
  IncomingTableStaticContentMessages,
  onCatchUpContentDataRespondedType,
  onRequestedCatchUpContentDataType,
} from "../../lib/TableStaticContentSocketController";
import ImageMedia from "../../lib/ImageMedia";

class ImageController {
  constructor(
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private imageId: string,
    private imageMedia: ImageMedia,
    private positioning: React.MutableRefObject<{
      position: {
        left: number;
        top: number;
      };
      scale: {
        x: number;
        y: number;
      };
      rotation: number;
    }>,
    private imageContainerRef: React.RefObject<HTMLDivElement>,
    private subContainerRef: React.RefObject<HTMLDivElement>,
    private imageOptions: ImageOptions,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    this.imageContainerRef.current?.style.setProperty(
      "--primary-image-color",
      `${this.imageOptions.primaryImageColor}`
    );
  };

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };

  handleTableStaticContentMessage = (
    event: IncomingTableStaticContentMessages
  ) => {
    switch (event.type) {
      case "requestedCatchUpContentData":
        this.onRequestedCatchUpContentData(event);
        break;
      case "catchUpContentDataResponded":
        this.onCatchUpContentDataResponded(event);
        break;
      default:
        break;
    }
  };

  onRequestedCatchUpContentData = (
    event: onRequestedCatchUpContentDataType
  ) => {
    const { inquiringUsername, inquiringInstance, contentType, contentId } =
      event.header;

    // this.tableStaticContentSocket.current?.catchUpContentDataResponse(
    //   inquiringUsername,
    //   inquiringInstance,
    //   contentType,
    //   contentId,
    //   this.positioning.current
    // );
  };

  onCatchUpContentDataResponded = (
    event: onCatchUpContentDataRespondedType
  ) => {
    const { contentType, contentId } = event.header;

    if (contentType !== "image" || contentId !== this.imageId) {
      return;
    }

    const { positioning } = event.data;

    this.positioning.current = positioning;

    this.setRerender((prev) => !prev);
  };
}

export default ImageController;
