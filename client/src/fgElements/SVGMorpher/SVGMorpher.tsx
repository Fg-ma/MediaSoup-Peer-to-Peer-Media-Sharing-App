import { interpolate } from "flubber";
import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  AnimationPlaybackControls,
} from "framer-motion";

export default function SVGMorpher({
  pathArrays,
  color = "white",
}: {
  pathArrays: string[][];
  color?: string;
}) {
  if (!pathArrays) {
    return null;
  }

  const [rerender, setRerender] = useState(0);
  const pathIndexRef = useRef(0);
  const isAnimateRef = useRef(true);
  const progress = useMotionValue(0);
  const currentAnimationRef = useRef<AnimationPlaybackControls | undefined>(
    undefined
  ); // Reference to store the current animation
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined); // Reference to store the debounce timeout

  const paths = [];
  for (const pathArray of pathArrays) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arrayOfIndices = pathArray.map((_: any, i: any) => i);

    paths.push(
      useTransform(progress, arrayOfIndices, pathArray, {
        mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 32 }),
      })
    );
  }

  useEffect(() => {
    // Debounce mechanism to handle rapid changes in pathsArray
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (currentAnimationRef.current) {
        currentAnimationRef.current.stop(); // Stop the current animation
      }

      pathIndexRef.current = 0;
      isAnimateRef.current = true;
      progress.set(0);
      setRerender((prev) => prev + 1); // Trigger a rerender to restart the animation
    }, 200); // Adjust the debounce delay as needed

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = undefined;
      }
    };
  }, [pathArrays]);

  useEffect(() => {
    if (!isAnimateRef.current) {
      return;
    }

    const onAnimationComplete = () => {
      if (pathIndexRef.current >= pathArrays[0].length - 1) {
        isAnimateRef.current = false;
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

    currentAnimationRef.current = animation; // Store the current animation

    return () => {
      animation?.stop();
    };
  }, [pathIndexRef.current, rerender]);

  return (
    <>
      {paths.map((d, index) => (
        <motion.path key={index} fill={color} d={d} />
      ))}
    </>
  );
}
