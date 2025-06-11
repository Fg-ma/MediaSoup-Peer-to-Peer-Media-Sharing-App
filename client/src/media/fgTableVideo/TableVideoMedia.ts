import { StaticContentEffectsType } from "../../../../universal/effectsTypeConstant";
import TableVideoAudioMedia from "./TableVideoAudioMedia";
import {
  TableContentStateTypes,
  LoadingStateTypes,
  StaticMimeTypes,
} from "../../../../universal/contentTypeConstant";

const videoServerBaseUrl = process.env.VIDEO_SERVER_BASE_URL;

export type VideoListenerTypes =
  | { type: "downloadComplete" }
  | { type: "stateChanged" };

class TableVideoMedia {
  thumbnail: HTMLImageElement;

  loadingState: LoadingStateTypes = "downloading";
  aspect: number | undefined;

  private videoListeners: Set<(message: VideoListenerTypes) => void> =
    new Set();

  private audioStream?: MediaStream;
  private videoAudioMedia?: TableVideoAudioMedia;

  constructor(
    public videoId: string,
    public filename: string,
    public mimeType: StaticMimeTypes,
    public state: TableContentStateTypes[],
    private staticContentEffects: React.MutableRefObject<StaticContentEffectsType>,
  ) {
    this.thumbnail = document.createElement("img");
    this.thumbnail.src = `${videoServerBaseUrl}stream-video-thumbnail/${this.videoId}`;
    this.thumbnail.onload = () => {
      this.aspect = this.thumbnail.naturalWidth / this.thumbnail.naturalHeight;

      this.loadingState = "downloaded";

      this.videoListeners.forEach((listener) => {
        listener({ type: "downloadComplete" });
      });
    };
  }

  deconstructor() {
    this.videoListeners.clear();
  }

  downloadVideo = () => {
    const link = document.createElement("a");
    link.href = `${videoServerBaseUrl}download-video/${this.videoId}/video.mp4`;
    link.download = "video.mp4";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  addVideoListener = (
    listener: (message: VideoListenerTypes) => void,
  ): void => {
    this.videoListeners.add(listener);
  };

  removeVideoListener = (
    listener: (message: VideoListenerTypes) => void,
  ): void => {
    this.videoListeners.delete(listener);
  };

  setState = (state: TableContentStateTypes[]) => {
    this.state = state;

    this.videoListeners.forEach((listener) => {
      listener({ type: "stateChanged" });
    });
  };
}

export default TableVideoMedia;
