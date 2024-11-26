import React, { useState, useRef } from "react";
import isEqual from "lodash/isEqual";
import { useStreamsContext } from "../../context/streamsContext/StreamsContext";
import AudioMixEffect from "./AudioMixEffect";
import ScrollingContainer from "../../fgElements/scrollingContainer/ScrollingContainer";
import ScrollingContainerButton from "../../fgElements/scrollingContainer/lib/ScrollingContainerButton";
import FgPanel from "../../fgElements/fgPanel/FgPanel";
import { SliderChangeEvent } from "../../fgElements/fgSlider/FgSlider";
import { DynamicMixEffect, staticMixEffects } from "./typeConstant";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../audioEffects/typeConstant";

export default function AudioMixEffectsPortal({
  audioMixEffectsButtonRef,
  closeCallback,
}: {
  audioMixEffectsButtonRef: React.RefObject<HTMLButtonElement>;
  closeCallback: () => void;
}) {
  const { userMedia } = useStreamsContext();

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

  const getPackedPositions = (containerWidth: number, padding: number) => {
    const positions: { x: number; y: number }[] = [];
    const occupiedSpaces: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];

    const activeRectangles = Object.entries(dynamicMixEffects.current)
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
        ...Object.values(a.possibleSizes).map(([w, h]) => w * h)
      );
      const maxSizeB = Math.max(
        ...Object.values(b.possibleSizes).map(([w, h]) => w * h)
      );
      return maxSizeB - maxSizeA;
    });

    const fitsInContainer = (
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      return (
        x + width + padding <= containerWidth &&
        y + height + padding <= Number.MAX_SAFE_INTEGER
      );
    };

    for (const rect of activeRectangles) {
      let placed = false;

      for (const [orientation, [width, height]] of Object.entries(
        rect.possibleSizes
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
                  y + height + padding > space.y
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

    const newDynamicMixEffects = { ...dynamicMixEffects.current };
    activeRectangles.forEach((rect, index) => {
      if (positions[index]) {
        newDynamicMixEffects[rect.key as AudioMixEffectsType] = {
          ...rect,
          x: positions[index].x + 12,
          y: positions[index].y,
        };
      }
    });

    dynamicMixEffects.current = newDynamicMixEffects;
  };

  const mixEffectChange = (active: boolean, effect?: string) => {
    if (!effect) {
      return;
    }

    dynamicMixEffects.current = {
      ...dynamicMixEffects.current,
      [effect]: {
        ...dynamicMixEffects.current[effect as AudioMixEffectsType],
        active,
      },
    };

    if (!dynamicMixEffects.current[effect as AudioMixEffectsType].active) {
      userMedia.current.audio?.removeMixEffects([
        effect as AudioMixEffectsType,
      ]);
    }

    if (portalRef.current) {
      getPackedPositions(
        portalRef.current.getBoundingClientRect().width - 28,
        28
      );
    }

    setRerender((prev) => !prev);
  };

  const updateMixEffectsValues = (event: SliderChangeEvent) => {
    const [effect, option] = event.id.split("_");

    if (
      dynamicMixEffects.current[effect as AudioMixEffectsType] &&
      dynamicMixEffects.current[effect as AudioMixEffectsType].values
    ) {
      dynamicMixEffects.current[effect as AudioMixEffectsType].values[
        option as MixEffectsOptionsType
      ] = event.value;
    }

    const effects = [
      {
        type: effect as AudioMixEffectsType,
        updates: [
          { option: option as MixEffectsOptionsType, value: event.value },
        ],
      },
    ];

    userMedia.current.audio?.mixEffects(effects);
  };

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
                          callbackFunction={mixEffectChange}
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
                      updateMixEffectsValues={updateMixEffectsValues}
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
          getPackedPositions(
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
