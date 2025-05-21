import { SvgListenerTypes } from "src/media/fgTableSvg/TableSvgMedia";
import { LoadingStateTypes } from "../../../../../../../../../../universal/contentTypeConstant";
import TableSvgMediaInstance, {
  SvgInstanceListenerTypes,
} from "../../../../../../../../media/fgTableSvg/TableSvgMediaInstance";

class SvgSelectionController {
  constructor(
    private svgInstanceMedia: TableSvgMediaInstance,
    private svgMirror: React.MutableRefObject<SVGSVGElement | undefined>,
    private svgContainerRef: React.RefObject<HTMLDivElement>,
    private setLoadingState: React.Dispatch<
      React.SetStateAction<LoadingStateTypes>
    >,
  ) {}

  handleInstanceEvents = (event: SvgInstanceListenerTypes) => {
    if (event.type === "effectsChanged") {
      if (this.svgMirror.current && this.svgMirror.current.parentElement) {
        this.svgMirror.current.parentElement.removeChild(
          this.svgMirror.current,
        );
      }

      if (this.svgInstanceMedia.instanceSvg) {
        this.svgMirror.current = this.svgInstanceMedia.instanceSvg.cloneNode(
          true,
        ) as SVGSVGElement;
        this.svgMirror.current.setAttribute("height", "100%");
        this.svgMirror.current.setAttribute("width", "auto");
        this.svgMirror.current.setAttribute("maxHeight", "12rem");
        this.svgContainerRef.current?.appendChild(this.svgMirror.current);
      }
    }
  };

  handleSvgMessages = (event: SvgListenerTypes) => {
    switch (event.type) {
      case "downloadComplete":
        this.setLoadingState("downloaded");
        break;
      case "downloadFailed":
        this.setLoadingState("failed");
        break;
      case "downloadPaused":
        this.setLoadingState("paused");
        break;
      case "downloadResumed":
        this.setLoadingState("downloading");
        break;
      case "downloadRetry":
        this.setLoadingState("downloading");
        break;
      default:
        break;
    }
  };
}

export default SvgSelectionController;
