import * as mediasoup from "mediasoup-client";
import * as Tone from "tone";
import CameraMedia from "./lib/CameraMedia";
import ScreenMedia from "./lib/ScreenMedia";
import AudioMedia from "./lib/AudioMedia";

class BrowserMedia {
  private device: React.MutableRefObject<mediasoup.types.Device | undefined>;
  private userMedia: React.MutableRefObject<{
    camera: {
      [cameraId: string]: CameraMedia;
    };
    screen: {
      [screenId: string]: ScreenMedia;
    };
    audio: AudioMedia | undefined;
  }>;
  private isCamera: React.MutableRefObject<boolean>;
  private setCameraActive: React.Dispatch<React.SetStateAction<boolean>>;
  private isScreen: React.MutableRefObject<boolean>;
  private setScreenActive: React.Dispatch<React.SetStateAction<boolean>>;
  private isAudio: React.MutableRefObject<boolean>;
  private setAudioActive: React.Dispatch<React.SetStateAction<boolean>>;
  private handleDisableEnableBtns: (disabled: boolean) => void;

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
    isCamera: React.MutableRefObject<boolean>,
    setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    isScreen: React.MutableRefObject<boolean>,
    setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    isAudio: React.MutableRefObject<boolean>,
    setAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
    handleDisableEnableBtns: (disabled: boolean) => void
  ) {
    this.device = device;
    this.userMedia = userMedia;
    this.isCamera = isCamera;
    this.setCameraActive = setCameraActive;
    this.isScreen = isScreen;
    this.setScreenActive = setScreenActive;
    this.isAudio = isAudio;
    this.setAudioActive = setAudioActive;
    this.handleDisableEnableBtns = handleDisableEnableBtns;
  }

  getCameraMedia = async () => {
    if (this.device.current && !this.device.current.canProduce("video")) {
      console.error("Cannot produce video");
      return;
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: true,
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
        video: true,
        audio: false,
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
    if (this.device.current && !this.device.current.canProduce("audio")) {
      console.error("Cannot produce audio");
      return;
    }

    try {
      return new Tone.UserMedia();
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
