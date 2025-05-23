import { types } from "mediasoup-client";
import { UserMedia } from "tone";
import { UserMediaType } from "../context/mediaContext/typeConstant";
import { GeneralSignals } from "../context/signalContext/lib/typeConstant";

class BrowserMedia {
  constructor(
    private device: React.MutableRefObject<types.Device | undefined>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private isCamera: React.MutableRefObject<boolean>,
    private setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    private isScreen: React.MutableRefObject<boolean>,
    private setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    private isAudio: React.MutableRefObject<boolean>,
    private setAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
    private handleDisableEnableBtns: (disabled: boolean) => void,
    private sendGeneralSignal: (signal: GeneralSignals) => void,
  ) {}

  getCameraMedia = async () => {
    if (this.device.current && !this.device.current.canProduce("video")) {
      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: "Error accessing camera",
          timeout: 1750,
        },
      });
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

      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: "Error accessing camera",
          timeout: 1750,
        },
      });
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

      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: "Error accessing screen",
          timeout: 1750,
        },
      });
      return;
    }
  };

  getAudioMedia = async () => {
    if (this.device.current && !this.device.current.canProduce("audio")) {
      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: "Error accessing microphone",
          timeout: 1750,
        },
      });
      return;
    }

    if (navigator.permissions) {
      const status = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      if (status.state === "denied") {
        this.sendGeneralSignal({
          type: "tableInfoSignal",
          data: {
            message: "Error accessing microphone",
            timeout: 1750,
          },
        });
        return;
      }
    }

    try {
      const mic = new UserMedia();
      return mic;
    } catch (error) {
      this.handleDisableEnableBtns(false);
      if (this.userMedia.current.audio === undefined) {
        this.isAudio.current = false;
        this.setAudioActive(false);
      }

      this.sendGeneralSignal({
        type: "tableInfoSignal",
        data: {
          message: "Error accessing microphone check permissions",
          timeout: 1750,
        },
      });
      return;
    }
  };
}

export default BrowserMedia;
