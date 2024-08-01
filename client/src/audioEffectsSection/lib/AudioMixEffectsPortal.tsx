import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, mix, motion } from "framer-motion";
import AudioMixEffect from "./AudioMixEffect";
import ScrollingContainer from "../../scrollingContainer/ScrollingContainer";
import ScrollingContainerButton from "../../scrollingContainer/lib/ScrollingContainerButton";
import FgSVG from "../../fgSVG/FgSVG";
import additionIcon from "../../../public/svgs/additionIcon.svg";

const AudioMixEffectsPortalVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const AudioMixEffectsPortalTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

type MixEffectsType =
  | "reverb"
  | "chorus"
  | "EQ"
  | "delay"
  | "distortion"
  | "pitchShift"
  | "phaser";

interface MixEffect {
  active: boolean;
  possibleSizes: { vertical: [number, number]; horizontal: [number, number] };
  orientation?: "vertical" | "horizontal";
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export default function AudioMixEffectsPortal({
  buttonRef,
}: {
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0 });
  const [rerender, setRerender] = useState(false);
  const mixEffects = useRef<{
    [mixEffect in MixEffectsType]: MixEffect;
  }>({
    reverb: {
      active: false,
      possibleSizes: {
        vertical: [172, 240],
        horizontal: [240, 172],
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    chorus: {
      active: false,
      possibleSizes: {
        horizontal: [240, 236],
        vertical: [236, 240],
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    EQ: {
      active: false,
      possibleSizes: {
        vertical: [236, 240],
        horizontal: [240, 236],
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    delay: {
      active: false,
      possibleSizes: {
        horizontal: [240, 172],
        vertical: [172, 240],
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    distortion: {
      active: false,
      possibleSizes: {
        horizontal: [240, 172],
        vertical: [172, 240],
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    pitchShift: {
      active: false,
      possibleSizes: {
        horizontal: [240, 108],
        vertical: [108, 240],
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
    phaser: {
      active: false,
      possibleSizes: {
        vertical: [236, 240],
        horizontal: [240, 236],
      },
      orientation: undefined,
      width: undefined,
      height: undefined,
      x: undefined,
      y: undefined,
    },
  });
  const portalRef = useRef<HTMLDivElement>(null);

  const getPortalPosition = () => {
    if (!buttonRef.current || !portalRef.current) {
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();

    const top = buttonRect.bottom;

    const left =
      buttonRect.left - portalRef.current.getBoundingClientRect().width;

    const bodyRect = document.body.getBoundingClientRect();
    const topPercent = (top / bodyRect.height) * 100;
    const leftPercent = (left / bodyRect.width) * 100;

    setPortalPosition({
      top: topPercent,
      left: leftPercent,
    });
  };

  useEffect(() => {
    getPortalPosition();

    getPackedPositions(560, 24);
  }, []);

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
        newMixEffects[rect.key as MixEffectsType] = {
          ...rect,
          x: positions[index].x,
          y: positions[index].y,
        };
      }
    });

    mixEffects.current = newMixEffects;
  };

  const mixEffectChange = (active: boolean, id?: string) => {
    if (!id || !(id in mixEffects.current)) {
      return;
    }

    mixEffects.current = {
      ...mixEffects.current,
      [id]: { ...mixEffects.current[id as MixEffectsType], active },
    };

    getPackedPositions(560, 24);

    setRerender((prev) => !prev);
  };

  const eqEffectsOptions = () => {
    const options = [
      {
        bottomLabel: "low",
        ticks: 9,
        rangeMax: 24,
        rangeMin: -24,
        units: "dB",
      },
      {
        bottomLabel: "mid",
        ticks: 9,
        rangeMax: 24,
        rangeMin: -24,
        units: "dB",
      },
      {
        topLabel: "high",
        ticks: 9,
        rangeMax: 24,
        rangeMin: -24,
        units: "dB",
      },
    ];
    if (mixEffects.current.EQ.orientation === "horizontal") {
      options.reverse();
    }

    return options;
  };

  const getMaxDimensions = () => {
    let maxWidth = 0;
    let maxHeight = 0;

    Object.values(mixEffects.current).forEach((effect) => {
      if (effect.x && effect.y && effect.width && effect.height) {
        const { x, y, width, height } = effect;
        maxWidth = Math.max(maxWidth, x + width);
        maxHeight = Math.max(maxHeight, y + height);
      }
    });

    console.log({ maxWidth, maxHeight });
    return { maxWidth, maxHeight };
  };

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`${
        !portalPosition.top && !portalPosition.left && "opacity-0"
      } absolute z-20 bg-white rounded p-4 font-K2D text-md shadow-lg max-w-[35rem] h-[24rem] overflow-x-auto`}
      style={{
        top: `${portalPosition.top}%`,
        left: `${portalPosition.left}%`,
      }}
      variants={AudioMixEffectsPortalVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={AudioMixEffectsPortalTransition}
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
            effectLabel='Reverb'
            labelPlacement={
              mixEffects.current.reverb.orientation === "vertical"
                ? { side: "left", sidePlacement: "bottom" }
                : { side: "bottom", sidePlacement: "left" }
            }
            orientation={mixEffects.current.reverb.orientation}
            effectOptions={[
              {
                topLabel: "decay",
                ticks: 6,
                rangeMax: 10,
                rangeMin: 0,
                units: "sec",
              },
              {
                bottomLabel: "pre-delay",
                ticks: 6,
                rangeMax: 0.1,
                rangeMin: 0,
                precision: 2,
                units: "sec",
              },
            ]}
            style={{
              backgroundColor: "#858585",
              position: "absolute",
              left: `${mixEffects.current.reverb.x}px`,
              top: `${mixEffects.current.reverb.y}px`,
              width: `${mixEffects.current.reverb.width}px`,
              height: `${mixEffects.current.reverb.height}px`,
            }}
          />
        )}
        {mixEffects.current.chorus.active && (
          <AudioMixEffect
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
            orientation={mixEffects.current.chorus.orientation}
            effectOptions={[
              {
                topLabel: "freq",
                ticks: 6,
                rangeMax: 5,
                rangeMin: 0,
                units: "Hz",
              },
              {
                bottomLabel: "delay",
                ticks: 6,
                rangeMax: 20,
                rangeMin: 0,
                units: "ms",
              },
              {
                bottomLabel: "depth",
                ticks: 6,
                rangeMax: 1,
                rangeMin: 0,
                precision: 2,
                units: "%",
              },
            ]}
            style={{
              backgroundColor: "#d8bd9a",
              position: "absolute",
              left: `${mixEffects.current.chorus.x}px`,
              top: `${mixEffects.current.chorus.y}px`,
              width: `${mixEffects.current.chorus.width}px`,
              height: `${mixEffects.current.chorus.height}px`,
            }}
          />
        )}
        {mixEffects.current.EQ.active && (
          <AudioMixEffect
            effectLabel='EQ'
            labelPlacement={
              mixEffects.current.EQ.orientation === "vertical"
                ? { side: "top", sidePlacement: "left" }
                : { side: "left", sidePlacement: "top" }
            }
            orientation={mixEffects.current.EQ.orientation}
            effectOptions={eqEffectsOptions()}
            style={{
              backgroundColor: "#888097",
              position: "absolute",
              left: `${mixEffects.current.EQ.x}px`,
              top: `${mixEffects.current.EQ.y}px`,
              width: `${mixEffects.current.EQ.width}px`,
              height: `${mixEffects.current.EQ.height}px`,
            }}
          />
        )}
        {mixEffects.current.delay.active && (
          <AudioMixEffect
            effectLabel='Delay'
            labelPlacement={
              mixEffects.current.delay.orientation === "vertical"
                ? { side: "bottom", sidePlacement: "right" }
                : { side: "right", sidePlacement: "bottom" }
            }
            orientation={mixEffects.current.delay.orientation}
            effectOptions={[
              {
                topLabel: "delay",
                ticks: 5,
                rangeMax: 4,
                rangeMin: 0,
                units: "sec",
              },
              {
                bottomLabel: "feedback",
                ticks: 6,
                rangeMax: 1,
                rangeMin: 0,
                precision: 2,
                units: "%",
              },
            ]}
            style={{
              backgroundColor: "#c5cfd0",
              position: "absolute",
              left: `${mixEffects.current.delay.x}px`,
              top: `${mixEffects.current.delay.y}px`,
              width: `${mixEffects.current.delay.width}px`,
              height: `${mixEffects.current.delay.height}px`,
            }}
          />
        )}
        {mixEffects.current.distortion.active && (
          <AudioMixEffect
            effectLabel='Distortion'
            labelPlacement={
              mixEffects.current.distortion.orientation === "vertical"
                ? { side: "right", sidePlacement: "top" }
                : { side: "top", sidePlacement: "right" }
            }
            orientation={mixEffects.current.distortion.orientation}
            effectOptions={[
              {
                topLabel: "dist",
                ticks: 6,
                rangeMax: 1,
                rangeMin: 0,
                precision: 2,
                units: "%",
              },
              {
                topLabel: "oversample",
                ticks: 6,
                rangeMax: 4,
                rangeMin: 2,
                units: "x",
              },
            ]}
            style={{
              backgroundColor: "#e7c47d",
              position: "absolute",
              left: `${mixEffects.current.distortion.x}px`,
              top: `${mixEffects.current.distortion.y}px`,
              width: `${mixEffects.current.distortion.width}px`,
              height: `${mixEffects.current.distortion.height}px`,
            }}
          />
        )}
        {mixEffects.current.pitchShift.active && (
          <AudioMixEffect
            effectLabel='Pitch shift'
            labelPlacement={
              mixEffects.current.pitchShift.orientation === "vertical"
                ? { side: "left", sidePlacement: "bottom" }
                : { side: "bottom", sidePlacement: "left" }
            }
            orientation={mixEffects.current.pitchShift.orientation}
            effectOptions={[
              {
                topLabel: "pitch",
                ticks: 9,
                rangeMax: 12,
                rangeMin: -12,
                units: "semitones",
                snapToWholeNum: true,
              },
            ]}
            style={{
              backgroundColor: "#cacaca",
              position: "absolute",
              left: `${mixEffects.current.pitchShift.x}px`,
              top: `${mixEffects.current.pitchShift.y}px`,
              width: `${mixEffects.current.pitchShift.width}px`,
              height: `${mixEffects.current.pitchShift.height}px`,
            }}
          />
        )}
        {mixEffects.current.phaser.active && (
          <AudioMixEffect
            effectLabel='Phaser'
            labelPlacement={
              mixEffects.current.phaser.orientation === "vertical"
                ? { side: "left", sidePlacement: "top" }
                : { side: "top", sidePlacement: "left" }
            }
            orientation={mixEffects.current.phaser.orientation}
            effectOptions={[
              {
                topLabel: "freq",
                ticks: 6,
                rangeMax: 10,
                rangeMin: 0,
                units: "Hz",
              },
              {
                topLabel: "oct",
                ticks: 9,
                rangeMax: 8,
                rangeMin: 0,
                units: "Oct",
                snapToWholeNum: true,
              },
              {
                bottomLabel: "base freq",
                ticks: 6,
                rangeMax: 1000,
                rangeMin: 0,
                units: "Hz",
              },
            ]}
            style={{
              backgroundColor: "#d03818",
              position: "absolute",
              left: `${mixEffects.current.phaser.x}px`,
              top: `${mixEffects.current.phaser.y}px`,
              width: `${mixEffects.current.phaser.width}px`,
              height: `${mixEffects.current.phaser.height}px`,
            }}
          />
        )}
        <div
          className='h-4 w-full absolute'
          style={{ top: `${getMaxDimensions().maxHeight}px` }}
        ></div>
      </div>
    </motion.div>,
    document.body
  );
}
