import React, { useEffect, useRef, useState } from "react";
import { useMediaContext } from "../../../context/mediaContext/MediaContext";
import FgButton from "../../../elements/fgButton/FgButton";
import VolumeSVG from "../../../fgVolumeElement/lib/VolumeSVG";
import volumeSVGPaths from "../../../fgVolumeElement/lib/volumeSVGPaths";

export default function SamplerVolume() {
  const { userMedia } = useMediaContext();

  const [mute, setMute] = useState(false);
  const [volumeState, setVolumeState] = useState({
    from: "",
    to: "high",
  });
  const sliderRef = useRef<HTMLInputElement>(null);
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

    const percentage = value * 100;
    sliderRef.current.style.background = `linear-gradient(to right, ${primaryVolumeSliderColor} 0%, ${primaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} ${percentage}%, ${secondaryVolumeSliderColor} 100%)`;
  };

  useEffect(() => {
    tracksColorSetter(1);
  }, []);

  return (
    <div className='flex volume-container w-max h-full items-center justify-center space-x-1'>
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
  );
}
