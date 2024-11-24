class UserDevice {
  private MAX_FRAME_PROCESSING_TIME = 16;
  private MIN_FRAME_INTERVAL = 16;
  private FACE_MESH_DETECTION_INTERVAL = 4;
  private cores = 4;
  private memory = 4;
  private networkSpeed = 0;

  constructor() {
    this.adjustFrameParameters();
  }

  // Function to measure network speed
  private async measureNetworkSpeed() {
    const imageUrl = "/2DAssets/benchMark.png"; // Correct path for testing image
    const fileSizeInBytes = 68.4 * 1024; // Size of the image in Bytes

    try {
      const startTime = performance.now();
      const response = await fetch(imageUrl, { cache: "no-cache" });
      const endTime = performance.now();

      if (!response.ok) {
        throw new Error("Failed to fetch image for network speed test");
      }

      const duration = endTime - startTime; // Time taken to download in milliseconds
      const speedBps = (fileSizeInBytes * 8) / (duration / 1000); // Speed in bits per second
      const speedKbps = speedBps / 1000; // Speed in Kbps

      return speedKbps;
    } catch (error) {
      console.error("Error measuring network speed:", error);
      return 0; // Return 0 in case of an error
    }
  }

  // Function to get hardware information
  private getHardwareInfo() {
    this.cores = navigator.hardwareConcurrency || 4; // Default to 4 if not available
    // @ts-expect-error: navigator types suck
    this.memory = navigator.deviceMemory || 4; // Default to 4GB if not available
  }

  // Function to adjust parameters based on performance
  private async adjustFrameParameters() {
    this.networkSpeed = await this.measureNetworkSpeed();
    this.getHardwareInfo();

    // Adjust based on network speed and hardware capabilities
    if (this.networkSpeed > 10000 && this.cores > 4 && this.memory >= 8) {
      this.MAX_FRAME_PROCESSING_TIME = 8; // Higher processing capability
      this.MIN_FRAME_INTERVAL = 8; // Higher FPS
      this.FACE_MESH_DETECTION_INTERVAL = 4;
    } else if (
      this.networkSpeed > 1000 &&
      this.cores >= 4 &&
      this.memory >= 4
    ) {
      this.MAX_FRAME_PROCESSING_TIME = 16; // Medium processing capability
      this.MIN_FRAME_INTERVAL = 16; // Medium FPS
      this.FACE_MESH_DETECTION_INTERVAL = 6;
    } else {
      this.MAX_FRAME_PROCESSING_TIME = 24; // Lower processing capability
      this.MIN_FRAME_INTERVAL = 24; // Lower FPS
      this.FACE_MESH_DETECTION_INTERVAL = 8;
    }
  }

  getMaxFrameProcessingTime() {
    return this.MAX_FRAME_PROCESSING_TIME;
  }

  getMinFrameInterval() {
    return this.MIN_FRAME_INTERVAL;
  }

  getFaceMeshDetectionInterval() {
    return this.FACE_MESH_DETECTION_INTERVAL;
  }

  getCores() {
    return this.cores;
  }

  getMemory() {
    return this.memory;
  }

  getNetworkSpeed() {
    return this.networkSpeed;
  }
}

export default UserDevice;
