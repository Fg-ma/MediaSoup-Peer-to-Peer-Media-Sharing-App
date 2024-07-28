import React, { useState } from "react";
import FgButton from "./fgButton/FgButton";
import { AudioEffectTypes, useStreamsContext } from "./context/StreamsContext";
import { useCurrentEffectsStylesContext } from "./context/CurrentEffectsStylesContext";
import handleAudioEffect from "./effects/audioEffects/handleAudioEffects";
import FgSVG from "./fgSVG/FgSVG";
import FgImage from "./fgImage/FgImage";

export default function AudioEffectsButton() {
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const { userStreamEffects, userMedia } = useStreamsContext();
  const [buttonState, setButtonState] = useState("");

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
      offIcon: muteOffIcon,
      flipped: true,
      bgColor: "black",
    },
    robot: {
      image: robot,
      loading: loading_robot,
      icon: robotIcon,
      offIcon: robotOffIcon,
      flipped: true,
      bgColor: "black",
    },
  };

  return (
    <FgButton
      clickFunction={async () => {
        setButtonState(" ");
        // currentEffectsStyles.current[type][videoId].beards?.threeDim
        //   ? userStreamEffects.current.audio[videoId].beards
        //     ? "threeDimOffIcon"
        //     : "threeDimIcon"
        //   : userStreamEffects.current[type][videoId].beards
        //   ? "offIcon"
        //   : "icon"

        await handleAudioEffect("robot", false, userMedia, userStreamEffects);
      }}
      holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (!target || !target.dataset.value) {
          return;
        }

        const effectType = target.dataset.value as AudioEffectTypes;
        if (
          effectType in audioEffects &&
          (currentEffectsStyles.current.audio.style !== effectType ||
            !userStreamEffects.current.audio[effectType])
        ) {
          currentEffectsStyles.current.audio.style = effectType;
          await handleAudioEffect(
            "robot",
            userStreamEffects.current.audio ? true : false,
            userMedia,
            userStreamEffects
          );
        }
      }}
      contentFunction={() => {
        if (!currentEffectsStyles.current.audio) {
          return;
        }

        const iconSrc =
          audioEffects[currentEffectsStyles.current.audio.mute][
            userStreamEffects.current.audio.mute ? "offIcon" : "icon"
          ];

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
            ]}
            data-value={currentEffectsStyles.current.audio.style}
          />
        );
      }}
      doubleClickFunction={async () => {
        if (!currentEffectsStyles.current.audio.style) {
          return;
        }

        currentEffectsStyles.current[type][videoId].beards.threeDim =
          !currentEffectsStyles.current[type][videoId].beards.threeDim;

        setButtonState(
          currentEffectsStyles.current[type][videoId].beards.threeDim
            ? userStreamEffects.current[type][videoId].beards
              ? "threeDimOffIcon"
              : "threeDimIcon"
            : userStreamEffects.current[type][videoId].beards
            ? "offIcon"
            : "icon"
        );

        await handleAudioEffect(
          "robot",
          userStreamEffects.current.audio.mute,
          userMedia,
          userStreamEffects
        );
      }}
      holdContent={
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
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Audio Effects
        </div>
      }
      className='flex items-center justify-center w-10 aspect-square'
      defaultDataValue={currentEffectsStyles.current.audio.style}
      hoverTimeoutDuration={750}
    />
  );
}
