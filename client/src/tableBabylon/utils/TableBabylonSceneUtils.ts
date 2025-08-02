import { Tools, Engine, UniversalCamera } from "@babylonjs/core";

class TableBabylonSceneUtils {
  readonly recordingMimeTypeExtensionMap = {
    "video/webm; codecs=vp9": ".webm",
    "video/webm; codecs=vp8": ".webm",
    "video/webm; codecs=av1": ".webm",
    "video/ogg": ".ogg",
  };

  readonly mimeTypeExtensionMap: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "image/heic": ".heic",
  };

  mediaRecorder: MediaRecorder | undefined = undefined;
  chunks: Blob[] = [];
  recordingURL: string | undefined;
  recordingMimeType: string | undefined;

  snapShotURL: string | undefined;
  snapShotExtension: string | undefined;

  private screenShotSuccessCallbacks: (() => void)[] = [];
  private videoSuccessCallbacks: (() => void)[] = [];

  constructor(
    private engine: Engine,
    private camera: UniversalCamera,
    private canvas: HTMLCanvasElement,
  ) {}

  deconstructor = () => {
    this.chunks = [];
    if (this.recordingURL) {
      URL.revokeObjectURL(this.recordingURL);
      this.recordingURL = undefined;
    }
  };

  downloadSnapShot = (mimeType?: string, quality?: number) => {
    if (this.engine) {
      Tools.CreateScreenshot(
        this.engine,
        this.camera,
        {
          width: this.engine.getRenderWidth(),
          height: this.engine.getRenderHeight(),
        },
        (dataUrl) => {
          // Create a link element for download
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `scene-snapshot${this.mimeTypeExtensionMap[mimeType ?? "image/png"] ?? ".png"}`;

          // Simulate a click to download the image
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        mimeType ?? "image/png",
        undefined,
        quality,
      );
    }
  };

  getSnapShotURL = (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (this.engine && this.camera) {
        Tools.CreateScreenshot(
          this.engine,
          this.camera,
          {
            width: this.engine.getRenderWidth(),
            height: this.engine.getRenderHeight(),
            precision: 1,
          },
          (dataUrl) => {
            resolve(dataUrl);
          },
        );
      } else {
        resolve(undefined);
      }
    });
  };

  takeSnapShot = (mimeType?: string, quality?: number) => {
    if (this.engine) {
      Tools.CreateScreenshot(
        this.engine,
        this.camera,
        {
          width: this.engine.getRenderWidth(),
          height: this.engine.getRenderHeight(),
        },
        (dataUrl) => {
          this.snapShotURL = dataUrl;
          this.snapShotExtension =
            this.mimeTypeExtensionMap[mimeType ?? "image/png"] ?? ".png";
        },
        mimeType ?? "image/png",
        undefined,
        quality,
      );
    }
  };

  downloadSnapShotLink = () => {
    return this.snapShotURL;
  };

  startRecording = (
    mimeType: string,
    fps: number,
    bitRate?: number | "default",
  ) => {
    this.chunks = [];
    if (this.recordingURL) {
      URL.revokeObjectURL(this.recordingURL);
      this.recordingURL = undefined;
    }

    const stream = this.canvas.captureStream(fps);
    try {
      const options: MediaRecorderOptions = {
        mimeType,
      };
      if (bitRate && bitRate !== "default") {
        options["videoBitsPerSecond"] = bitRate;
      }

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.recordingMimeType = mimeType;
    } catch {
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9",
        ...(bitRate && bitRate !== "default"
          ? { videoBitsPerSecond: bitRate }
          : {}),
      });
      this.recordingMimeType = mimeType;
    }

    // Store recorded data chunks
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: this.recordingMimeType });
      this.chunks = [];

      // Create a download link
      this.recordingURL = URL.createObjectURL(blob);

      this.videoSuccessCallbacks.map((videoSuccessCallback) =>
        videoSuccessCallback(),
      );
    };

    // Start recording
    this.mediaRecorder.start();
  };

  stopRecording = () => {
    this.mediaRecorder?.stop();
  };

  downloadRecording = () => {
    if (!this.recordingURL || !this.recordingMimeType) return;

    const a = document.createElement("a");
    a.href = this.recordingURL;
    a.download = `recording${
      this.recordingMimeTypeExtensionMap[
        this
          .recordingMimeType as keyof typeof this.recordingMimeTypeExtensionMap
      ] ?? ".webm"
    }`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  downloadRecordingLink = () => {
    return this.recordingURL;
  };

  addScreenShotSuccessCallback = (screenShotSuccessCallback: () => void) => {
    this.screenShotSuccessCallbacks.push(screenShotSuccessCallback);
  };

  removeScreenShotSuccessCallback = (screenShotSuccessCallback: () => void) => {
    this.screenShotSuccessCallbacks = this.screenShotSuccessCallbacks.filter(
      (callback) => callback !== screenShotSuccessCallback,
    );
  };

  addVideoSuccessCallback = (videoSuccessCallback: () => void) => {
    this.videoSuccessCallbacks.push(videoSuccessCallback);
  };

  removeVideoSuccessCallback = (VideoSuccessCallback: () => void) => {
    this.videoSuccessCallbacks = this.videoSuccessCallbacks.filter(
      (callback) => callback !== VideoSuccessCallback,
    );
  };

  getReadPixels = () => {
    return this.engine.readPixels(
      0,
      0,
      this.engine.getRenderWidth(),
      this.engine.getRenderHeight(),
    );
  };
}

export default TableBabylonSceneUtils;
