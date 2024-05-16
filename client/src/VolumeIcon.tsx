import React, { useEffect, useRef, useState } from "react";
import {
  volumeHigh1a,
  volumeHigh1b,
  volumeHigh2a,
  volumeHigh2b,
  volumeHigh3a,
  volumeHigh3b,
  volumeHighOffIB1a,
  volumeHighOffIB1b,
  volumeHighOffIB2a,
  volumeHighOffIB2b,
  volumeHighOffIB3a,
  volumeHighOffIB3b,
  volumeOff1a,
  volumeOff1b,
  volumeOff2a,
  volumeOff2b,
  volumeOff3a,
  volumeOff3b,
  volumeLow1a,
  volumeLow1b,
  volumeLow2a,
  volumeLow2b,
  volumeLow3a,
  volumeLow3b,
  volumeHighLowIB1a,
  volumeHighLowIB1b,
  volumeHighLowIB2a,
  volumeHighLowIB2b,
  volumeHighLowIB3a,
  volumeHighLowIB3b,
  volumeLowOffA1a,
  volumeLowOffA1b,
  volumeLowOffA2a,
  volumeLowOffA2b,
  volumeLowOffA3a,
  volumeLowOffA3b,
  volumeLowOffB1a,
  volumeLowOffB1b,
  volumeLowOffB2a,
  volumeLowOffB2b,
  volumeLowOffB3a,
  volumeLowOffB3b,
} from "./paths";
import SVGMorph from "./SVGMorph";

export default function VolumeIcon({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
}) {
  const videoIconStateRef = useRef({ from: "high", to: "" });
  const [paths, setPaths] = useState<string[][]>([
    [volumeHigh1a, volumeHighOffIB1a, volumeOff1a],
    [volumeHigh1b, volumeHighOffIB1b, volumeOff1b],
    [volumeHigh2a, volumeHighOffIB2a, volumeOff2a],
    [volumeHigh2b, volumeHighOffIB2b, volumeOff2b],
    [volumeHigh3a, volumeHighOffIB3a, volumeOff3a],
    [volumeHigh3b, volumeHighOffIB3b, volumeOff3b],
  ]);

  useEffect(() => {
    const volumeChangeHandler = () => {
      if (!videoRef.current) {
        return;
      }

      const newVolume = videoRef.current.volume;
      let newVolumeState;
      if (videoRef.current.muted || newVolume === 0) {
        newVolumeState = "off";
      } else if (videoRef.current.volume >= 0.5) {
        newVolumeState = "high";
      } else {
        newVolumeState = "low";
      }

      if (videoIconStateRef.current.to !== newVolumeState) {
        const { from, to } = videoIconStateRef.current;
        videoIconStateRef.current = { from: to, to: newVolumeState };

        let newPaths: string[][] = [];
        if (to === "high" && newVolumeState === "off") {
          newPaths = [
            [volumeHigh1a, volumeHighOffIB1a, volumeOff1a],
            [volumeHigh1b, volumeHighOffIB1b, volumeOff1b],
            [volumeHigh2a, volumeHighOffIB2a, volumeOff2a],
            [volumeHigh2b, volumeHighOffIB2b, volumeOff2b],
            [volumeHigh3a, volumeHighOffIB3a, volumeOff3a],
            [volumeHigh3b, volumeHighOffIB3b, volumeOff3b],
          ];
        } else if (to === "off" && newVolumeState === "high") {
          newPaths = [
            [volumeOff1a, volumeHighOffIB1a, volumeHigh1a],
            [volumeOff1b, volumeHighOffIB1b, volumeHigh1b],
            [volumeOff2a, volumeHighOffIB2a, volumeHigh2a],
            [volumeOff2b, volumeHighOffIB2b, volumeHigh2b],
            [volumeOff3a, volumeHighOffIB3a, volumeHigh3a],
            [volumeOff3b, volumeHighOffIB3b, volumeHigh3b],
          ];
        } else if (to === "low" && newVolumeState === "off") {
          newPaths = [
            [volumeLow1a, volumeLowOffA1a, volumeLowOffB1a, volumeOff1a],
            [volumeLow1b, volumeLowOffA1b, volumeLowOffB1b, volumeOff1b],
            [volumeLow2a, volumeLowOffA2a, volumeLowOffB2a, volumeOff2a],
            [volumeLow2b, volumeLowOffA2b, volumeLowOffB2b, volumeOff2b],
            [volumeLow3a, volumeLowOffA3a, volumeLowOffB3a, volumeOff3a],
            [volumeLow3b, volumeLowOffA3b, volumeLowOffB3b, volumeOff3b],
          ];
        } else if (to === "off" && newVolumeState === "low") {
          newPaths = [
            [volumeOff1a, volumeLowOffB1a, volumeLowOffA1a, volumeLow1a],
            [volumeOff1b, volumeLowOffB1b, volumeLowOffA1b, volumeLow1b],
            [volumeOff2a, volumeLowOffB2a, volumeLowOffA2a, volumeLow2a],
            [volumeOff2b, volumeLowOffB2b, volumeLowOffA2b, volumeLow2b],
            [volumeOff3a, volumeLowOffB3a, volumeLowOffA3a, volumeLow3a],
            [volumeOff3b, volumeLowOffB3b, volumeLowOffA3b, volumeLow3b],
          ];
        } else if (to === "high" && newVolumeState === "low") {
          newPaths = [
            [volumeHigh1a, volumeHighLowIB1a, volumeLow1a],
            [volumeHigh1b, volumeHighLowIB1b, volumeLow1b],
            [volumeHigh2a, volumeHighLowIB2a, volumeLow2a],
            [volumeHigh2b, volumeHighLowIB2b, volumeLow2b],
            [volumeHigh3a, volumeHighLowIB3a, volumeLow3a],
            [volumeHigh3b, volumeHighLowIB3b, volumeLow3b],
          ];
        } else if (to === "low" && newVolumeState === "high") {
          newPaths = [
            [volumeLow1a, volumeHighLowIB1a, volumeHigh1a],
            [volumeLow1b, volumeHighLowIB1b, volumeHigh1b],
            [volumeLow2a, volumeHighLowIB2a, volumeHigh2a],
            [volumeLow2b, volumeHighLowIB2b, volumeHigh2b],
            [volumeLow3a, volumeHighLowIB3a, volumeHigh3a],
            [volumeLow3b, volumeHighLowIB3b, volumeHigh3b],
          ];
        }
        setPaths(newPaths);
      }
    };

    videoRef.current?.addEventListener("volumechange", volumeChangeHandler);
  }, []);

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='50px'
      height='50px'
      viewBox='0 0 1000 1080'
      fill='white'
    >
      <SVGMorph paths={paths[0]} />
      <SVGMorph paths={paths[1]} />
      <SVGMorph paths={paths[2]} />
      <SVGMorph paths={paths[3]} />
      <SVGMorph paths={paths[4]} />
      <SVGMorph paths={paths[5]} />
    </svg>
  );
}
