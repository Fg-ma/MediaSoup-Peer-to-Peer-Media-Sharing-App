import React, { useEffect, useRef, useState } from "react";
import { Transition, Variants, motion, AnimatePresence } from "framer-motion";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import FgButton from "../../../elements/fgButton/FgButton";
import FgSVG from "../../../elements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../elements/fgHoverContentStandard/FgHoverContentStandard";
import SamplerMetronomeVolume from "./SamplerMetronomeVolume";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const metronomeIcon =
  nginxAssetServerBaseUrl + "svgs/audioEffects/metronomeIcon.svg";
const metronomeOffIcon =
  nginxAssetServerBaseUrl + "svgs/audioEffects/metronomeOffIcon.svg";

export const bpmInputVar: Variants = {
  init: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
  },
};

export const bpmInputTransition: Transition = {
  transition: {
    duration: 0.5,
    ease: "linear",
  },
};

export default function SamplerMetronome() {
  const { userMedia } = useMediaContext();

  const [metronomeActive, setMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [metronomeVolumeActive, setMetronomeVolumeActive] = useState(false);
  const samplerMetronomeRef = useRef<HTMLDivElement>(null);
  const bpmTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") {
      setBpm(0); // Handle empty input as 0
    } else {
      const parsedValue = parseInt(value);
      if (!isNaN(parsedValue)) {
        const newBpm = Math.min(parsedValue, 1242);
        setBpm(newBpm); // Only set valid numbers
        userMedia.current.audio?.setMetronomeBPM(newBpm);
      }
    }
  };

  const handlePointerLeave = () => {
    samplerMetronomeRef.current?.removeEventListener(
      "pointerleave",
      handlePointerLeave
    );

    if (bpmTimeout.current) {
      clearTimeout(bpmTimeout.current);
      bpmTimeout.current = undefined;
    }
    setHovered(false);
  };

  useEffect(() => {
    userMedia.current.audio?.setMetronomeBPM(bpm);

    return () => {
      userMedia.current.audio?.stopMetronome();
    };
  }, []);

  useEffect(() => {
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (!samplerMetronomeRef.current?.contains(event.target as Node)) {
        setMetronomeVolumeActive(false);
      }
    };

    if (metronomeVolumeActive) {
      document.addEventListener("pointerdown", handleDocumentPointerDown);
    } else {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    }

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [metronomeVolumeActive]);

  return (
    <div
      ref={samplerMetronomeRef}
      className='flex items-center justify-center relative'
      onPointerEnter={() => {
        samplerMetronomeRef.current?.addEventListener(
          "pointerleave",
          handlePointerLeave
        );

        bpmTimeout.current = setTimeout(() => {
          setHovered(true);
        }, 750);
      }}
    >
      <FgButton
        contentFunction={() => {
          const iconSrc = metronomeActive ? metronomeOffIcon : metronomeIcon;

          return (
            <FgSVG
              src={iconSrc}
              attributes={[
                { key: "height", value: "95%" },
                { key: "width", value: "95%" },
                { key: "fill", value: "black" },
                { key: "stroke", value: "black" },
              ]}
            />
          );
        }}
        clickFunction={() => {
          if (metronomeActive) {
            const succeeded = userMedia.current.audio?.stopMetronome();
            if (succeeded) {
              setMetronomeActive(false);
            }
          } else {
            const succeeded = userMedia.current.audio?.startMetronome();
            if (succeeded) {
              setMetronomeActive(true);
            }
          }
        }}
        hoverContent={
          !metronomeVolumeActive ? (
            <FgHoverContentStandard
              content={metronomeActive ? "Stop metronome" : "Start metronome"}
            />
          ) : undefined
        }
        className='flex items-center justify-center h-8 min-h-8 aspect-square relative'
        options={{ hoverType: "below", hoverTimeoutDuration: 750 }}
        focusFunction={() => setFocused(true)}
        blurFunction={() => setFocused(false)}
        doubleClickFunction={() => {
          setMetronomeVolumeActive((prev) => !prev);
        }}
      />
      {metronomeVolumeActive && <SamplerMetronomeVolume />}
      <AnimatePresence>
        {(hovered || metronomeActive || inputFocused || focused) && (
          <motion.input
            className='pl-1.5 h-8 text-xl font-K2D bg-transparent outline-none'
            style={{
              width: `4ch`,
            }}
            placeholder='BPM'
            value={bpm === 0 ? "" : bpm}
            onChange={handleChange}
            variants={bpmInputVar}
            initial='init'
            exit='init'
            animate='animate'
            transition={bpmInputTransition}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
