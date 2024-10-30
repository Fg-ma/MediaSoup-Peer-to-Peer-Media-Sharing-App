import React, { useEffect, useRef, useState } from "react";
import { useStreamsContext } from "../../context/streamsContext/StreamsContext";
import { AnimatePresence, motion, Transition, Variants } from "framer-motion";
import FgButton from "../../fgButton/FgButton";
import VolumeSVG from "../../FgVolumeElement/lib/VolumeSVG";
import volumeSVGPaths from "../../FgVolumeElement/lib/volumeSVGPaths";

const samplerMetronomeVolumeVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const samplerMetronomeVolumeTransition: Transition = {
  transition: {
    opacity: { duration: 0.05 },
    scale: { duration: 0.05 },
  },
};

export default function SamplerMetronomeVolume() {
  const { userMedia } = useStreamsContext();

  const [mute, setMute] = useState(false);
  const [volumeState, setVolumeState] = useState({
    from: "",
    to: "high",
  });
  const samplerMetronomeVolumeSliderRef = useRef<HTMLInputElement>(null);
  const prevVolume = useRef("1");

  const tracksColorSetter = (value: number) => {
    if (!samplerMetronomeVolumeSliderRef.current) {
      return;
    }

    const percentage = value * 100;
    samplerMetronomeVolumeSliderRef.current.style.background = `linear-gradient(to right, #f57e41 ${percentage}%, rgba(150, 150, 150, 0.5) ${percentage}%)`;
  };

  const handleVolumeChange = (volume: number) => {
    tracksColorSetter(volume);

    // Map the range slider value (0 to 1) to a decibel scale (-Infinity to 12 dB)
    let volumeDb;
    if (volume === 0) {
      volumeDb = -Infinity;
    } else {
      // Scale the value to the range of -Infinity to 12 dB
      const minDb = -12;
      const maxDb = 1;

      // Use linear interpolation for the dB scale
      volumeDb = (maxDb - minDb) * volume + minDb;
    }

    userMedia.current.audio?.setMetronomeVolume(volumeDb);
  };

  const handleVolumeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volumeValue = parseFloat(event.target.value);

    if (volumeValue !== 0) {
      if (volumeState.to !== "high") {
        setVolumeState((prev) => ({ from: prev.to, to: "high" }));
      }
      if (mute) {
        setMute(false);
      }
    } else {
      handleMute();
    }

    handleVolumeChange(volumeValue);
  };

  const handleMute = () => {
    handleVolumeChange(mute ? parseFloat(prevVolume.current) : 0);

    const newVolumeState = mute ? "high" : "off";
    if (newVolumeState !== volumeState.to) {
      setVolumeState((prev) => ({ from: prev.to, to: newVolumeState }));
    }

    if (!mute && samplerMetronomeVolumeSliderRef.current) {
      prevVolume.current = samplerMetronomeVolumeSliderRef.current.value;

      samplerMetronomeVolumeSliderRef.current.value = mute ? "1" : "0";
    } else if (mute && samplerMetronomeVolumeSliderRef.current) {
      samplerMetronomeVolumeSliderRef.current.value = prevVolume.current;
    }

    setMute((prev) => !prev);
  };

  useEffect(() => {
    tracksColorSetter(1);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className='metronome-volume-container shadow-lg space-y-2'
        variants={samplerMetronomeVolumeVar}
        initial='init'
        exit='init'
        animate='animate'
        transition={samplerMetronomeVolumeTransition}
      >
        <div className='w-[6.5rem] h-[6.5rem] flex justify-center items-center'>
          <input
            ref={samplerMetronomeVolumeSliderRef}
            onInput={handleVolumeSlider}
            className='metronome-volume-slider'
            type='range'
            min='0'
            max='1'
            step='any'
          />
        </div>{" "}
        <FgButton
          clickFunction={handleMute}
          contentFunction={() => (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 100 100'
              width='1.5rem'
              height='1.5rem'
            >
              <VolumeSVG
                volumeState={volumeState}
                movingPath={volumeSVGPaths.low.right}
                color='black'
                stationaryPaths={[
                  volumeSVGPaths.high.left,
                  volumeSVGPaths.high.middle,
                ]}
              />
            </svg>
          )}
        />
      </motion.div>
    </AnimatePresence>
  );
}
