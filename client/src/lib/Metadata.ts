import { Socket } from "socket.io-client";
import {
  UserEffectsStylesType,
  AudioEffectTypes,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../context/effectsContext/typeConstant";
import CameraMedia from "./CameraMedia";
import ScreenMedia from "./ScreenMedia";
import AudioMedia from "./AudioMedia";
import {
  onBundleMetadataRequestedType,
  onRequestedCatchUpDataType,
} from "../Main";

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
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>
  ) {}

  onRequestedCatchUpData = (event: onRequestedCatchUpDataType) => {
    const {
      inquiringUsername,
      inquiringInstance,
      inquiredType,
      inquiredProducerId,
    } = event.data;

    let data;
    if (inquiredType === "camera") {
      const cameraMedia = this.userMedia.current.camera[inquiredProducerId];
      const dataPositioningValue = document
        .getElementById(`${inquiredProducerId}_container`)
        ?.getAttribute("data-positioning");
      const positioning = JSON.parse(dataPositioningValue || "{}");
      data = {
        paused: cameraMedia.getPaused(),
        timeEllapsed: cameraMedia.getTimeEllapsed(),
        positioning,
      };
    } else if (inquiredType === "screen") {
      const screenMedia = this.userMedia.current.screen[inquiredProducerId];
      const dataPositioningValue = document
        .getElementById(`${inquiredProducerId}_container`)
        ?.getAttribute("data-positioning");
      const positioning = JSON.parse(dataPositioningValue || "{}");
      data = {
        paused: screenMedia.getPaused(),
        timeEllapsed: screenMedia.getTimeEllapsed(),
        positioning,
      };
    } else if (inquiredType === "audio") {
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
      data: {
        table_id: this.table_id.current,
        inquiringUsername,
        inquiringInstance,
        inquiredUsername: this.username.current,
        inquiredInstance: this.instance.current,
        inquiredType,
        inquiredProducerId,
        data,
      },
    };
    this.socket.current.emit("message", msg);
  };

  onBundleMetadataRequested = (event: onBundleMetadataRequestedType) => {
    const { inquiringUsername, inquiringInstance } = event.data;

    const msg = {
      type: "bundleMetadataResponse",
      data: {
        table_id: this.table_id.current,
        inquiringUsername,
        inquiringInstance,
        inquiredUsername: this.username.current,
        inquiredInstance: this.instance.current,
        clientMute: this.mutedAudioRef.current,
        streamEffects: this.userStreamEffects.current,
        userEffectsStyles: this.userEffectsStyles.current,
      },
    };

    this.socket.current.emit("message", msg);
  };
}

export default Metadata;
