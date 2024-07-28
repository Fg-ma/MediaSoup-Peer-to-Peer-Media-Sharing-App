import * as mediasoup from "mediasoup-client";
import CameraMedia from "./lib/CameraMedia";
import ScreenMedia from "./lib/ScreenMedia";
import AudioMedia from "./lib/AudioMedia";

class BrowserMedia {
  private device;
  private userMedia;
  private handleDisableEnableBtns;
  private isCamera;
  private setCameraActive;
  private isScreen;
  private setScreenActive;
  private isAudio;
  private setAudioActive;

  constructor(
    device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    handleDisableEnableBtns: (disabled: boolean) => void,
    isCamera: React.MutableRefObject<boolean>,
    setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    isScreen: React.MutableRefObject<boolean>,
    setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    isAudio: React.MutableRefObject<boolean>,
    setAudioActive: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    this.device = device;
    this.userMedia = userMedia;
    this.handleDisableEnableBtns = handleDisableEnableBtns;
    this.isCamera = isCamera;
    this.setCameraActive = setCameraActive;
    this.isScreen = isScreen;
    this.setScreenActive = setScreenActive;
    this.isAudio = isAudio;
    this.setAudioActive = setAudioActive;
  }

  getBrowserMedia = async (type: "camera" | "screen" | "audio") => {
    if (
      type === "camera" &&
      this.device.current &&
      !this.device.current.canProduce("video")
    ) {
      console.error("Cannot produce video");
      return;
    }

    if (
      type === "audio" &&
      this.device.current &&
      !this.device.current.canProduce("audio")
    ) {
      console.error("Cannot produce audio");
      return;
    }

    const constraints: MediaStreamConstraints =
      type === "camera" || type === "screen"
        ? { video: true, audio: false }
        : { video: false, audio: true };

    try {
      let stream;
      if (type === "camera" || type === "audio") {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else if (type === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } else {
        throw new Error("Invalid media type");
      }

      return stream;
    } catch (error) {
      this.handleDisableEnableBtns(false);
      if (
        type === "camera" &&
        Object.keys(this.userMedia.current.camera).length === 0
      ) {
        this.isCamera.current = false;
        this.setCameraActive(false);
      }
      if (
        type === "screen" &&
        Object.keys(this.userMedia.current.screen).length === 0
      ) {
        this.isScreen.current = false;
        this.setScreenActive(false);
      }
      if (type === "audio" && this.userMedia.current.audio === undefined) {
        this.isAudio.current = false;
        this.setAudioActive(false);
      }
      console.error("Error accessing media devices:", error);
      return;
    }
  };
}

export default BrowserMedia;
