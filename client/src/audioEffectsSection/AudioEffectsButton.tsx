import React, { useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import { AudioEffectTypes } from "../context/StreamsContext";
import { useCurrentEffectsStylesContext } from "../context/CurrentEffectsStylesContext";
import FgSVG from "../fgSVG/FgSVG";
import AudioEffectsSection from "./lib/AudioEffectsSection";
import AudioMixEffectsPortal from "./lib/AudioMixEffectsPortal";
import audioEffectIcon from "../../public/svgs/audioEffectIcon.svg";
import audioEffectOffIcon from "../../public/svgs/audioEffectOffIcon.svg";
import mute from "../../public/2DAssets/audio/mute.png";
import loading_mute from "../../public/2DAssets/audio/loading_mute.png";
import muteIcon from "../../public/svgs/audio/muteIcon.svg";
import robot from "../../public/2DAssets/audio/robot.png";
import loading_robot from "../../public/2DAssets/audio/loading_robot.png";
import robotIcon from "../../public/svgs/audio/robotIcon.svg";
import "./lib/audioEffects.css";

export default function AudioEffectsButton() {
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const [effectSectionActive, setEffectSectionActive] = useState(false);
  const [audioMixEffectsActive, setAudioMixEffectsActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const audioEffects: {
    [key in AudioEffectTypes]: {
      type: "svg" | "image";
      flipped: boolean;
      bgColor: "white" | "black";
      image?: string;
      loading?: string;
      icon?: string;
      offIcon?: string;
    };
  } = {
    mute: {
      type: "svg",
      flipped: false,
      bgColor: "black",
      image: mute,
      loading: loading_mute,
      icon: muteIcon,
      offIcon: muteIcon,
    },
    robot: {
      type: "svg",
      flipped: false,
      bgColor: "black",
      image: robot,
      loading: loading_robot,
      icon: robotIcon,
      offIcon: robotIcon,
    },
  };

  return (
    <>
      <FgButton
        externalRef={buttonRef}
        clickFunction={async () => {
          setEffectSectionActive((prev) => !prev);
        }}
        contentFunction={() => {
          if (!currentEffectsStyles.current.audio) {
            return;
          }

          return (
            <FgSVG
              src={effectSectionActive ? audioEffectOffIcon : audioEffectIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
              ]}
            />
          );
        }}
        hoverContent={
          !effectSectionActive ? (
            <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Audio Effects
            </div>
          ) : (
            <></>
          )
        }
        className='flex items-center justify-center w-10 aspect-square'
      />
      {effectSectionActive && (
        <AudioEffectsSection
          type='below'
          buttonRef={buttonRef}
          audioMixEffectsActive={audioMixEffectsActive}
          setAudioMixEffectsActive={setAudioMixEffectsActive}
        />
      )}
      {audioMixEffectsActive && <AudioMixEffectsPortal buttonRef={buttonRef} />}
    </>
  );
}
