import { ApplicationsOptions } from "./typeConstant";
import TableStaticContentSocketController, {
  IncomingTableStaticContentMessages,
  onCatchUpContentDataRespondedType,
  onRequestedCatchUpContentDataType,
} from "../../../lib/TableStaticContentSocketController";
import ApplicationsMedia from "../ApplicationsMedia";

class ApplicationsController {
  constructor(
    private tableStaticContentSocket: React.MutableRefObject<
      TableStaticContentSocketController | undefined
    >,
    private applicationsId: string,
    private applicationsMedia: ApplicationsMedia,
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
    private applicationsContainerRef: React.RefObject<HTMLDivElement>,
    private subContainerRef: React.RefObject<HTMLDivElement>,
    private applicationsOptions: ApplicationsOptions,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {}

  init = () => {
    this.applicationsContainerRef.current?.style.setProperty(
      "--primary-applications-color",
      `${this.applicationsOptions.primaryApplicationsColor}`
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

    if (contentType !== "applications" || contentId !== this.applicationsId) {
      return;
    }

    const { positioning } = event.data;

    this.positioning.current = positioning;

    this.setRerender((prev) => !prev);
  };
}

export default ApplicationsController;
