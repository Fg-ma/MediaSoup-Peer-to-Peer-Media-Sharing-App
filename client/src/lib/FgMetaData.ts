import { Socket } from "socket.io-client";
import CameraMedia from "./CameraMedia";
import ScreenMedia from "./ScreenMedia";
import AudioMedia from "./AudioMedia";

class FgMetaData {
  constructor(
    private table_id: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private socket: React.MutableRefObject<Socket>,
    private userMedia: React.MutableRefObject<{
      camera: {
        [cameraId: string]: CameraMedia;
      };
      screen: {
        [screenId: string]: ScreenMedia;
      };
      audio: AudioMedia | undefined;
    }>
  ) {}

  onRequestedCatchUpData = (event: {
    type: "requestedCatchUpData";
    inquiringUsername: string;
    inquiringInstance: string;
    inquiredInstance: string;
  }) => {
    const cameraData = {
      cameraPaused:
        this.userMedia.current.camera[event.inquiringInstance]?.getPaused() ??
        undefined,
      cameraTimeEllapsed:
        this.userMedia.current.camera[
          event.inquiredInstance
        ]?.getTimeEllapsed() ?? undefined,
    };
    const screenData = {
      screenPaused:
        this.userMedia.current.screen[event.inquiringInstance]?.getPaused() ??
        undefined,
      screenTimeEllapsed:
        this.userMedia.current.screen[
          event.inquiredInstance
        ]?.getTimeEllapsed() ?? undefined,
    };

    console.log(
      event.inquiringInstance,
      this.userMedia.current.camera,
      event.inquiredInstance,
      cameraData,
      screenData
    );
    const msg = {
      type: "responseCatchUpData",
      table_id: this.table_id.current,
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
      inquiredUsername: this.username.current,
      inquiredInstance: this.instance.current,
      data: {
        ...cameraData,
        ...screenData,
      },
    };

    this.socket.current.emit("message", msg);
  };
}

export default FgMetaData;
