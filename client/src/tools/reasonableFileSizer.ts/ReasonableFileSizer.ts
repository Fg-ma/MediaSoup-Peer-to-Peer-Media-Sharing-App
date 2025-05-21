class ReasonableFileSizer {
  private maxSize: number;
  private maxDim: number;

  constructor(maxSizeMB: number = 100, maxDim: number = 128) {
    this.maxSize = maxSizeMB * 1024 * 1024;
    this.maxDim = maxDim;
  }

  private createResizeWorker(): Worker {
    const workerCode = `
      self.onmessage = async function(e) {
        const { fileData, fileType, mimeType, maxDim } = e.data;
        try {
          if (fileType.startsWith("image/")) {
            const blob = new Blob([fileData], { type: mimeType });
            const imgBitmap = await createImageBitmap(blob);
            let scale = Math.min(maxDim / imgBitmap.width, maxDim / imgBitmap.height, 1);
            let canvasWidth = Math.round(imgBitmap.width * scale);
            let canvasHeight = Math.round(imgBitmap.height * scale);
            const offscreen = new OffscreenCanvas(canvasWidth, canvasHeight);
            const ctx = offscreen.getContext("2d");
            ctx.drawImage(imgBitmap, 0, 0, canvasWidth, canvasHeight);
            const blobThumb = await offscreen.convertToBlob({ type: mimeType });
            const reader = new FileReader();
            reader.onload = () => self.postMessage({ url: reader.result });
            reader.onerror = () => self.postMessage({ url: undefined });
            reader.readAsDataURL(blobThumb);
          } else {
            self.postMessage({ url: undefined });
          }
        } catch (err) {
          self.postMessage({ url: undefined });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
  }

  private async generateVideoThumbnail(
    file: File,
  ): Promise<string | undefined> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = 0;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(
          this.maxDim / video.videoWidth,
          this.maxDim / video.videoHeight,
          1,
        );
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(undefined);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };

      video.onerror = () => {
        resolve(undefined);
      };
    });
  }

  public async getUrl(file: File): Promise<string | undefined> {
    if (file.size <= this.maxSize) {
      return URL.createObjectURL(file);
    }

    if (file.type === "image/svg+xml") {
      return undefined;
    }

    if (file.type.startsWith("video/")) {
      return this.generateVideoThumbnail(file);
    }

    return new Promise((resolve) => {
      const worker = this.createResizeWorker();
      worker.onmessage = (e) => {
        if (e.data.url) {
          resolve(e.data.url);
        } else {
          resolve(undefined);
        }
        worker.terminate();
      };
      worker.onerror = (err) => {
        resolve(undefined);
        worker.terminate();
      };

      const reader = new FileReader();
      reader.onload = () => {
        worker.postMessage({
          fileData: reader.result,
          fileType: file.type,
          mimeType: file.type,
          maxDim: this.maxDim,
        });
      };
      reader.onerror = () => {
        resolve(undefined);
        worker.terminate();
      };
      reader.readAsArrayBuffer(file);
    });
  }
}

export default ReasonableFileSizer;
