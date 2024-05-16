import { interpolate } from "flubber";
import React, { useState, useEffect, useRef } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";

export default function SVGMorph({ paths }: { paths: any }) {
  if (!paths) {
    return;
  }

  const [rerender, setRerender] = useState(0);
  const pathIndexRef = useRef(0);
  const isAnimateRef = useRef(true);
  const progress = useMotionValue(pathIndexRef.current);

  const arrayOfIndex = paths.map((_: any, i: any) => i);

  const path = useTransform(progress, arrayOfIndex, paths, {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 20 }),
  });

  useEffect(() => {
    pathIndexRef.current = 0;
    isAnimateRef.current = true;
    progress.setCurrent(0);
  }, [paths]);

  useEffect(() => {
    if (!isAnimateRef.current) {
      return;
    }

    const onAnimationComplete = () => {
      if (pathIndexRef.current >= paths.length - 1) {
        isAnimateRef.current = false;
      } else {
        pathIndexRef.current++;
        setRerender(pathIndexRef.current);
      }
    };

    const animation = animate(progress, pathIndexRef.current, {
      duration: 2,
      ease: pathIndexRef.current >= paths.length ? "easeOut" : "linear",
      delay: 0,
      onComplete: onAnimationComplete,
    });
    return () => {
      animation.stop();
    };
  }, [pathIndexRef.current, paths]);

  return <motion.path fill='white' d={path} />;
}
