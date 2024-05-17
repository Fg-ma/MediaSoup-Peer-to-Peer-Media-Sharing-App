import { interpolate } from "flubber";
import React, { useState, useEffect, useRef } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";

export default function SVGMorpher({ pathsArray }: { pathsArray: string[][] }) {
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
        mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 15 }),
      })
    );
  }

  useEffect(() => {
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
        isAnimateRef.current = false;
      } else {
        pathIndexRef.current++;
        setRerender(pathIndexRef.current);
      }
    };

    const animation = animate(progress, pathIndexRef.current, {
      duration: 0.2,
      ease: pathIndexRef.current >= pathsArray[0].length ? "easeOut" : "linear",
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
        <motion.path key={index} fill='white' d={d} />
      ))}
    </>
  );
}
