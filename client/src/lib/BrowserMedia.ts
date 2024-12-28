import { types } from "mediasoup-client";
import { UserMedia } from "tone";
import CameraMedia from "./CameraMedia";
import ScreenMedia from "./ScreenMedia";
import AudioMedia from "./AudioMedia";

class BrowserMedia {
  constructor(
    private device: React.MutableRefObject<types.Device | undefined>,
    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    private isCamera: React.MutableRefObject<boolean>,
    private setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    private isScreen: React.MutableRefObject<boolean>,
    private setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    private isAudio: React.MutableRefObject<boolean>,
    private setAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
    private handleDisableEnableBtns: (disabled: boolean) => void
  ) {}

  getCameraMedia = async () => {
    if (this.device.current && !this.device.current.canProduce("video")) {
      console.error("Cannot produce video");
      return;
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
        },
        audio: false,
      });
    } catch (error) {
      this.handleDisableEnableBtns(false);

      if (Object.keys(this.userMedia.current.camera).length === 0) {
        this.isCamera.current = false;
        this.setCameraActive(false);
      }

      console.error("Error accessing camera device:", error);
      return;
    }
  };

  getScreenMedia = async () => {
    try {
      return await navigator.mediaDevices.getDisplayMedia({
        video: {
          height: { max: screen.height },
          width: { max: screen.width },
        },
        audio: true,
      });
    } catch (error) {
      this.handleDisableEnableBtns(false);

      if (Object.keys(this.userMedia.current.screen).length === 0) {
        this.isScreen.current = false;
        this.setScreenActive(false);
      }

      console.error("Error accessing media devices:", error);
      return;
    }
  };

  getAudioMedia = async () => {
    try {
      const mic = new UserMedia();
      return mic;
    } catch (error) {
      this.handleDisableEnableBtns(false);
      if (this.userMedia.current.audio === undefined) {
        this.isAudio.current = false;
        this.setAudioActive(false);
      }
      console.error("Error accessing media devices:", error);
      return;
    }
  };
}

export default BrowserMedia;
