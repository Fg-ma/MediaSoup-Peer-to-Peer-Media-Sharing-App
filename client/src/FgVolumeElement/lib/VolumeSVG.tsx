import React, { useEffect, useRef, useState } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import volumeSVGPaths from "../../fgVolumeElement/lib/volumeSVGPaths";

const scaleStart = 1;
const scaleEnd = 2.5;
const translateStart = 0;
const translateEnd = 14;

export default function VolumeSVG({
  volumeState,
  movingPath,
  stationaryPaths,
  color = "white",
  duration = 0.6,
}: {
  volumeState: {
    from: string;
    to: string;
  };
  movingPath?: string;
  stationaryPaths: string[];
  color?: string;
  duration?: number;
}) {
  const [rerender, setRerender] = useState(true);
  const progress = useMotionValue(0);
  const prevVolumeState = useRef<string | undefined>();

  let scaleValue: [number, number] = [1, 1];
  let translateValue: [number, number] = [0, 0];
  if (
    volumeState.from === "low" &&
    (volumeState.to === "high" || volumeState.to === "off")
  ) {
    scaleValue = [scaleStart, scaleEnd];
    translateValue = [translateStart, translateEnd];
  } else if (
    (volumeState.from === "high" && volumeState.to === "low") ||
    (volumeState.from === "off" && volumeState.to === "low")
  ) {
    scaleValue = [scaleEnd, scaleStart];
    translateValue = [translateEnd, translateStart];
  } else if (
    (volumeState.from === "high" && volumeState.to === "off") ||
    (volumeState.from === "off" && volumeState.to === "high")
  ) {
    scaleValue = [scaleEnd, scaleEnd];
    translateValue = [translateEnd, translateEnd];
  } else if (
    (volumeState.from === "" && volumeState.to === "off") ||
    (volumeState.from === "" && volumeState.to === "high")
  ) {
    scaleValue = [scaleEnd, scaleEnd];
    translateValue = [translateEnd, translateEnd];
  } else if (volumeState.from === "" && volumeState.to === "low") {
    scaleValue = [scaleStart, scaleStart];
    translateValue = [scaleStart, scaleStart];
  }

  const scale = useTransform(progress, [0, 1], scaleValue);
  const translateX = useTransform(progress, [0, 1], translateValue);

  useEffect(() => {
    progress.set(0);

    const controls = animate(progress, 1, {
      duration,
      ease: "easeInOut",
    });

    prevVolumeState.current = volumeState.to;

    return () => {
      controls.stop;
    };
  }, [volumeState]);

  return (
    <>
      {movingPath && (
        <motion.path
          d={movingPath}
          fill={color}
          style={{
            translateX,
            scaleX: scale,
            scaleY: scale,
          }}
        />
      )}
      {volumeState.to === "off" && (
        <motion.path
          d={volumeSVGPaths.strike}
          stroke={color}
          strokeWidth={10.937}
          strokeLinecap={"round"}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: duration, ease: "easeInOut" }}
        />
      )}
      {prevVolumeState.current &&
        prevVolumeState.current === "off" &&
        volumeState.to !== "off" && (
          <motion.path
            d={volumeSVGPaths.strike}
            stroke={color}
            strokeWidth={10.937}
            strokeLinecap={"round"}
            initial={{ pathLength: 1 }}
            animate={{ pathLength: 0 }}
            transition={{ duration: duration, ease: "easeInOut" }}
            onAnimationComplete={() => {
              setRerender((prev) => !prev);
            }}
          />
        )}
      {stationaryPaths.map((d, index) => (
        <path key={index} fill={color} d={d} />
      ))}
    </>
  );
}
