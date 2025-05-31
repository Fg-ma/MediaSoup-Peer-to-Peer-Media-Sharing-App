import { Permissions } from "../../context/permissionsContext/lib/typeConstant";
import { UserMediaType } from "../../context/mediaContext/lib/typeConstant";
import { SliderChangeEvent } from "../../elements/fgSlider/FgSlider";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../audioEffects/typeConstant";
import { DynamicMixEffect, staticMixEffects } from "./typeConstant";
import MediasoupSocketController from "../../serverControllers/mediasoupServer/MediasoupSocketController";
import {
  IncomingMediasoupMessages,
  onClientMixEffectActivityChangedType,
  onClientMixEffectValueChangedType,
  onMixEffectActivityChangeRequestedType,
  onMixEffectValueChangeRequestedType,
} from "../../serverControllers/mediasoupServer/lib/typeConstant";

class AudioMixEffectsPortalController {
  constructor(
    private mediasoupSocket: React.MutableRefObject<
      MediasoupSocketController | undefined
    >,
    private tableId: string,
    private username: string,
    private instance: string,
    private producerType: "audio" | "screenAudio" | "video",
    private producerId: string | undefined,
    private isUser: boolean,
    private permissions: Permissions | undefined,
    private userMedia: React.MutableRefObject<UserMediaType>,
    private setRerender: React.Dispatch<React.SetStateAction<boolean>>,
    private dynamicMixEffects: React.MutableRefObject<{
      [mixEffect in AudioMixEffectsType]: DynamicMixEffect;
    }>,
    private portalRef: React.RefObject<HTMLDivElement>,
    private setSliderValues: React.Dispatch<
      React.SetStateAction<{
        [mixEffect in AudioMixEffectsType]: {
          [option in MixEffectsOptionsType]?: number;
        };
      }>
    >,
  ) {}

  updateSliderExternalSliderValues = (
    id: string,
    value?: number,
    styleValue?: number,
  ) => {
    const [effect, option] = id.split("_");

    if (value) {
      this.setSliderValues((prev) => {
        return {
          ...prev,
          [effect]: {
            ...prev[effect as AudioMixEffectsType],
            [option]: value,
          },
        };
      });
    }
  };

  getPackedPositions = (containerWidth: number, padding: number) => {
    const positions: { x: number; y: number }[] = [];
    const occupiedSpaces: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];

    const activeRectangles = Object.entries(this.dynamicMixEffects.current)
      .filter(([, rect]) => rect.active)
      .map(([key, rect]) => ({
        key,
        ...rect,
        possibleSizes:
          staticMixEffects[key as AudioMixEffectsType].possibleSizes,
      }));

    // Sort rectangles by their largest possible size (width * height)
    activeRectangles.sort((a, b) => {
      const maxSizeA = Math.max(
        ...Object.values(a.possibleSizes).map(([w, h]) => w * h),
      );
      const maxSizeB = Math.max(
        ...Object.values(b.possibleSizes).map(([w, h]) => w * h),
      );
      return maxSizeB - maxSizeA;
    });

    const fitsInContainer = (
      x: number,
      y: number,
      width: number,
      height: number,
    ) => {
      return (
        x + width + padding <= containerWidth &&
        y + height + padding <= Number.MAX_SAFE_INTEGER
      );
    };

    for (const rect of activeRectangles) {
      let placed = false;

      for (const [orientation, [width, height]] of Object.entries(
        rect.possibleSizes,
      )) {
        if (placed) break;

        for (let y = 0; !placed; y++) {
          for (let x = 0; x + width + padding <= containerWidth; x++) {
            if (fitsInContainer(x, y, width, height)) {
              const doesOverlap = occupiedSpaces.some(
                (space) =>
                  x < space.x + space.width + padding &&
                  x + width + padding > space.x &&
                  y < space.y + space.height + padding &&
                  y + height + padding > space.y,
              );

              if (!doesOverlap) {
                positions.push({ x, y });
                occupiedSpaces.push({
                  x,
                  y,
                  width,
                  height,
                });
                rect.orientation = orientation as "horizontal" | "vertical";
                rect.width = width;
                rect.height = height;
                placed = true;
                break;
              }
            }
          }
        }
      }
    }

    const newDynamicMixEffects = { ...this.dynamicMixEffects.current };
    activeRectangles.forEach((rect, index) => {
      if (positions[index]) {
        newDynamicMixEffects[rect.key as AudioMixEffectsType] = {
          ...rect,
          x: positions[index].x + 12,
          y: positions[index].y,
        };
      }
    });

    this.dynamicMixEffects.current = newDynamicMixEffects;
  };

  userMixEffectChange = (active: boolean, effect: AudioMixEffectsType) => {
    this.dynamicMixEffects.current = {
      ...this.dynamicMixEffects.current,
      [effect]: {
        ...this.dynamicMixEffects.current[effect],
        active,
      },
    };

    if (!this.dynamicMixEffects.current[effect].active) {
      if (this.producerType === "audio") {
        this.userMedia.current.audio?.removeMixEffects([effect]);
      } else if (this.producerType === "screenAudio" && this.producerId) {
        this.userMedia.current.screenAudio[this.producerId].removeMixEffects([
          effect,
        ]);
      }
    }

    if (this.portalRef.current) {
      this.getPackedPositions(
        this.portalRef.current.getBoundingClientRect().width - 28,
        28,
      );
    }

    this.setRerender((prev) => !prev);

    if (
      (this.producerType === "audio" &&
        this.permissions?.acceptsAudioEffects) ||
      (this.producerType === "screenAudio" &&
        this.permissions?.acceptsScreenAudioEffects)
    ) {
      this.mediasoupSocket.current?.sendMessage({
        type: "clientMixEffectActivityChange",
        header: {
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
          producerType: this.producerType,
          producerId: this.producerId,
        },
        data: {
          effect,
          active,
        },
      });
    }
  };

  mixEffectChange = (active: boolean, effect: AudioMixEffectsType) => {
    if (this.isUser) {
      this.userMixEffectChange(active, effect);
    } else {
      if (
        (this.producerType === "audio" &&
          this.permissions?.acceptsAudioEffects) ||
        (this.producerType === "screenAudio" &&
          this.permissions?.acceptsScreenAudioEffects)
      ) {
        this.mediasoupSocket.current?.sendMessage({
          type: "requestMixEffectActivityChange",
          header: {
            tableId: this.tableId,
            requestedUsername: this.username,
            requestedInstance: this.instance,
            requestedProducerType: this.producerType,
            requestedProducerId: this.producerId,
          },
          data: {
            effect,
            active,
          },
        });
      }
    }
  };

  userMixEffectValueChange = (
    effect: AudioMixEffectsType,
    option: MixEffectsOptionsType,
    value: number,
    styleValue: number,
  ) => {
    if (
      this.dynamicMixEffects.current[effect] &&
      this.dynamicMixEffects.current[effect].values
    ) {
      this.dynamicMixEffects.current[effect].values[option] = value;
    }

    this.updateSliderExternalSliderValues(
      `${effect}_${option}`,
      value,
      styleValue,
    );

    const effects = [
      {
        type: effect as AudioMixEffectsType,
        updates: [{ option, value }],
      },
    ];

    if (this.producerType === "audio") {
      this.userMedia.current.audio?.mixEffects(effects);
    } else if (this.producerType === "screenAudio" && this.producerId) {
      this.userMedia.current.screenAudio[this.producerId].mixEffects(effects);
    }

    if (
      (this.producerType === "audio" &&
        this.permissions?.acceptsAudioEffects) ||
      (this.producerType === "screenAudio" &&
        this.permissions?.acceptsScreenAudioEffects)
    ) {
      this.mediasoupSocket.current?.sendMessage({
        type: "clientMixEffectValueChange",
        header: {
          tableId: this.tableId,
          username: this.username,
          instance: this.instance,
          producerType: this.producerType,
          producerId: this.producerId,
        },
        data: {
          effect,
          option,
          value,
          styleValue,
        },
      });
    }
  };

  mixEffectValueChange = (event: SliderChangeEvent) => {
    const [effect, option] = event.id.split("_");

    if (this.isUser) {
      this.userMixEffectValueChange(
        effect as AudioMixEffectsType,
        option as MixEffectsOptionsType,
        event.value,
        event.styleValue,
      );
    } else {
      if (
        (this.producerType === "audio" &&
          this.permissions?.acceptsAudioEffects) ||
        (this.producerType === "screenAudio" &&
          this.permissions?.acceptsScreenAudioEffects)
      ) {
        this.mediasoupSocket.current?.sendMessage({
          type: "requestMixEffectValueChange",
          header: {
            tableId: this.tableId,
            requestedUsername: this.username,
            requestedInstance: this.instance,
            requestedProducerType: this.producerType,
            requestedProducerId: this.producerId,
          },
          data: {
            effect: effect as AudioMixEffectsType,
            option,
            value: event.value,
            styleValue: event.styleValue,
          },
        });
      }
    }
  };

  private remoteMixEffectValueChange = (
    effect: AudioMixEffectsType,
    option: MixEffectsOptionsType,
    value: number,
    styleValue: number,
  ) => {
    if (
      this.dynamicMixEffects.current[effect] &&
      this.dynamicMixEffects.current[effect].values
    ) {
      this.dynamicMixEffects.current[effect].values[option] = value;
    }

    this.updateSliderExternalSliderValues(
      `${effect}_${option}`,
      value,
      styleValue,
    );
    this.setRerender((prev) => !prev);
  };

  private remoteMixEffectChange = (
    active: boolean,
    effect: AudioMixEffectsType,
  ) => {
    this.dynamicMixEffects.current = {
      ...this.dynamicMixEffects.current,
      [effect]: {
        ...this.dynamicMixEffects.current[effect],
        active,
      },
    };

    if (this.portalRef.current) {
      this.getPackedPositions(
        this.portalRef.current.getBoundingClientRect().width - 28,
        28,
      );
    }

    this.setRerender((prev) => !prev);
  };

  handleMessage = (event: IncomingMediasoupMessages) => {
    switch (event.type) {
      case "mixEffectActivityChangeRequested":
        this.onMixEffectActivityChangeRequested(event);
        break;
      case "clientMixEffectActivityChanged":
        this.onClientMixEffectActivityChanged(event);
        break;
      case "mixEffectValueChangeRequested":
        this.onMixEffectValueChangeRequested(event);
        break;
      case "clientMixEffectValueChanged":
        this.onClientMixEffectValueChanged(event);
        break;
      default:
        break;
    }
  };

  onMixEffectActivityChangeRequested = (
    event: onMixEffectActivityChangeRequestedType,
  ) => {
    const { requestedProducerType, requestedProducerId } = event.header;
    const { active, effect } = event.data;

    if (
      ((this.producerType === "audio" &&
        this.permissions?.acceptsAudioEffects) ||
        (this.producerType === "screenAudio" &&
          this.permissions?.acceptsScreenAudioEffects)) &&
      requestedProducerType === this.producerType &&
      (this.producerType === "audio" ||
        (this.producerType === "screenAudio" &&
          requestedProducerId === this.producerId))
    ) {
      this.userMixEffectChange(active, effect);
    }
  };

  onClientMixEffectActivityChanged = (
    event: onClientMixEffectActivityChangedType,
  ) => {
    const { active, effect } = event.data;

    this.remoteMixEffectChange(active, effect);
  };

  onMixEffectValueChangeRequested = (
    event: onMixEffectValueChangeRequestedType,
  ) => {
    const { requestedProducerType, requestedProducerId } = event.header;
    const { effect, option, value, styleValue } = event.data;

    if (
      ((this.producerType === "audio" &&
        this.permissions?.acceptsAudioEffects) ||
        (this.producerType === "screenAudio" &&
          this.permissions?.acceptsScreenAudioEffects)) &&
      requestedProducerType === this.producerType &&
      (this.producerType === "audio" ||
        (this.producerType === "screenAudio" &&
          requestedProducerId === this.producerId))
    ) {
      this.userMixEffectValueChange(effect, option, value, styleValue);
    }
  };

  onClientMixEffectValueChanged = (
    event: onClientMixEffectValueChangedType,
  ) => {
    const { effect, option, value, styleValue } = event.data;

    this.remoteMixEffectValueChange(effect, option, value, styleValue);
  };
}

export default AudioMixEffectsPortalController;
