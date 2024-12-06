import { Socket } from "socket.io-client";
import CameraMedia from "./CameraMedia";
import ScreenMedia from "./ScreenMedia";
import AudioMedia from "./AudioMedia";
import {
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/streamsContext/typeConstant";
import { EffectStylesType } from "../context/currentEffectsStylesContext/typeConstant";

class Metadata {
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
    }>,
    private mutedAudioRef: React.MutableRefObject<boolean>,
    private userStreamEffects: React.MutableRefObject<{
      camera: {
        [cameraId: string]: {
          [effectType in CameraEffectTypes]: boolean;
        };
      };
      screen: {
        [screenId: string]: { [effectType in ScreenEffectTypes]: boolean };
      };
      audio: {
        [effectType in AudioEffectTypes]: boolean;
      };
    }>,
    private currentEffectsStyles: React.MutableRefObject<EffectStylesType>
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
      const dataPositioningValue = document
        .getElementById(`${event.inquiredVideoId}_container`)
        ?.getAttribute("data-positioning");
      const positioning = JSON.parse(dataPositioningValue || "{}");
      data = {
        paused: cameraMedia.getPaused(),
        timeEllapsed: cameraMedia.getTimeEllapsed(),
        positioning,
      };
    } else if (event.inquiredType === "screen") {
      const screenMedia = this.userMedia.current.screen[event.inquiredVideoId];
      const dataPositioningValue = document
        .getElementById(`${event.inquiredVideoId}_container`)
        ?.getAttribute("data-positioning");
      const positioning = JSON.parse(dataPositioningValue || "{}");
      data = {
        paused: screenMedia.getPaused(),
        timeEllapsed: screenMedia.getTimeEllapsed(),
        positioning,
      };
    } else if (event.inquiredType === "audio") {
      const dataPositioningValue = document
        .getElementById(
          `${this.username.current}_${this.instance.current}_audio_element_container`
        )
        ?.getAttribute("data-positioning");
      const positioning = JSON.parse(dataPositioningValue || "{}");
      data = {
        positioning,
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

  onBundleMetadataRequested = (event: {
    type: "bundleMetadataRequested";
    inquiringUsername: string;
    inquiringInstance: string;
  }) => {
    const msg = {
      type: "bundleMetadataResponse",
      table_id: this.table_id.current,
      inquiringUsername: event.inquiringUsername,
      inquiringInstance: event.inquiringInstance,
      inquiredUsername: this.username.current,
      inquiredInstance: this.instance.current,
      data: {
        clientMute: this.mutedAudioRef.current,
        streamEffects: this.userStreamEffects.current,
        currentEffectsStyles: this.currentEffectsStyles.current,
      },
    };

    this.socket.current.emit("message", msg);
  };
}

export default Metadata;
