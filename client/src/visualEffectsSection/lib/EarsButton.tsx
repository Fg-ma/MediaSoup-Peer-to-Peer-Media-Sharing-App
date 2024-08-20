import React, { useEffect, useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  EarsEffectTypes,
  earsWidthFactorMap,
} from "../../context/CurrentEffectsStylesContext";
import dogEars from "../../../public/2DAssets/ears/dogEars.png";
import loading_dogEars from "../../../public/2DAssets/ears/loading_dogEars.png";
import dogEarsIcon from "../../../public/svgs/ears/dogEarsIcon.svg";
import dogEarsOffIcon from "../../../public/svgs/ears/dogEarsOffIcon.svg";
import threeDim_dogEarsIcon from "../../../public/svgs/ears/threeDim_dogEarsIcon.svg";
import threeDim_dogEarsOffIcon from "../../../public/svgs/ears/threeDim_dogEarsOffIcon.svg";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

export default function EarsButton({
  username,
  instance,
  type,
  videoId,
  isUser,
  handleVisualEffectChange,
  effectsDisabled,
  setEffectsDisabled,
}: {
  username: string;
  instance: string;
  type: "camera";
  videoId: string;
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentEffectsStyles, remoteCurrentEffectsStyles } =
    useCurrentEffectsStylesContext();
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const [rerender, setRerender] = useState(0);

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].ears
    : remoteStreamEffects.current[username][instance][type][videoId].ears;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].ears
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .ears;

  const earsEffects: {
    [key in EarsEffectTypes]: {
      image: string;
      loading: string;
      icon: string;
      offIcon: string;
      threeDimIcon: string;
      threeDimOffIcon: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    dogEars: {
      image: dogEars,
      loading: loading_dogEars,
      icon: dogEarsIcon,
      offIcon: dogEarsOffIcon,
      threeDimIcon: threeDim_dogEarsIcon,
      threeDimOffIcon: threeDim_dogEarsOffIcon,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);
        setRerender((prev) => prev + 1);

        await handleVisualEffectChange("ears");

        setEffectsDisabled(false);
      }}
      holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (!effectsStyles || !target || !target.dataset.value) {
          return;
        }

        setEffectsDisabled(true);

        const effectType = target.dataset.value as EarsEffectTypes;
        if (
          effectType in earsEffects &&
          (effectsStyles.style !== effectType || !streamEffects)
        ) {
          if (isUser) {
            if (currentEffectsStyles.current[type][videoId].ears) {
              currentEffectsStyles.current[type][videoId].ears.style =
                effectType;
              currentEffectsStyles.current[type][
                videoId
              ].ears.leftEarWidthFactor =
                earsWidthFactorMap[effectType].leftEarWidthFactor;
              currentEffectsStyles.current[type][
                videoId
              ].ears.rightEarWidthFactor =
                earsWidthFactorMap[effectType].rightEarWidthFactor;
            }
          } else {
            if (
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].ears
            ) {
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].ears.style = effectType;
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].ears.leftEarWidthFactor =
                earsWidthFactorMap[effectType].leftEarWidthFactor;
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].ears.rightEarWidthFactor =
                earsWidthFactorMap[effectType].rightEarWidthFactor;
            }
          }

          await handleVisualEffectChange(
            "ears",
            isUser
              ? userStreamEffects.current[type][videoId].ears
              : remoteStreamEffects.current[username][instance][type][videoId]
                  .ears
          );
        }

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        const iconSrc =
          earsEffects[effectsStyles?.style ?? "dogEars"][
            effectsStyles?.threeDim
              ? streamEffects
                ? "threeDimOffIcon"
                : "threeDimIcon"
              : streamEffects
              ? "offIcon"
              : "icon"
          ];

        return (
          <FgSVG
            src={iconSrc}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
            ]}
            data-value={effectsStyles?.style}
          />
        );
      }}
      doubleClickFunction={async () => {
        if (!effectsStyles) {
          return;
        }

        setEffectsDisabled(true);

        effectsStyles.threeDim = !effectsStyles.threeDim;

        setRerender((prev) => prev + 1);

        await handleVisualEffectChange("beards", streamEffects);

        setEffectsDisabled(false);
      }}
      holdContent={
        <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(earsEffects).map(([ears, effect]) => (
            <div
              key={ears}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={ears}
            >
              <FgImage
                src={effect.image}
                srcLoading={effect.loading}
                alt={ears}
                style={{ width: "90%", height: "90%" }}
                data-value={ears}
              />
            </div>
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Ears
        </div>
      }
      className='flex items-center justify-center min-w-10 w-10 aspect-square'
      options={{
        defaultDataValue: effectsStyles?.style,
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
      }}
    />
  );
}
