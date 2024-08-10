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
import classicalCurlyBeard from "../../../public/2DAssets/beards/classicalCurlyBeard.png";
import loading_classicalCurlyBeard from "../../../public/2DAssets/beards/loading_classicalCurlyBeard.png";
import classicalCurlyBeardIcon from "../../../public/svgs/beards/classicalCurlyBeardIcon.svg";
import classicalCurlyBeardOffIcon from "../../../public/svgs/beards/classicalCurlyBeardOffIcon.svg";
import threeDim_classicalCurlyBeardIcon from "../../../public/svgs/beards/threeDim_classicalCurlyBeardIcon.svg";
import threeDim_classicalCurlyBeardOffIcon from "../../../public/svgs/beards/threeDim_classicalCurlyBeardOffIcon.svg";

export default function BeardsButton({
  type,
  videoId,
  handleEffectChange,
  effectsDisabled,
  setEffectsDisabled,
}: {
  type: "camera";
  videoId: string;
  handleEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const { userStreamEffects } = useStreamsContext();
  const [buttonState, setButtonState] = useState("");

  const beardsEffects: {
    [key in BeardsEffectTypes]: {
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
  };

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);
        setButtonState(
          currentEffectsStyles.current[type][videoId].beards?.threeDim
            ? userStreamEffects.current[type][videoId].beards
              ? "threeDimOffIcon"
              : "threeDimIcon"
            : userStreamEffects.current[type][videoId].beards
            ? "offIcon"
            : "icon"
        );

        await handleEffectChange("beards");

        setEffectsDisabled(false);
      }}
      holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (
          !currentEffectsStyles.current[type][videoId].beards ||
          !target ||
          !target.dataset.value
        ) {
          return;
        }

        setEffectsDisabled(true);

        const effectType = target.dataset.value as BeardsEffectTypes;
        if (
          effectType in beardsEffects &&
          (currentEffectsStyles.current[type][videoId].beards.style !==
            effectType ||
            !userStreamEffects.current[type][videoId].beards)
        ) {
          currentEffectsStyles.current[type][videoId].beards.style = effectType;
          currentEffectsStyles.current[type][videoId].beards.chinOffset =
            beardChinOffsetsMap[effectType];
          await handleEffectChange(
            "beards",
            userStreamEffects.current[type][videoId].beards ? true : false
          );
        }

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        if (!currentEffectsStyles.current[type][videoId].beards) {
          return;
        }

        const iconSrc =
          beardsEffects[
            currentEffectsStyles.current[type][videoId].beards.style
          ][
            currentEffectsStyles.current[type][videoId].beards?.threeDim
              ? userStreamEffects.current[type][videoId].beards
                ? "threeDimOffIcon"
                : "threeDimIcon"
              : userStreamEffects.current[type][videoId].beards
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
            data-value={
              currentEffectsStyles.current[type][videoId].beards?.style
            }
          />
        );
      }}
      doubleClickFunction={async () => {
        if (!currentEffectsStyles.current[type][videoId].beards) {
          return;
        }

        setEffectsDisabled(true);

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

        await handleEffectChange(
          "beards",
          userStreamEffects.current[type][videoId].beards
        );

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
      className='flex items-center justify-center w-10 aspect-square'
      options={{
        defaultDataValue:
          currentEffectsStyles.current[type][videoId].beards?.style,
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
      }}
    />
  );
}
