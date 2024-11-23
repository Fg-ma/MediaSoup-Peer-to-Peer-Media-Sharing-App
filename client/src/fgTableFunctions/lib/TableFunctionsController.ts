import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";
import AudioMedia from "src/lib/AudioMedia";
import CameraMedia from "src/lib/CameraMedia";
import ScreenMedia from "src/lib/ScreenMedia";

class TableFunctionsController {
  constructor(
    private socket: React.MutableRefObject<Socket>,
    private tableIdRef: React.RefObject<HTMLInputElement>,
    private usernameRef: React.RefObject<HTMLInputElement>,
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private setIsInTable: React.Dispatch<React.SetStateAction<boolean>>,
    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>,
    private userCameraCount: React.MutableRefObject<number>,
    private userScreenCount: React.MutableRefObject<number>,
    private remoteTracksMap: React.MutableRefObject<{
      [username: string]: {
        camera?:
          | {
              [cameraId: string]: MediaStreamTrack;
            }
          | undefined;
        screen?:
          | {
              [screenId: string]: MediaStreamTrack;
            }
          | undefined;
        audio?: MediaStreamTrack | undefined;
      };
    }>,
    private handleDisableEnableBtns: (disabled: boolean) => void,
    private setBundles: React.Dispatch<
      React.SetStateAction<{
        [username: string]: { [instance: string]: React.JSX.Element };
      }>
    >,
    private consumerTransport: React.MutableRefObject<
      mediasoup.types.Transport<mediasoup.types.AppData> | undefined
    >,
    private producerTransport: React.MutableRefObject<
      mediasoup.types.Transport<mediasoup.types.AppData> | undefined
    >,
    private isCamera: React.MutableRefObject<boolean>,
    private setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
    private isScreen: React.MutableRefObject<boolean>,
    private setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
    private isAudio: React.MutableRefObject<boolean>,
    private setAudioActive: React.Dispatch<React.SetStateAction<boolean>>,
    private setMutedAudio: React.Dispatch<React.SetStateAction<boolean>>,
    private mutedAudioRef: React.MutableRefObject<boolean>,
    private setSubscribedActive: React.Dispatch<React.SetStateAction<boolean>>,
    private isSubscribed: React.MutableRefObject<boolean>,
    private device: React.MutableRefObject<mediasoup.types.Device | undefined>,
    private subBtnRef: React.RefObject<HTMLButtonElement>
  ) {}

  joinTable = () => {
    const previousTableId = this.table_id.current;
    const previousUsername = this.username.current;

    if (
      this.table_id.current === this.tableIdRef.current?.value &&
      this.username.current === this.usernameRef.current?.value
    ) {
      return;
    }

    if (this.tableIdRef.current) {
      this.table_id.current = this.tableIdRef.current?.value;
    }
    if (this.usernameRef.current) {
      this.username.current = this.usernameRef.current?.value;
    }
    if (
      this.table_id.current.trim() !== "" &&
      this.username.current.trim() !== ""
    ) {
      // Leave previous table if there is one
      if (previousTableId.trim() !== "" && previousUsername.trim() !== "") {
        this.socket.current.emit(
          "leaveTable",
          previousTableId,
          previousUsername,
          this.instance.current
        );
        this.leaveTable();
      }

      // Join new table
      this.socket.current.emit(
        "joinTable",
        this.table_id.current,
        this.username.current,
        this.instance.current
      );
      this.setIsInTable(true);
    }
  };

  private leaveTable = () => {
    for (const cameraId in this.userMedia.current.camera) {
      this.userMedia.current.camera[cameraId].deconstructor();
      delete this.userMedia.current.camera[cameraId];
    }
    this.userCameraCount.current = 0;

    for (const screenId in this.userMedia.current.screen) {
      this.userMedia.current.screen[screenId].deconstructor();
      delete this.userMedia.current.screen[screenId];
    }
    this.userScreenCount.current = 0;

    if (this.userMedia.current.audio) {
      this.userMedia.current.audio.deconstructor();
      this.userMedia.current.audio = undefined;
    }

    this.remoteTracksMap.current = {};

    this.handleDisableEnableBtns(false);
    this.device.current = undefined;
    this.setBundles({});
    this.consumerTransport.current = undefined;
    this.producerTransport.current = undefined;
    this.isCamera.current = false;
    this.setCameraActive(false);
    this.isScreen.current = false;
    this.setScreenActive(false);
    this.isAudio.current = false;
    this.setAudioActive(false);
    this.setMutedAudio(false);
    this.mutedAudioRef.current = false;
    this.setSubscribedActive(false);
    this.isSubscribed.current = false;
    this.setIsInTable(false);
  };

  subscribe = () => {
    if (!this.table_id.current || !this.username.current) {
      console.error("Missing table_id or username!");
      return;
    }
    this.subBtnRef.current!.disabled = true;
    this.isSubscribed.current = !this.isSubscribed.current;
    this.setSubscribedActive((prev) => !prev);

    if (this.isSubscribed.current) {
      const msg = {
        type: "createConsumerTransport",
        forceTcp: false,
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
      };

      this.socket.current.send(msg);
    } else if (!this.isSubscribed.current) {
      this.consumerTransport.current = undefined;

      this.setBundles((prev) => {
        const previousBundles = { ...prev };

        for (const bundleUsername in previousBundles) {
          if (bundleUsername !== this.username.current) {
            delete previousBundles[bundleUsername];
          } else {
            for (const bundleInstance in previousBundles[bundleUsername]) {
              if (bundleInstance !== this.instance.current) {
                delete previousBundles[bundleUsername][bundleInstance];
              }
            }
          }
        }
        return previousBundles;
      });
      this.remoteTracksMap.current = {};

      const msg = {
        type: "unsubscribe",
        table_id: this.table_id.current,
        username: this.username.current,
        instance: this.instance.current,
      };
      this.socket.current.emit("message", msg);
      this.socket.current.on("message", (event) => {
        if (event.type === "unsubscribed") {
          this.subBtnRef.current!.disabled = false;
        }
      });
    }
  };
}

export default TableFunctionsController;
