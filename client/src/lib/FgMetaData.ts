import { Socket } from "socket.io-client";
import CameraMedia from "./CameraMedia";
import ScreenMedia from "./ScreenMedia";
import AudioMedia from "./AudioMedia";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";

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
    inquiredType: "camera" | "screen" | "audio";
    inquiredVideoId: string;
  }) => {
    let data;
    if (event.inquiredType === "camera") {
      const cameraMedia = this.userMedia.current.camera[event.inquiredVideoId];
      data = {
        cameraPaused: cameraMedia.getPaused(),
        cameraTimeEllapsed: cameraMedia.getTimeEllapsed(),
      };
    } else if (event.inquiredType === "screen") {
      const screenMedia = this.userMedia.current.screen[event.inquiredVideoId];
      data = {
        screenPaused: screenMedia.getPaused(),
        screenTimeEllapsed: screenMedia.getTimeEllapsed(),
      };
    }

    const msg = {
      type: "responseCatchUpData",
      table_id: this.table_id.current,
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
      inquiredUsername: this.username.current,
      inquiredInstance: this.instance.current,
      inquiredType: event.inquiredType,
      inquiredVideoId: event.inquiredVideoId,
      data,
    };
    this.socket.current.emit("message", msg);
  };
}

export default FgMetaData;
