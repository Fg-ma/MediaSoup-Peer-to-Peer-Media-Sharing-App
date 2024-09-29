import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  MasksEffectTypes,
} from "../../context/CurrentEffectsStylesContext";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

import baseMask from "../../../public/2DAssets/masks/baseMask/baseMask.png";
import loading_baseMask from "../../../public/2DAssets/masks/baseMask/loading_baseMask.png";
import baseMaskIcon from "../../../public/svgs/masks/baseMask/baseMaskIcon.svg";
import baseMaskOffIcon from "../../../public/svgs/masks/baseMask/baseMaskOffIcon.svg";
import threeDim_baseMaskIcon from "../../../public/svgs/masks/baseMask/threeDim_baseMaskIcon.svg";
import threeDim_baseMaskOffIcon from "../../../public/svgs/masks/baseMask/threeDim_baseMaskOffIcon.svg";

export default function MasksButton({
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

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].masks
    : remoteStreamEffects.current[username][instance][type][videoId].masks;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].masks
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .masks;

  const masksEffects: {
    [key in MasksEffectTypes]: {
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
    baseMask: {
      image: baseMask,
      loading: loading_baseMask,
      icon: baseMaskIcon,
      offIcon: baseMaskOffIcon,
      threeDimIcon: threeDim_baseMaskIcon,
      threeDimOffIcon: threeDim_baseMaskOffIcon,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);

        await handleVisualEffectChange("masks");

        setEffectsDisabled(false);
      }}
      holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (!effectsStyles || !target || !target.dataset.value) {
          return;
        }

        setEffectsDisabled(true);

        const effectType = target.dataset.value as MasksEffectTypes;
        if (
          effectType in masksEffects &&
          (effectsStyles.style !== effectType || !streamEffects)
        ) {
          if (isUser) {
            if (currentEffectsStyles.current[type][videoId].masks) {
              currentEffectsStyles.current[type][videoId].masks.style =
                effectType;
            }
          } else {
            if (
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].masks
            ) {
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].masks.style = effectType;
            }
          }

          await handleVisualEffectChange(
            "masks",
            isUser
              ? userStreamEffects.current[type][videoId].masks
              : remoteStreamEffects.current[username][instance][type][videoId]
                  .masks
          );
        }

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        const iconSrc =
          masksEffects[effectsStyles.style][
            effectsStyles.threeDim
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
          />
        );
      }}
      holdContent={
        <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(masksEffects).map(([masks, effect]) => (
            <div
              key={masks}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={masks}
            >
              <FgImage
                src={effect.image}
                srcLoading={effect.loading}
                alt={masks}
                style={{ width: "90%", height: "90%" }}
                data-value={masks}
              />
            </div>
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Face mask
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
