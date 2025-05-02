import {
  UserEffectsStylesType,
  UserEffectsType,
} from "../../../universal/effectsTypeConstant";
import MediasoupSocketController from "../serverControllers/mediasoupServer/MediasoupSocketController";
import {
  onBundleMetadataRequestedType,
  onRequestedCatchUpDataType,
} from "../serverControllers/mediasoupServer/lib/typeConstant";
import { UserMediaType } from "../context/mediaContext/typeConstant";

class Metadata {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private tableId: React.MutableRefObject<string>,
    private username: React.MutableRefObject<string>,
    private instance: React.MutableRefObject<string>,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private mutedAudioRef: React.MutableRefObject<boolean>,
    private userEffects: React.MutableRefObject<UserEffectsType>,
    private userEffectsStyles: React.MutableRefObject<UserEffectsStylesType>,
  ) {}

  onRequestedCatchUpData = (event: onRequestedCatchUpDataType) => {
    const {
      inquiringUsername,
      inquiringInstance,
      inquiredType,
      inquiredProducerId,
    } = event.header;

    let data;
    if (inquiredType === "camera" && inquiredProducerId) {
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
    } else if (inquiredType === "screen" && inquiredProducerId) {
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
          `${this.username.current}_${this.instance.current}_audio_element_container`,
        )
        ?.getAttribute("data-positioning");
      const positioning = JSON.parse(dataPositioningValue || "{}");
      data = {
        positioning,
      };
    }

    this.mediasoupSocket.current?.sendMessage({
      type: "responseCatchUpData",
      header: {
        tableId: this.tableId.current,
        inquiringUsername,
        inquiringInstance,
        inquiredUsername: this.username.current,
        inquiredInstance: this.instance.current,
        inquiredType,
        inquiredProducerId,
      },
      data,
    });
  };

  onBundleMetadataRequested = (event: onBundleMetadataRequestedType) => {
    const { inquiringUsername, inquiringInstance } = event.header;

    this.mediasoupSocket.current?.sendMessage({
      type: "bundleMetadataResponse",
      header: {
        tableId: this.tableId.current,
        inquiringUsername,
        inquiringInstance,
        inquiredUsername: this.username.current,
        inquiredInstance: this.instance.current,
      },
      data: {
        clientMute: this.mutedAudioRef.current,
        streamEffects: this.userEffects.current,
        userEffectsStyles: this.userEffectsStyles.current,
      },
    });
  };
}

export default Metadata;
