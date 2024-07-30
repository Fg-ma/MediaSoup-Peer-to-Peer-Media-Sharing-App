import React, { useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import { AudioEffectTypes, useStreamsContext } from "../context/StreamsContext";
import { useCurrentEffectsStylesContext } from "../context/CurrentEffectsStylesContext";
import FgSVG from "../fgSVG/FgSVG";
import FgImage from "../fgImage/FgImage";
import audioEffectIcon from "../../public/svgs/audioEffectIcon.svg";
import audioEffectOffIcon from "../../public/svgs/audioEffectOffIcon.svg";
import mute from "../../public/2DAssets/audio/mute.png";
import loading_mute from "../../public/2DAssets/audio/loading_mute.png";
import muteIcon from "../../public/svgs/audio/muteIcon.svg";
import robot from "../../public/2DAssets/audio/robot.png";
import loading_robot from "../../public/2DAssets/audio/loading_robot.png";
import robotIcon from "../../public/svgs/audio/robotIcon.svg";
import AudioEffectsPortal from "./lib/AudioEffectsPortal";
import "./lib/audioEffects.css";
import AudioEffectSlider from "./lib/AudioEffectSlider";

export default function AudioEffectsButton() {
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const { userStreamEffects, userMedia } = useStreamsContext();
  const [active, setActive] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const audioEffects: {
    [key in AudioEffectTypes]: {
      image: string;
      loading: string;
      icon: string;
      offIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    mute: {
      image: mute,
      loading: loading_mute,
      icon: muteIcon,
      offIcon: muteIcon,
      flipped: false,
      bgColor: "black",
    },
    robot: {
      image: robot,
      loading: loading_robot,
      icon: robotIcon,
      offIcon: robotIcon,
      flipped: false,
      bgColor: "black",
    },
  };

  return (
    <>
      <FgButton
        externalRef={buttonRef}
        clickFunction={async () => {
          setActive((prev) => !prev);
        }}
        holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
          const target = event.target as HTMLElement;
          if (!target || !target.dataset.value) {
            return;
          }

          const effectType = target.dataset.value as AudioEffectTypes;
          if (
            effectType in audioEffects &&
            !userStreamEffects.current.audio[effectType]
          ) {
            await userMedia.current.audio?.changeEffects(effectType, false);
          }
        }}
        contentFunction={() => {
          if (!currentEffectsStyles.current.audio) {
            return;
          }

          return (
            <FgSVG
              src={active ? audioEffectOffIcon : audioEffectIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
              ]}
            />
          );
        }}
        holdContent={
          !active ? (
            <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
              {Object.entries(audioEffects).map(([audio, effect]) => (
                <div
                  key={audio}
                  className={`${effect.flipped && "scale-x-[-1]"} ${
                    effect.bgColor === "white" && "bg-white border-fg-black-35"
                  } ${
                    effect.bgColor === "black" && "border-white"
                  } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                  data-value={audio}
                >
                  <FgImage
                    src={effect.image}
                    srcLoading={effect.loading}
                    alt={audio}
                    style={{ width: "90%", height: "90%" }}
                    data-value={audio}
                  />
                </div>
              ))}
            </div>
          ) : (
            <></>
          )
        }
        hoverContent={
          !active ? (
            <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Audio Effects
            </div>
          ) : (
            <></>
          )
        }
        className='flex items-center justify-center w-10 aspect-square'
      />
      <AudioEffectsPortal
        type='below'
        content={
          active ? (
            <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
              <AudioEffectSlider ticks={5} rangeMax={100} rangeMin={0} />
              <AudioEffectSlider ticks={8} rangeMax={80} rangeMin={20} />
              <AudioEffectSlider ticks={4} rangeMax={90} rangeMin={7} />
              {Object.entries(audioEffects).map(([audio, effect]) => (
                <button
                  key={audio}
                  className={`${effect.flipped && "scale-x-[-1]"} ${
                    effect.bgColor === "white" && "bg-white border-fg-black-35"
                  } ${
                    effect.bgColor === "black" && "border-white"
                  } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                  onClick={() => {
                    userMedia.current.audio?.changeEffects(
                      audio as AudioEffectTypes,
                      false
                    );
                  }}
                >
                  <FgImage
                    src={effect.image}
                    srcLoading={effect.loading}
                    alt={audio}
                    style={{ width: "90%", height: "90%" }}
                    data-value={audio}
                  />
                </button>
              ))}
            </div>
          ) : (
            <></>
          )
        }
        buttonRef={buttonRef}
      />
    </>
  );
}
