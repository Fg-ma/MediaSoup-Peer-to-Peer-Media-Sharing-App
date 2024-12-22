import React, { useState, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import isEqual from "lodash/isEqual";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import AudioMixEffect from "./AudioMixEffect";
import ScrollingContainer from "../../fgElements/scrollingContainer/ScrollingContainer";
import ScrollingContainerButton from "../../fgElements/scrollingContainer/lib/ScrollingContainerButton";
import FgPanel from "../../fgElements/fgPanel/FgPanel";
import { DynamicMixEffect, staticMixEffects } from "./typeConstant";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../audioEffects/typeConstant";
import { Permissions } from "../../context/permissionsContext/typeConstant";
import AudioMixEffectsPortalController from "./AudioMixEffectsPortalController";

export default function AudioMixEffectsPortal({
  socket,
  table_id,
  username,
  instance,
  producerType,
  producerId,
  isUser,
  permissions,
  audioMixEffectsButtonRef,
  closeCallback,
}: {
  socket: React.MutableRefObject<Socket>;
  table_id: string;
  username: string;
  instance: string;
  producerType: "audio" | "screenAudio";
  producerId: string | undefined;
  isUser: boolean;
  permissions: Permissions;
  audioMixEffectsButtonRef: React.RefObject<HTMLButtonElement>;
  closeCallback: () => void;
}) {
  const { userMedia } = useMediaContext();

  const [_, setRerender] = useState(false);
  const [focus, setFocus] = useState(true);
  const dynamicMixEffects = useRef<{
    [mixEffect in AudioMixEffectsType]: DynamicMixEffect;
  }>({
    autoFilter: {
      values: {
        frequency: 0,
        baseFrequency: 0,
        octaves: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    autoPanner: {
      values: {
        frequency: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    autoWah: {
      values: {
        baseFrequency: 0,
        octaves: 0,
        sensitivity: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    bitCrusher: {
      values: {
        bits: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    chebyshev: {
      values: {
        order: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    chorus: {
      values: {
        frequency: 0,
        delayTime: 0,
        depth: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    freeverb: {
      values: {
        roomSize: 0,
        dampening: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    JCReverb: {
      values: {
        roomSize: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    pingPongDelay: {
      values: {
        delayTime: 0,
        feedback: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    stereoWidener: {
      values: {
        width: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    tremolo: {
      values: {
        frequency: 0,
        depth: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    vibrato: {
      values: {
        frequency: 0,
        depth: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    distortion: {
      values: {
        distortion: 0,
        oversample: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    EQ: {
      values: {
        high: 0,
        mid: 0,
        low: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    feedbackDelay: {
      values: {
        delayTime: 0,
        feedback: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    phaser: {
      values: {
        frequency: 0,
        octaves: 0,
        baseFrequency: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    pitchShift: {
      values: {
        pitch: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    reverb: {
      values: {
        decay: 1,
        preDelay: 0,
      },
      active: false,
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
  });
  const portalRef = useRef<HTMLDivElement>(null);
  const [sliderValues, setSliderValues] = useState<{
    [mixEffect in AudioMixEffectsType]: {
      [option in MixEffectsOptionsType]?: number;
    };
  }>({
    autoFilter: {
      frequency: 0,
      baseFrequency: 0,
      octaves: 0,
    },
    autoPanner: {
      frequency: 0,
    },
    autoWah: {
      baseFrequency: 0,
      octaves: 0,
      sensitivity: 0,
    },
    bitCrusher: {
      bits: 0,
    },
    chebyshev: {
      order: 0,
    },
    chorus: {
      frequency: 0,
      delayTime: 0,
      depth: 0,
    },
    freeverb: {
      roomSize: 0,
      dampening: 0,
    },
    JCReverb: {
      roomSize: 0,
    },
    pingPongDelay: {
      delayTime: 0,
      feedback: 0,
    },
    stereoWidener: {
      width: 0,
    },
    tremolo: {
      frequency: 0,
      depth: 0,
    },
    vibrato: {
      frequency: 0,
      depth: 0,
    },
    distortion: {
      distortion: 0,
      oversample: 0,
    },
    EQ: {
      high: 0,
      mid: 0,
      low: 0,
    },
    feedbackDelay: {
      delayTime: 0,
      feedback: 0,
    },
    phaser: {
      frequency: 0,
      octaves: 0,
      baseFrequency: 0,
    },
    pitchShift: {
      pitch: 0,
    },
    reverb: {
      decay: 0,
      preDelay: 0,
    },
  });
  const [sliderStyleValues, setSliderStyleValues] = useState<{
    [mixEffect in AudioMixEffectsType]: {
      [option in MixEffectsOptionsType]?: number;
    };
  }>({
    autoFilter: {
      frequency: 0,
      baseFrequency: 0,
      octaves: 0,
    },
    autoPanner: {
      frequency: 0,
    },
    autoWah: {
      baseFrequency: 0,
      octaves: 0,
      sensitivity: 0,
    },
    bitCrusher: {
      bits: 0,
    },
    chebyshev: {
      order: 0,
    },
    chorus: {
      frequency: 0,
      delayTime: 0,
      depth: 0,
    },
    freeverb: {
      roomSize: 0,
      dampening: 0,
    },
    JCReverb: {
      roomSize: 0,
    },
    pingPongDelay: {
      delayTime: 0,
      feedback: 0,
    },
    stereoWidener: {
      width: 0,
    },
    tremolo: {
      frequency: 0,
      depth: 0,
    },
    vibrato: {
      frequency: 0,
      depth: 0,
    },
    distortion: {
      distortion: 0,
      oversample: 0,
    },
    EQ: {
      high: 0,
      mid: 0,
      low: 0,
    },
    feedbackDelay: {
      delayTime: 0,
      feedback: 0,
    },
    phaser: {
      frequency: 0,
      octaves: 0,
      baseFrequency: 0,
    },
    pitchShift: {
      pitch: 0,
    },
    reverb: {
      decay: 0,
      preDelay: 0,
    },
  });

  const audioMixEffectsPortalController = new AudioMixEffectsPortalController(
    socket,
    table_id,
    username,
    instance,
    producerType,
    producerId,
    isUser,
    permissions,
    userMedia,
    setRerender,
    dynamicMixEffects,
    portalRef,
    setSliderValues,
    setSliderStyleValues
  );

  useEffect(() => {
    socket.current.on("message", audioMixEffectsPortalController.handleMessage);

    return () => {
      socket.current.off(
        "message",
        audioMixEffectsPortalController.handleMessage
      );
    };
  }, [socket.current]);

  return (
    <FgPanel
      content={
        <div
          ref={portalRef}
          className='vertical-scroll-bar font-K2D text-md min-w-[18rem] min-h-[18.75rem] h-full w-full overflow-y-auto'
        >
          <div className='h-max mb-4 mt-1'>
            <ScrollingContainer
              content={
                <div className='flex items-center justify-start space-x-3 p-1'>
                  {Object.entries(staticMixEffects).map(
                    ([effect, staticMixEffect]) => {
                      return (
                        <ScrollingContainerButton
                          key={effect}
                          content={staticMixEffect.effectLabel}
                          id={effect}
                          callbackFunction={(active, id) => {
                            if (id) {
                              audioMixEffectsPortalController.mixEffectChange(
                                active,
                                id as AudioMixEffectsType
                              );
                            }
                          }}
                        />
                      );
                    }
                  )}
                </div>
              }
              buttonBackgroundColor={
                focus ? "rgba(255, 255, 255, 1)" : "rgba(243, 243, 243, 1)"
              }
            />
          </div>
          <div className='relative'>
            {Object.entries(dynamicMixEffects.current).map(
              ([effect, dynamicMixEffect]) => {
                if (dynamicMixEffect.active) {
                  return (
                    <AudioMixEffect
                      key={effect}
                      effect={effect as AudioMixEffectsType}
                      staticMixEffect={
                        staticMixEffects[effect as AudioMixEffectsType]
                      }
                      dynamicMixEffect={dynamicMixEffect}
                      effectLabel={
                        staticMixEffects[effect as AudioMixEffectsType]
                          .effectLabel
                      }
                      labelPlacement={
                        staticMixEffects[effect as AudioMixEffectsType]
                          .labelPlacement[
                          dynamicMixEffect.orientation ?? "vertical"
                        ]
                      }
                      sliderValues={sliderValues}
                      sliderStyleValues={sliderStyleValues}
                      mixEffectValueChange={
                        audioMixEffectsPortalController.mixEffectValueChange
                      }
                    />
                  );
                }
              }
            )}
          </div>
        </div>
      }
      initPosition={{
        x: undefined,
        y: undefined,
        referenceElement: audioMixEffectsButtonRef.current
          ? audioMixEffectsButtonRef.current
          : undefined,
        placement: "below",
        padding: 12,
      }}
      initWidth={"600px"}
      initHeight={"384px"}
      minWidth={340}
      minHeight={350}
      resizeCallback={() => {
        if (portalRef.current) {
          const previous = JSON.parse(
            JSON.stringify(dynamicMixEffects.current)
          );
          audioMixEffectsPortalController.getPackedPositions(
            portalRef.current.getBoundingClientRect().width - 28,
            28
          );
          if (!isEqual(dynamicMixEffects.current, previous)) {
            setRerender((prev) => !prev);
          }
        }
      }}
      closeCallback={() => closeCallback()}
      closePosition='topRight'
      focusCallback={(newFocus) => setFocus(newFocus)}
      shadow={{ top: true, bottom: true }}
    />
  );
}
