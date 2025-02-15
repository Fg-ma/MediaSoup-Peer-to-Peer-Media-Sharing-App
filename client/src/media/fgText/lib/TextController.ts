import { TextOptions } from "./typeConstant";
import TableStaticContentSocketController, {
  IncomingTableStaticContentMessages,
  onCatchUpContentDataRespondedType,
  onRequestedCatchUpContentDataType,
} from "../../../lib/TableStaticContentSocketController";
import TextMedia from "../../../lib/TextMedia";

class TextController {
  constructor(
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private textId: string,
    private textMedia: TextMedia,
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
    private textContainerRef: React.RefObject<HTMLDivElement>,
    private subContainerRef: React.RefObject<HTMLDivElement>,
    private textOptions: TextOptions,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    this.textContainerRef.current?.style.setProperty(
      "--primary-text-color",
      `${this.textOptions.primaryTextColor}`
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

    if (contentType !== "text" || contentId !== this.textId) {
      return;
    }

    const { positioning } = event.data;

    this.positioning.current = positioning;

    this.setRerender((prev) => !prev);
  };
}

export default TextController;
