import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  BeardsEffectTypes,
  beardChinOffsetsMap,
} from "../../context/CurrentEffectsStylesContext";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

import classicalCurlyBeard from "../../../public/2DAssets/beards/classicalCurlyBeard/classicalCurlyBeard.png";
import loading_classicalCurlyBeard from "../../../public/2DAssets/beards/classicalCurlyBeard/loading_classicalCurlyBeard.png";
import classicalCurlyBeardIcon from "../../../public/svgs/beards/classicalCurlyBeard/classicalCurlyBeardIcon.svg";
import classicalCurlyBeardOffIcon from "../../../public/svgs/beards/classicalCurlyBeard/classicalCurlyBeardOffIcon.svg";
import threeDim_classicalCurlyBeardIcon from "../../../public/svgs/beards/classicalCurlyBeard/threeDim_classicalCurlyBeardIcon.svg";
import threeDim_classicalCurlyBeardOffIcon from "../../../public/svgs/beards/classicalCurlyBeard/threeDim_classicalCurlyBeardOffIcon.svg";
import chinBeard from "../../../public/2DAssets/beards/chinBeard/chinBeard.png";
import loading_chinBeard from "../../../public/2DAssets/beards/chinBeard/loading_chinBeard.png";
import chinBeardOff from "../../../public/2DAssets/beards/chinBeard/chinBeardOff.png";
import loading_chinBeardOff from "../../../public/2DAssets/beards/chinBeard/loading_chinBeardOff.png";
import threeDim_chinBeard from "../../../public/2DAssets/beards/chinBeard/threeDim_chinBeard.png";
import threeDim_loading_chinBeard from "../../../public/2DAssets/beards/chinBeard/threeDim_loading_chinBeard.png";

export default function BeardsButton({
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
    ? userStreamEffects.current[type][videoId].beards
    : remoteStreamEffects.current[username][instance][type][videoId].beards;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].beards
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .beards;

  const beardsEffects: {
    [key in BeardsEffectTypes]: {
      image: string;
      loading: string;
      icon?: string;
      offIcon?: string;
      offImage?: string;
      loadingOffImage?: string;
      threeDimIcon?: string;
      threeDimImage?: string;
      threeDimLoadingImage?: string;
      threeDimOffIcon?: string;
      threeDimOffImage?: string;
      threeDimLoadingOffImage?: string;
      flipped: boolean;
      bgColor: "white" | "black";
    };
  } = {
    classicalCurlyBeard: {
      image: classicalCurlyBeard,
      loading: loading_classicalCurlyBeard,
      icon: classicalCurlyBeardIcon,
      offIcon: classicalCurlyBeardOffIcon,
      threeDimIcon: threeDim_classicalCurlyBeardIcon,
      threeDimOffIcon: threeDim_classicalCurlyBeardOffIcon,
      flipped: true,
      bgColor: "black",
    },
    chinBeard: {
      image: chinBeard,
      loading: loading_chinBeard,
      offImage: chinBeardOff,
      loadingOffImage: loading_chinBeardOff,
      threeDimImage: threeDim_chinBeard,
      threeDimLoadingImage: threeDim_loading_chinBeard,
      threeDimOffImage: threeDim_chinBeard,
      threeDimLoadingOffImage: threeDim_loading_chinBeard,
      flipped: false,
      bgColor: "black",
    },
    fullBeard: {
      image: fullBeard,
      loading: loading_fullBeard,
      offImage: fullBeardOff,
      loadingOffImage: loading_fullBeardOff,
      threeDimImage: threeDim_fullBeard,
      threeDimLoadingImage: threeDim_loading_fullBeard,
      threeDimOffImage: threeDim_chinBeard,
      threeDimLoadingOffImage: threeDim_loading_chinBeard,
      flipped: false,
      bgColor: "black",
    },
  };

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);
        setRerender((prev) => prev + 1);

        await handleVisualEffectChange("beards");

        setEffectsDisabled(false);
      }}
      holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (!effectsStyles || !target || !target.dataset.value) {
          return;
        }

        setEffectsDisabled(true);

        const effectType = target.dataset.value as BeardsEffectTypes;
        if (
          effectType in beardsEffects &&
          (effectsStyles.style !== effectType || !streamEffects)
        ) {
          if (isUser) {
            if (currentEffectsStyles.current[type][videoId].beards) {
              currentEffectsStyles.current[type][videoId].beards.style =
                effectType;
              currentEffectsStyles.current[type][videoId].beards.chinOffset =
                beardChinOffsetsMap[effectType];
            }
          } else {
            if (
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].beards
            ) {
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].beards.style = effectType;
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].beards.chinOffset = beardChinOffsetsMap[effectType];
            }
          }

          await handleVisualEffectChange(
            "beards",
            isUser
              ? userStreamEffects.current[type][videoId].beards
              : remoteStreamEffects.current[username][instance][type][videoId]
                  .beards
          );
        }

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        if (beardsEffects[effectsStyles?.style ?? "classicalCurlyBeard"].icon) {
          const iconSrc =
            beardsEffects[effectsStyles?.style ?? "classicalCurlyBeard"][
              effectsStyles?.threeDim
                ? streamEffects
                  ? "threeDimOffIcon"
                  : "threeDimIcon"
                : streamEffects
                ? "offIcon"
                : "icon"
            ];

          if (iconSrc) {
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
          }
        } else {
          const imageSrc =
            beardsEffects[effectsStyles?.style ?? "classicalCurlyBeard"][
              effectsStyles?.threeDim
                ? streamEffects
                  ? "threeDimOffImage"
                  : "threeDimImage"
                : streamEffects
                ? "offImage"
                : "image"
            ];

          const imageLoadingSrc =
            beardsEffects[effectsStyles?.style ?? "classicalCurlyBeard"][
              effectsStyles?.threeDim
                ? streamEffects
                  ? "threeDimLoadingOffImage"
                  : "threeDimLoadingImage"
                : streamEffects
                ? "loadingOffImage"
                : "loading"
            ];

          if (imageSrc) {
            return (
              <FgImage
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles?.style}
                style={{ width: "90%", height: "90%" }}
                data-value={effectsStyles?.style}
              />
            );
          }
        }
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
          {Object.entries(beardsEffects).map(([beards, effect]) => (
            <div
              key={beards}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={beards}
            >
              <FgImage
                src={effect.image}
                srcLoading={effect.loading}
                alt={beards}
                style={{ width: "90%", height: "90%" }}
                data-value={beards}
              />
            </div>
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Beard
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
