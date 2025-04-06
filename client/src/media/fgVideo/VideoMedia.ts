import shaka from "shaka-player";
import { UserEffectsType } from "../../../../universal/effectsTypeConstant";
import {
  IncomingTableStaticContentMessages,
  TableTopStaticMimeType,
} from "../../serverControllers/tableStaticContentServer/lib/typeConstant";
import VideoAudioMedia from "./VideoAudioMedia";
import {
  ContentStateTypes,
  StaticContentTypes,
} from "../../../../universal/contentTypeConstant";

class VideoMedia {
  video: HTMLVideoElement | undefined;
  shakaPlayer: shaka.Player;
  hiddenVideo: HTMLVideoElement | undefined;
  hiddenShakaPlayer: shaka.Player | undefined;

  dashUrl: string | undefined;

  private fileChunks: Uint8Array[] = [];
  private totalSize = 0;
  private blobURL: string | undefined;
  aspect: number | undefined;

  private downloadCompleteListeners: Set<() => void> = new Set();

  private audioStream?: MediaStream;
  private videoAudioMedia?: VideoAudioMedia;

  constructor(
    public videoId: string,
    public filename: string,
    public mimeType: TableTopStaticMimeType,
    public state: ContentStateTypes[],
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private getVideo: (
      contentType: StaticContentTypes,
      contentId: string,
      key: string
    ) => void,
    private addMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void,
    private removeMessageListener: (
      listener: (message: IncomingTableStaticContentMessages) => void
    ) => void
  ) {
    // this.shakaPlayer = new shaka.Player(this.video);

    // if (this.dashUrl) {
    //   this.shakaPlayer.load(this.dashUrl).then(() => {
    //     console.log("Dash video loaded successfully");
    //   });
    // } else {
    //   this.shakaPlayer.load(this.originalVideoURL).then(() => {
    //     console.log("Original video loaded successfully");
    //   });

    //   this.hiddenVideo = document.createElement("video");
    //   this.hiddenVideo.style.position = "absolute";
    //   this.hiddenVideo.style.top = "0";
    //   this.hiddenVideo.style.left = "0";
    //   this.hiddenVideo.style.objectFit = "cover";
    //   this.hiddenVideo.style.backgroundColor = "#000";
    //   this.hiddenVideo.style.zIndex = "10";
    //   this.hiddenVideo.style.display = "none";
    //   this.hiddenVideo.style.opacity = "0%";
    //   this.hiddenVideo.muted = true;
    //   this.hiddenShakaPlayer = new shaka.Player(this.hiddenVideo);
    // }

    this.getVideo("video", this.videoId, this.filename);
    this.addMessageListener(this.getVideoListener);
  }

  deconstructor() {
    if (this.blobURL) URL.revokeObjectURL(this.blobURL);

    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video = undefined;
    }

    if (this.hiddenVideo) {
      this.hiddenVideo.pause();
      this.hiddenVideo.srcObject = null;
      this.hiddenVideo = undefined;
    }

    // Destroy Shaka players to release resources
    if (this.shakaPlayer) {
      this.shakaPlayer.destroy().catch((error) => {
        console.error("Error destroying Shaka player:", error);
      });
    }
    if (this.hiddenShakaPlayer) {
      this.hiddenShakaPlayer.destroy().catch((error) => {
        console.error("Error destroying hidden Shaka player:", error);
      });
    }
  }

  private getVideoListener = (message: IncomingTableStaticContentMessages) => {
    if (message.type === "chunk") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "video" ||
        contentId !== this.videoId ||
        key !== this.filename
      ) {
        return;
      }

      const chunkData = new Uint8Array(message.data.chunk.data);
      this.fileChunks.push(chunkData);
      this.totalSize += chunkData.length;
    } else if (message.type === "downloadComplete") {
      const { contentType, contentId, key } = message.header;

      if (
        contentType !== "video" ||
        contentId !== this.videoId ||
        key !== this.filename
      ) {
        return;
      }

      const mergedBuffer = new Uint8Array(this.totalSize);
      let offset = 0;

      for (const chunk of this.fileChunks) {
        mergedBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const blob = new Blob([mergedBuffer], { type: this.mimeType });
      this.blobURL = URL.createObjectURL(blob);
      this.video = document.createElement("video");
      this.video.src = this.blobURL;

      this.video.addEventListener("loadeddata", () => {
        this.aspect =
          (this.video?.videoWidth ?? 1) / (this.video?.videoHeight ?? 1);

        this.audioStream = (this.video as any).captureStream();

        if (this.audioStream && this.audioStream.getAudioTracks().length > 0) {
          this.videoAudioMedia = new VideoAudioMedia(
            this.videoId,
            this.audioStream,
            this.userEffects
          );
        }

        this.downloadCompleteListeners.forEach((listener) => {
          listener();
        });
      });

      this.removeMessageListener(this.getVideoListener);
    }
  };

  preloadDashStream = (url: string) => {
    this.dashUrl = url;

    if (!this.hiddenShakaPlayer) return;

    if (this.dashUrl) {
      this.hiddenShakaPlayer.load(this.dashUrl).then(() => {
        this.switchToDashStream();
      });
    }
  };

  switchToDashStream = async () => {
    console.log("DASH stream swap");

    if (!this.hiddenVideo || !this.video) return;

    try {
      const currentTime = this.video.currentTime;
      const isPaused = this.video.paused;

      // Sync hidden video with the main video
      this.hiddenVideo.currentTime = currentTime;
      if (!isPaused) {
        this.hiddenVideo.play();
      }
      this.hiddenVideo.muted = false;

      const videoBox = this.video.getBoundingClientRect();

      this.hiddenVideo.width = videoBox.width;
      this.hiddenVideo.height = videoBox.height;

      this.hiddenVideo.style.display = "";
      this.hiddenVideo.style.opacity = "100%";

      // After a short delay, switch the main video to DASH and hide the hidden video
      setTimeout(async () => {
        if (!this.dashUrl || !this.hiddenVideo || !this.video) return;

        await this.shakaPlayer?.load(
          this.dashUrl,
          this.hiddenVideo.currentTime
        );

        this.video.width = videoBox.width;
        this.video.height = videoBox.height;

        this.video.currentTime = this.hiddenVideo.currentTime;
        if (!this.hiddenVideo.paused) {
          this.video.play();
        }

        this.hiddenVideo.muted = true;

        // Hide the hidden video and clean up
        setTimeout(() => {
          if (this.hiddenVideo) {
            this.hiddenVideo.pause();
            this.hiddenVideo.remove();
            this.hiddenVideo.srcObject = null;
            this.hiddenVideo = undefined;
          }
        }, 250);
      }, 500); // Adjust the delay if needed
    } catch (error) {
      console.error("Error during DASH switch:", error);
    }
  };

  downloadVideo = () => {
    if (!this.blobURL) {
      return;
    }

    const link = document.createElement("a");
    link.href = this.blobURL;
    link.download = "downloaded-video.mp4";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  addDownloadCompleteListener = (listener: () => void): void => {
    this.downloadCompleteListeners.add(listener);
  };

  removeDownloadCompleteListener = (listener: () => void): void => {
    this.downloadCompleteListeners.delete(listener);
  };
}

export default VideoMedia;
