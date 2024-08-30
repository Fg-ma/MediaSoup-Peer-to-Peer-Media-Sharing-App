import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, Transition, Variants, motion } from "framer-motion";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import { Octaves } from "../FgPiano";
import navigateForward from "../../../public/svgs/navigateForward.svg";
import navigateBack from "../../../public/svgs/navigateBack.svg";
import { useStreamsContext } from "../../context/StreamsContext";
import { Samplers } from "../../effects/audioEffects/FgSampler";
import FgSelectionButton from "../../fgSelectionButton/FgSelectionButton";
import VolumeSVG from "../../FgVolumeElement/lib/VolumeSVG";
import volumeSVGPaths from "../../FgVolumeElement/lib/volumeSVGPaths";

const navVar: Variants = {
  leftInit: { opacity: 0, x: -20 },
  leftAnimate: {
    opacity: 1,
    x: 0,
  },
  rightInit: { opacity: 0, x: 20 },
  rightAnimate: {
    opacity: 1,
    x: 0,
  },
  hover: { backgroundColor: "rgb(64 64 64)", fill: "rgb(255, 255, 255)" },
};

const navTransition: Transition = {
  transition: {
    duration: 0.15,
    ease: "linear",
  },
};

export default function ScaleSectionToolbar({
  visibleOctaveRef,
  scrollToOctave,
}: {
  visibleOctaveRef: React.MutableRefObject<Octaves>;
  scrollToOctave: (octave: Octaves) => void;
}) {
  const { userMedia } = useStreamsContext();
  const sliderRef = useRef<HTMLInputElement>(null);

  const [mute, setMute] = useState(false);
  const [volumeState, setVolumeState] = useState({
    from: "",
    to: "high",
  });
  const [sampler, setSampler] = useState<Samplers>({
    category: "pianos",
    kind: "default",
    label: "Default",
  });
  const prevVolume = useRef("1");

  const primaryVolumeSliderColor = "#f57e41";
  const secondaryVolumeSliderColor = "rgba(150, 150, 150, 0.5)";

  const handleVolumeChange = (volume: number) => {
    tracksColorSetter(volume);

    // Map the range slider value (0 to 1) to a decibel scale (-Infinity to 12 dB)
    let volumeDb;
    if (volume === 0) {
      volumeDb = -Infinity;
    } else {
      // Scale the value to the range of -Infinity to 12 dB
      const minDb = -12;
      const maxDb = 12;

      // Use linear interpolation for the dB scale
      volumeDb = (maxDb - minDb) * volume + minDb;
    }

    // Assuming `fgSampler` is accessible in this scope:
    userMedia.current.audio?.setSamplerVolume(volumeDb);
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

    if (!mute && sliderRef.current) {
      prevVolume.current = sliderRef.current.value;

      sliderRef.current.value = mute ? "1" : "0";
    } else if (mute && sliderRef.current) {
      sliderRef.current.value = prevVolume.current;
    }

    setMute((prev) => !prev);
  };

  const tracksColorSetter = (value: number) => {
    if (!sliderRef.current) {
      return;
    }

    const min = 0;
    const max = 1;
    const percentage = ((value - min) / (max - min)) * 100;
    const trackColor = `linear-gradient(to right, ${primaryVolumeSliderColor} 0%, ${primaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} 100%)`;

    sliderRef.current.style.background = trackColor;
  };

  useEffect(() => {
    tracksColorSetter(1);
  }, []);

  return (
    <div className='w-full h-8 flex space-x-2 px-2 mb-1'>
      <div className='font-K2D text-lg flex items-center justify-center space-x-1'>
        <AnimatePresence>
          {visibleOctaveRef.current !== 0 && (
            <motion.div
              variants={navVar}
              initial='leftInit'
              animate='leftAnimate'
              exit='leftInit'
              transition={navTransition}
            >
              <FgButton
                className='w-6 aspect-square rounded-full flex items-center justify-center pr-0.5'
                contentFunction={() => (
                  <FgSVG
                    src={navigateBack}
                    attributes={[
                      { key: "height", value: "1rem" },
                      { key: "width", value: "1rem" },
                    ]}
                  />
                )}
                animationOptions={{
                  variants: navVar,
                  transition: navTransition,
                  whileHover: "hover",
                }}
                clickFunction={() =>
                  scrollToOctave((visibleOctaveRef.current - 1) as Octaves)
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className='mb-0.5 cursor-default select-none'>Octave</div>
        <AnimatePresence>
          {visibleOctaveRef.current !== 6 && (
            <motion.div
              variants={navVar}
              initial='rightInit'
              animate='rightAnimate'
              exit='rightInit'
              transition={navTransition}
            >
              <FgButton
                className='w-6 aspect-square rounded-full flex items-center justify-center pl-0.5'
                contentFunction={() => (
                  <FgSVG
                    src={navigateForward}
                    attributes={[
                      { key: "height", value: "1rem" },
                      { key: "width", value: "1rem" },
                    ]}
                  />
                )}
                clickFunction={() =>
                  scrollToOctave((visibleOctaveRef.current + 1) as Octaves)
                }
                animationOptions={{
                  variants: navVar,
                  transition: navTransition,
                  whileHover: "hover",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className='volume-container w-max h-full flex items-center justify-center space-x-1'>
        <FgButton
          clickFunction={handleMute}
          contentFunction={() => (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 100 100'
              width='1.75rem'
              height='1.75rem'
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
        <input
          ref={sliderRef}
          onInput={handleVolumeSlider}
          className='volume-slider'
          type='range'
          min='0'
          max='1'
          step='any'
        />
      </div>
      <div className='font-K2D text-lg flex items-center justify-center space-x-1'>
        <FgButton
          className='w-6 aspect-square rounded-full flex items-center justify-center pr-0.5'
          contentFunction={() => (
            <FgSVG
              src={navigateBack}
              attributes={[
                { key: "height", value: "1rem" },
                { key: "width", value: "1rem" },
              ]}
            />
          )}
          clickFunction={() => {
            const newSampler = userMedia.current.audio?.swapSampler(
              sampler,
              -1
            );
            if (newSampler) {
              setSampler(newSampler);
            }
          }}
          animationOptions={{
            variants: navVar,
            transition: navTransition,
            whileHover: "hover",
          }}
        />
        <FgSelectionButton
          content={<>{sampler.label}</>}
          selections={{
            value: "instruments",
            Pianos: {
              value: "pianos",
              ["Default"]: "default",
              ["Broken cassette"]: "brokenCassette",
              ["Curly electric"]: "curlyElectric",
              ["Dragon magic"]: "dragonMagicOld",
              ["Soft Steinway"]: "softSteinway",
            },
            Strings: {
              value: "strings",
              ["Broken cello"]: "brokenCello",
              ["Uncle John's five string banjo"]: "uncleJohns5StringBanjo",
            },
            Winds: {
              value: "winds",
              ["Brass French horn"]: "brassFrenchHorn",
              ["Brass trombone"]: "brassTrombone",
              ["Brass trumpet"]: "brassTrumpet",
              ["Brass tuba"]: "brassTuba",
              ["Classic slide whistle"]: "classicSlideWhistle",
              ["Forest flute"]: "forestFlute",
              ["Oboe"]: "oboe",
            },
          }}
          valueSelectionFunction={(selection) => {
            const newSampler = userMedia.current.audio?.swapSampler({
              category: selection[0],
              kind: selection[1],
            });
            if (newSampler) {
              setSampler(newSampler);
            }
          }}
        />
        <FgButton
          className='w-6 aspect-square rounded-full flex items-center justify-center pl-0.5'
          contentFunction={() => (
            <FgSVG
              src={navigateForward}
              attributes={[
                { key: "height", value: "1rem" },
                { key: "width", value: "1rem" },
              ]}
            />
          )}
          clickFunction={() => {
            const newSampler = userMedia.current.audio?.swapSampler(sampler, 1);
            if (newSampler) {
              setSampler(newSampler);
            }
          }}
          animationOptions={{
            variants: navVar,
            transition: navTransition,
            whileHover: "hover",
          }}
        />
      </div>
    </div>
  );
}
