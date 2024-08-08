import { interpolate } from "flubber";
import React, { useState, useEffect, useRef } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { newVolumeSVGPaths } from "./volumeSVGPaths";

export default function VolumeSVGMorpher({
  pathArrays,
  stationaryPaths,
  color = "white",
  strikePaths,
}: {
  pathArrays?: [string, string, string];
  stationaryPaths: string[];
  strikePaths?: [string, string];
  color?: string;
}) {
  if (!pathArrays) {
    return null;
  }

  const [rerender, setRerender] = useState(0);
  const pathIndexRef = useRef(0);
  const isAnimateRef = useRef(true);
  const progress = useMotionValue(0);
  const currentAnimationRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<any>(null);

  const paths = useTransform(progress, [0, 1, 2], pathArrays, {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 32 }),
  });

  const strikePath = useTransform(progress, [0, 1], strikePaths || ["", ""], {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 32 }),
  });

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (currentAnimationRef.current) {
        currentAnimationRef.current.stop();
      }

      pathIndexRef.current = 0;
      isAnimateRef.current = true;
      progress.set(0);
      setRerender((prev) => prev + 1);
    }, 200);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [pathArrays, strikePaths]);

  useEffect(() => {
    if (!isAnimateRef.current) {
      return;
    }

    const onAnimationComplete = () => {
      if (pathIndexRef.current >= pathArrays[0].length - 1) {
        isAnimateRef.current = false;
        setRerender((prev) => prev + 1);
      } else {
        pathIndexRef.current++;
        setRerender(pathIndexRef.current);
      }
    };

    const animation = animate(progress, pathIndexRef.current, {
      duration: 0.2,
      ease:
        pathIndexRef.current >= pathArrays[0].length
          ? "easeOut"
          : pathIndexRef.current === 0
          ? "easeIn"
          : "linear",
      delay: 0,
      onComplete: onAnimationComplete,
    });

    currentAnimationRef.current = animation;

    return () => {
      animation?.stop();
    };
  }, [pathIndexRef.current, rerender]);

  return (
    <>
      {stationaryPaths.map((d, index) => (
        <path key={index} fill={color} d={d} />
      ))}
      {paths && <motion.path fill={color} d={paths} />}
      {strikePaths &&
        !(
          !isAnimateRef.current &&
          strikePaths[1] === newVolumeSVGPaths.strike.ball
        ) && <motion.path fill={color} d={strikePath} />}
    </>
  );
}
