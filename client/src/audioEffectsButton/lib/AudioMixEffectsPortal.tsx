import React, { useState, useRef } from "react";
import isEqual from "lodash/isEqual";
import { useStreamsContext } from "../../context/StreamsContext";
import AudioMixEffect from "./AudioMixEffect";
import ScrollingContainer from "../../scrollingContainer/ScrollingContainer";
import ScrollingContainerButton from "../../scrollingContainer/lib/ScrollingContainerButton";
import FgPanel from "../../fgPanel/FgPanel";
import { SliderChangeEvent, SliderOptions } from "../../fgSlider/FgSlider";
import {
  AudioMixEffectsType,
  MixEffectsOptionsType,
} from "../../effects/audioEffects/AudioEffects";

export interface MixEffect {
  values: {
    [option in MixEffectsOptionsType]?: number;
  };
  active: boolean;
  possibleSizes: { vertical: [number, number]; horizontal: [number, number] };
  options: {
    [option in MixEffectsOptionsType]?: SliderOptions;
  };
  orientation?: "vertical" | "horizontal";
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  backgroundColor?: string;
}

export default function AudioMixEffectsPortal({
  audioMixEffectsButtonRef,
}: {
  audioMixEffectsButtonRef: React.RefObject<HTMLButtonElement>;
}) {
  const { userMedia } = useStreamsContext();
  const [rerender, setRerender] = useState(false);
  const mixEffects = useRef<{
    [mixEffect in AudioMixEffectsType]: MixEffect;
  }>({
    reverb: {
      values: {
        decay: 1,
        preDelay: 0,
      },
      active: false,
      possibleSizes: {
        vertical: [172, 240],
        horizontal: [240, 172],
      },
      options: {
        decay: {
          topLabel: "decay",
          ticks: 4,
          rangeMax: 10,
          rangeMin: 1,
          units: "sec",
        },
        preDelay: {
          bottomLabel: "pre-delay",
          ticks: 6,
          rangeMax: 0.1,
          rangeMin: 0,
          precision: 2,
          units: "sec",
        },
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
      backgroundColor: "#858585",
    },
    chorus: {
      values: {
        frequency: 0,
        delayTime: 0,
        depth: 0,
      },
      active: false,
      possibleSizes: {
        horizontal: [240, 236],
        vertical: [236, 240],
      },
      options: {
        frequency: {
          topLabel: "freq",
          ticks: 6,
          rangeMax: 5,
          rangeMin: 0,
          units: "Hz",
        },
        delayTime: {
          bottomLabel: "delay",
          ticks: 6,
          rangeMax: 20,
          rangeMin: 0,
          units: "ms",
        },
        depth: {
          bottomLabel: "depth",
          ticks: 6,
          rangeMax: 1,
          rangeMin: 0,
          precision: 2,
          units: "%",
        },
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
      backgroundColor: "#d8bd9a",
    },
    EQ: {
      values: {
        high: 0,
        mid: 0,
        low: 0,
      },
      active: false,
      possibleSizes: {
        vertical: [236, 240],
        horizontal: [240, 236],
      },
      options: {
        high: {
          topLabel: "high",
          ticks: 9,
          rangeMax: 24,
          rangeMin: -24,
          units: "dB",
        },
        mid: {
          bottomLabel: "mid",
          ticks: 9,
          rangeMax: 24,
          rangeMin: -24,
          units: "dB",
        },
        low: {
          bottomLabel: "low",
          ticks: 9,
          rangeMax: 24,
          rangeMin: -24,
          units: "dB",
        },
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
      backgroundColor: "#888097",
    },
    delay: {
      values: {
        delayTime: 0,
        feedback: 0,
      },
      active: false,
      possibleSizes: {
        horizontal: [240, 172],
        vertical: [172, 240],
      },
      options: {
        delayTime: {
          topLabel: "delay",
          ticks: 6,
          rangeMax: 1,
          rangeMin: 0,
          precision: 2,
          units: "sec",
        },
        feedback: {
          bottomLabel: "feedback",
          ticks: 6,
          rangeMax: 1,
          rangeMin: 0,
          precision: 2,
          units: "%",
        },
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
      backgroundColor: "#c5cfd0",
    },
    distortion: {
      values: {
        distortion: 0,
        oversample: 0,
      },
      active: false,
      possibleSizes: {
        horizontal: [240, 172],
        vertical: [172, 240],
      },
      options: {
        distortion: {
          topLabel: "dist",
          ticks: 6,
          rangeMax: 1,
          rangeMin: 0,
          precision: 2,
          units: "%",
        },
        oversample: {
          topLabel: "oversample",
          ticks: 6,
          rangeMax: 4,
          rangeMin: 2,
          units: "x",
        },
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
      backgroundColor: "#e7c47d",
    },
    pitchShift: {
      values: {
        pitch: 0,
      },
      active: false,
      possibleSizes: {
        horizontal: [240, 108],
        vertical: [108, 240],
      },
      options: {
        pitch: {
          topLabel: "pitch",
          ticks: 9,
          rangeMax: 12,
          rangeMin: -12,
          units: "semitones",
          snapToWholeNum: true,
        },
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
      backgroundColor: "#cacaca",
    },
    phaser: {
      values: {
        frequency: 0,
        octaves: 0,
        baseFrequency: 0,
      },
      active: false,
      possibleSizes: {
        vertical: [236, 240],
        horizontal: [240, 236],
      },
      options: {
        frequency: {
          topLabel: "freq",
          ticks: 6,
          rangeMax: 10,
          rangeMin: 0,
          units: "Hz",
        },
        octaves: {
          topLabel: "oct",
          ticks: 9,
          rangeMax: 8,
          rangeMin: 0,
          units: "Oct",
          snapToWholeNum: true,
        },
        baseFrequency: {
          bottomLabel: "base freq",
          ticks: 6,
          rangeMax: 1000,
          rangeMin: 0,
          units: "Hz",
        },
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
      backgroundColor: "#d03818",
    },
  });
  const maxDims = useRef<{ maxWidth: number; maxHeight: number }>({
    maxWidth: 0,
    maxHeight: 0,
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

    const activeRectangles = Object.entries(mixEffects.current)
      .filter(([, rect]) => rect.active)
      .map(([key, rect]) => ({ key, ...rect }));

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

    const newMixEffects = { ...mixEffects.current };
    activeRectangles.forEach((rect, index) => {
      if (positions[index]) {
        newMixEffects[rect.key as AudioMixEffectsType] = {
          ...rect,
          x: positions[index].x + 12,
          y: positions[index].y,
        };
      }
    });

    mixEffects.current = newMixEffects;
  };

  const mixEffectChange = (active: boolean, effect?: string) => {
    if (!effect || !(effect in mixEffects.current)) {
      return;
    }

    mixEffects.current = {
      ...mixEffects.current,
      [effect]: {
        ...mixEffects.current[effect as AudioMixEffectsType],
        active,
      },
    };

    if (!mixEffects.current[effect as AudioMixEffectsType].active) {
      userMedia.current.audio?.removeMixEffects([
        effect as AudioMixEffectsType,
      ]);
    }

    if (portalRef.current) {
      getPackedPositions(
        portalRef.current.getBoundingClientRect().width - 24,
        24
      );
    }

    getMaxDimensions();

    setRerender((prev) => !prev);
  };

  const getMaxDimensions = () => {
    let maxWidth = 0;
    let maxHeight = 0;

    Object.values(mixEffects.current).forEach((effect) => {
      if (
        effect.active &&
        effect.x !== undefined &&
        effect.y !== undefined &&
        effect.width !== undefined &&
        effect.height !== undefined
      ) {
        const { x, y, width, height } = effect;
        maxWidth = Math.max(maxWidth, x + width);
        maxHeight = Math.max(maxHeight, y + height);
      }
    });

    maxDims.current = { maxWidth, maxHeight };
  };

  const updateMixEffectsValues = (event: SliderChangeEvent) => {
    const [effect, option] = event.id.split("_");

    if (
      mixEffects.current[effect as AudioMixEffectsType] &&
      mixEffects.current[effect as AudioMixEffectsType].values
    ) {
      mixEffects.current[effect as AudioMixEffectsType].values[
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
          className='bg-white font-K2D text-md min-w-[18rem] min-h-[18.75rem] h-full w-full'
        >
          <div className='h-max mb-4'>
            <ScrollingContainer
              content={
                <div className='flex items-center justify-start space-x-3'>
                  <ScrollingContainerButton
                    content='Reverb'
                    id='reverb'
                    callbackFunction={mixEffectChange}
                  />
                  <ScrollingContainerButton
                    content='Chorus'
                    id='chorus'
                    callbackFunction={mixEffectChange}
                  />
                  <ScrollingContainerButton
                    content='EQ'
                    id='EQ'
                    callbackFunction={mixEffectChange}
                  />
                  <ScrollingContainerButton
                    content='Delay'
                    id='delay'
                    callbackFunction={mixEffectChange}
                  />
                  <ScrollingContainerButton
                    content='Distortion'
                    id='distortion'
                    callbackFunction={mixEffectChange}
                  />
                  <ScrollingContainerButton
                    content='Pitch shift'
                    id='pitchShift'
                    callbackFunction={mixEffectChange}
                  />
                  <ScrollingContainerButton
                    content='Phaser'
                    id='phaser'
                    callbackFunction={mixEffectChange}
                  />
                </div>
              }
            />
          </div>
          <div className='relative'>
            {mixEffects.current.reverb.active && (
              <AudioMixEffect
                effect='reverb'
                mixEffect={mixEffects.current.reverb}
                effectLabel='Reverb'
                labelPlacement={
                  mixEffects.current.reverb.orientation === "vertical"
                    ? { side: "left", sidePlacement: "bottom" }
                    : { side: "bottom", sidePlacement: "left" }
                }
                updateMixEffectsValues={updateMixEffectsValues}
              />
            )}
            {mixEffects.current.chorus.active && (
              <AudioMixEffect
                effect='chorus'
                mixEffect={mixEffects.current.chorus}
                effectLabel='Chorus'
                labelPlacement={
                  mixEffects.current.chorus.orientation === "vertical"
                    ? {
                        side: "right",
                        sidePlacement: "bottom",
                      }
                    : {
                        side: "bottom",
                        sidePlacement: "right",
                      }
                }
                updateMixEffectsValues={updateMixEffectsValues}
              />
            )}
            {mixEffects.current.EQ.active && (
              <AudioMixEffect
                effect='EQ'
                mixEffect={mixEffects.current.EQ}
                effectLabel='EQ'
                labelPlacement={
                  mixEffects.current.EQ.orientation === "vertical"
                    ? { side: "top", sidePlacement: "left" }
                    : { side: "left", sidePlacement: "top" }
                }
                updateMixEffectsValues={updateMixEffectsValues}
              />
            )}
            {mixEffects.current.delay.active && (
              <AudioMixEffect
                effect='delay'
                mixEffect={mixEffects.current.delay}
                effectLabel='Delay'
                labelPlacement={
                  mixEffects.current.delay.orientation === "vertical"
                    ? { side: "bottom", sidePlacement: "right" }
                    : { side: "right", sidePlacement: "bottom" }
                }
                updateMixEffectsValues={updateMixEffectsValues}
              />
            )}
            {mixEffects.current.distortion.active && (
              <AudioMixEffect
                effect='distortion'
                mixEffect={mixEffects.current.distortion}
                effectLabel='Distortion'
                labelPlacement={
                  mixEffects.current.distortion.orientation === "vertical"
                    ? { side: "right", sidePlacement: "top" }
                    : { side: "top", sidePlacement: "right" }
                }
                updateMixEffectsValues={updateMixEffectsValues}
              />
            )}
            {mixEffects.current.pitchShift.active && (
              <AudioMixEffect
                effect='pitchShift'
                mixEffect={mixEffects.current.pitchShift}
                effectLabel='Pitch shift'
                labelPlacement={
                  mixEffects.current.pitchShift.orientation === "vertical"
                    ? { side: "left", sidePlacement: "bottom" }
                    : { side: "bottom", sidePlacement: "left" }
                }
                updateMixEffectsValues={updateMixEffectsValues}
              />
            )}
            {mixEffects.current.phaser.active && (
              <AudioMixEffect
                effect='phaser'
                mixEffect={mixEffects.current.phaser}
                effectLabel='Phaser'
                labelPlacement={
                  mixEffects.current.phaser.orientation === "vertical"
                    ? { side: "left", sidePlacement: "top" }
                    : { side: "top", sidePlacement: "left" }
                }
                updateMixEffectsValues={updateMixEffectsValues}
              />
            )}
            <div
              className='h-4 w-full absolute'
              style={{ top: `${maxDims.current.maxHeight}px` }}
            ></div>
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
      initWidth={600}
      initHeight={384}
      minWidth={328}
      minHeight={348}
      resizeCallback={() => {
        if (portalRef.current) {
          const previous = JSON.parse(JSON.stringify(mixEffects.current));
          getPackedPositions(
            portalRef.current.getBoundingClientRect().width - 24,
            24
          );
          if (!isEqual(mixEffects.current, previous)) {
            setRerender((prev) => !prev);
          }
        }
      }}
    />
  );
}
