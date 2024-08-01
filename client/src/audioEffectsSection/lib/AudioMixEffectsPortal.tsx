import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Transition, Variants, motion } from "framer-motion";
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
  width: number;
  height: number;
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
      width: 100,
      height: 100,
      x: undefined,
      y: undefined,
    },
    chorus: {
      active: false,
      width: 200,
      height: 150,
      x: undefined,
      y: undefined,
    },
    EQ: { active: false, width: 236, height: 240, x: undefined, y: undefined },
    delay: {
      active: false,
      width: 124,
      height: 100,
      x: undefined,
      y: undefined,
    },
    distortion: {
      active: false,
      width: 345,
      height: 34,
      x: undefined,
      y: undefined,
    },
    pitchShift: {
      active: false,
      width: 124,
      height: 235,
      x: undefined,
      y: undefined,
    },
    phaser: {
      active: false,
      width: 236,
      height: 240,
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

    getPackedPositions(512, 24);
  }, []);

  const getPackedPositions = (containerWidth: number, padding: number) => {
    const positions: { x: number; y: number }[] = [];
    const occupiedSpaces: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];

    // Filter only active rectangles
    const activeRectangles = Object.entries(mixEffects.current)
      .filter(([, rect]) => rect.active)
      .map(([key, rect]) => ({ key, ...rect }));

    for (const rect of activeRectangles) {
      let placed = false;

      for (let y = 0; !placed; y++) {
        for (let x = 0; x + rect.width + padding <= containerWidth; x++) {
          const doesOverlap = occupiedSpaces.some(
            (space) =>
              x < space.x + space.width + padding &&
              x + rect.width + padding > space.x &&
              y < space.y + space.height + padding &&
              y + rect.height + padding > space.y
          );

          if (!doesOverlap) {
            positions.push({ x, y });
            occupiedSpaces.push({
              x,
              y,
              width: rect.width,
              height: rect.height,
            });
            placed = true;
            break;
          }
        }
      }
    }

    // Create a new object with the updated positions for active rectangles
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

    getPackedPositions(512, 24);

    setRerender((prev) => !prev);
  };

  return ReactDOM.createPortal(
    <motion.div
      ref={portalRef}
      className={`${
        !portalPosition.top && !portalPosition.left && "opacity-0"
      } absolute z-20 bg-white rounded p-3 font-K2D text-md shadow-lg max-w-lg max-h-[38rem] min-h-[20rem]`}
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
      <div className='flex items-center justify-center space-x-6'>
        {mixEffects.current.reverb.active && (
          <AudioMixEffect
            effectLabel='Reverb'
            labelPlacement={{ side: "left", sidePlacement: "bottom" }}
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
            bgColor='#858585'
          />
        )}
        {mixEffects.current.chorus.active && (
          <AudioMixEffect
            effectLabel='Chorus'
            labelPlacement={{ side: "bottom", sidePlacement: "right" }}
            orientation='horizontal'
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
            bgColor='#d8bd9a'
          />
        )}
        {mixEffects.current.EQ.active && (
          <AudioMixEffect
            effectLabel='EQ'
            labelPlacement={{ side: "top", sidePlacement: "left" }}
            effectOptions={[
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
            ]}
            bgColor='#888097'
          />
        )}
        {mixEffects.current.delay.active && (
          <AudioMixEffect
            effectLabel='Delay'
            labelPlacement={{ side: "right", sidePlacement: "bottom" }}
            orientation='horizontal'
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
            bgColor='#c5cfd0'
          />
        )}
        {mixEffects.current.distortion.active && (
          <AudioMixEffect
            effectLabel='Distortion'
            labelPlacement={{ side: "top", sidePlacement: "right" }}
            orientation='horizontal'
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
                bottomLabel: "oversample",
                ticks: 6,
                rangeMax: 4,
                rangeMin: 2,
                units: "x",
              },
            ]}
            bgColor='#e7c47d'
          />
        )}
        {mixEffects.current.pitchShift.active && (
          <AudioMixEffect
            effectLabel='Pitch shift'
            labelPlacement={{ side: "bottom", sidePlacement: "left" }}
            orientation='horizontal'
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
            bgColor='#cacaca'
          />
        )}
        {mixEffects.current.phaser.active && (
          <AudioMixEffect
            effectLabel='Phaser'
            labelPlacement={{ side: "left", sidePlacement: "top" }}
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
            bgColor='#d03818'
          />
        )}
      </div>
    </motion.div>,
    document.body
  );
}
