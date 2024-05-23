import { interpolate } from "flubber";
import React, { useState, useEffect, useRef } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { volumeOff1a } from "../FgVideo/paths";

export default function SVGMorpher({
  pathsArray,
  audioRef,
  isFinishedRef,
  changedWhileNotFinishedRef,
  color = "white",
}: {
  pathsArray: string[][];
  audioRef: React.RefObject<HTMLAudioElement>;
  isFinishedRef: React.MutableRefObject<boolean>;
  changedWhileNotFinishedRef: React.MutableRefObject<boolean>;
  color?: string;
}) {
  if (!pathsArray) {
    return;
  }

  const [rerender, setRerender] = useState(0);
  const pathIndexRef = useRef(0);
  const isAnimateRef = useRef(true);
  const progress = useMotionValue(0);

  let paths = [];
  for (const pathArray of pathsArray) {
    const arrayOfIndices = pathArray.map((_: any, i: any) => i);

    paths.push(
      useTransform(progress, arrayOfIndices, pathArray, {
        mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 16 }),
      })
    );
  }

  useEffect(() => {
    isFinishedRef.current = false;
    pathIndexRef.current = 0;
    isAnimateRef.current = true;
    progress.set(0);

    return () => {
      pathIndexRef.current = 0;
      isAnimateRef.current = true;
      progress.set(0);
    };
  }, [pathsArray]);

  useEffect(() => {
    if (!isAnimateRef.current) {
      return;
    }

    const onAnimationComplete = () => {
      if (pathIndexRef.current >= pathsArray[0].length - 1) {
        isFinishedRef.current = true;
        isAnimateRef.current = false;
        if (changedWhileNotFinishedRef.current) {
          setTimeout(() => {
            changedWhileNotFinishedRef.current = false;
            if (audioRef.current) {
              const currentVolume = audioRef.current.volume ?? 0;
              audioRef.current.volume = Math.min(
                Math.abs(currentVolume - 0.0000000000001),
                1
              );
            }
          }, 0);
        }
      } else {
        pathIndexRef.current++;
        setRerender(pathIndexRef.current);
      }
    };

    const animation = animate(progress, pathIndexRef.current, {
      duration: changedWhileNotFinishedRef.current ? 0.01 : 0.2,
      ease:
        pathIndexRef.current >= pathsArray[0].length
          ? "easeOut"
          : pathIndexRef.current === 0
          ? "easeIn"
          : "linear",
      delay: 0,
      onComplete: onAnimationComplete,
    });

    return () => {
      animation?.stop();
    };
  }, [pathIndexRef.current, pathsArray]);

  return (
    <>
      {paths.map((d, index) => (
        <motion.path key={index} fill={color} d={d} />
      ))}
    </>
  );
}
