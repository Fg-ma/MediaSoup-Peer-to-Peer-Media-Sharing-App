import { ApplicationListenerTypes } from "../TableApplicationMedia";
import TableApplicationMediaInstance from "../TableApplicationMediaInstance";
import { ApplicationOptions } from "./typeConstant";

class ApplicationController {
  constructor(
    private applicationContainerRef: React.RefObject<HTMLDivElement>,
    private applicationOptions: ApplicationOptions,
    private setSettingsActive: React.Dispatch<React.SetStateAction<boolean>>,
    private applicationMediaInstance: TableApplicationMediaInstance,
    private subContainerRef: React.RefObject<HTMLDivElement>,
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
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
  ) {}

  init = () => {
    this.applicationContainerRef.current?.style.setProperty(
      "--primary-application-color",
      `${this.applicationOptions.primaryApplicationColor}`,
    );
  };

  handleTableScroll = () => {
    this.setSettingsActive(false);
  };

  private onDownloadComplete = () => {
    if (this.applicationMediaInstance.instanceApplication) {
      const allCanvas =
        this.subContainerRef.current?.querySelectorAll("canvas");

      if (allCanvas) {
        allCanvas.forEach((canvasElement) => {
          canvasElement.remove();
        });
      }

      this.subContainerRef.current?.appendChild(
        this.applicationMediaInstance.instanceApplication,
      );

      this.positioning.current.scale = {
        x: this.applicationMediaInstance.applicationMedia.aspect
          ? this.positioning.current.scale.y *
            this.applicationMediaInstance.applicationMedia.aspect
          : this.positioning.current.scale.x,
        y: this.positioning.current.scale.y,
      };

      this.setRerender((prev) => !prev);
    }
  };

  handleApplicationMessages = (event: ApplicationListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.onDownloadComplete();
        break;
      case "stateChanged":
        this.setRerender((prev) => !prev);
        break;
      default:
        break;
    }
  };
}

export default ApplicationController;
