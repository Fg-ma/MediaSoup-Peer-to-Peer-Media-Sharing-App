import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  GlassesEffectTypes,
} from "../../context/CurrentEffectsStylesContext";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import defaultGlasses from "../../../public/2DAssets/glasses/defaultGlasses.png";
import loading_defaultGlasses from "../../../public/2DAssets/glasses/loading_defaultGlasses.png";
import memeGlasses from "../../../public/2DAssets/glasses/memeGlasses.png";
import loading_memeGlasses from "../../../public/2DAssets/glasses/loading_memeGlasses.png";
import americaGlasses from "../../../public/2DAssets/glasses/americaGlasses.png";
import loading_americaGlasses from "../../../public/2DAssets/glasses/loading_americaGlasses.png";
import threeDGlasses from "../../../public/2DAssets/glasses/threeDGlasses.png";
import loading_threeDGlasses from "../../../public/2DAssets/glasses/loading_threeDGlasses.png";
import shades from "../../../public/2DAssets/glasses/shades.png";
import loading_shades from "../../../public/2DAssets/glasses/loading_shades.png";
import defaultGlassesIcon from "../../../public/svgs/glasses/defaultGlassesIcon.svg";
import defaultGlassesOffIcon from "../../../public/svgs/glasses/defaultGlassesOffIcon.svg";
import threeDim_defaultGlassesIcon from "../../../public/svgs/glasses/threeDim_defaultGlassesIcon.svg";
import threeDim_defaultGlassesOffIcon from "../../../public/svgs/glasses/threeDim_defaultGlassesOffIcon.svg";
import memeGlassesIcon from "../../../public/svgs/glasses/memeGlassesIcon.svg";
import memeGlassesOffIcon from "../../../public/svgs/glasses/memeGlassesOffIcon.svg";
import threeDim_memeGlassesIcon from "../../../public/svgs/glasses/threeDim_memeGlassesIcon.svg";
import threeDim_memeGlassesOffIcon from "../../../public/svgs/glasses/threeDim_memeGlassesOffIcon.svg";
import americaGlassesIcon from "../../../public/svgs/glasses/americaGlassesIcon.svg";
import americaGlassesOffIcon from "../../../public/svgs/glasses/americaGlassesOffIcon.svg";
import threeDim_americaGlassesIcon from "../../../public/svgs/glasses/threeDim_americaGlassesIcon.svg";
import threeDim_americaGlassesOffIcon from "../../../public/svgs/glasses/threeDim_americaGlassesOffIcon.svg";
import threeDGlassesIcon from "../../../public/svgs/glasses/threeDGlassesIcon.svg";
import threeDGlassesOffIcon from "../../../public/svgs/glasses/threeDGlassesOffIcon.svg";
import threeDim_threeDGlassesIcon from "../../../public/svgs/glasses/threeDim_threeDGlassesIcon.svg";
import threeDim_threeDGlassesOffIcon from "../../../public/svgs/glasses/threeDim_threeDGlassesOffIcon.svg";
import shadesIcon from "../../../public/svgs/glasses/shadesIcon.svg";
import shadesOffIcon from "../../../public/svgs/glasses/shadesOffIcon.svg";
import threeDim_shadesIcon from "../../../public/svgs/glasses/threeDim_shadesIcon.svg";
import threeDim_shadesOffIcon from "../../../public/svgs/glasses/threeDim_shadesOffIcon.svg";

export default function GlassesButton({
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
    ? userStreamEffects.current[type][videoId].glasses
    : remoteStreamEffects.current[username][instance][type][videoId].glasses;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].glasses
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .glasses;

  const glassesEffects: {
    [key in GlassesEffectTypes]: {
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
    defaultGlasses: {
      image: defaultGlasses,
      loading: loading_defaultGlasses,
      icon: defaultGlassesIcon,
      offIcon: defaultGlassesOffIcon,
      threeDimIcon: threeDim_defaultGlassesIcon,
      threeDimOffIcon: threeDim_defaultGlassesOffIcon,
      flipped: false,
      bgColor: "white",
    },
    memeGlasses: {
      image: memeGlasses,
      loading: loading_memeGlasses,
      icon: memeGlassesIcon,
      offIcon: memeGlassesOffIcon,
      threeDimIcon: threeDim_memeGlassesIcon,
      threeDimOffIcon: threeDim_memeGlassesOffIcon,
      flipped: true,
      bgColor: "white",
    },
    americaGlasses: {
      image: americaGlasses,
      loading: loading_americaGlasses,
      icon: americaGlassesIcon,
      offIcon: americaGlassesOffIcon,
      threeDimIcon: threeDim_americaGlassesIcon,
      threeDimOffIcon: threeDim_americaGlassesOffIcon,
      flipped: true,
      bgColor: "white",
    },
    threeDGlasses: {
      image: threeDGlasses,
      loading: loading_threeDGlasses,
      icon: threeDGlassesIcon,
      offIcon: threeDGlassesOffIcon,
      threeDimIcon: threeDim_threeDGlassesIcon,
      threeDimOffIcon: threeDim_threeDGlassesOffIcon,
      flipped: false,
      bgColor: "black",
    },
    shades: {
      image: shades,
      loading: loading_shades,
      icon: shadesIcon,
      offIcon: shadesOffIcon,
      threeDimIcon: threeDim_shadesIcon,
      threeDimOffIcon: threeDim_shadesOffIcon,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);
        setRerender((prev) => prev + 1);

        await handleVisualEffectChange("glasses");

        setEffectsDisabled(false);
      }}
      holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (!effectsStyles || !target || !target.dataset.value) {
          return;
        }

        setEffectsDisabled(true);

        const effectType = target.dataset.value as GlassesEffectTypes;
        if (
          effectType in glassesEffects &&
          (effectsStyles.style !== effectType || !streamEffects)
        ) {
          if (isUser) {
            if (currentEffectsStyles.current[type][videoId].glasses) {
              currentEffectsStyles.current[type][videoId].glasses.style =
                effectType;
            }
          } else {
            if (
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].glasses
            ) {
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].glasses.style = effectType;
            }
          }

          await handleVisualEffectChange(
            "glasses",
            isUser
              ? userStreamEffects.current[type][videoId].glasses
              : remoteStreamEffects.current[username][instance][type][videoId]
                  .glasses
          );
        }

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        const iconSrc =
          glassesEffects[effectsStyles.style][
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
            data-value={effectsStyles.style}
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

        await handleVisualEffectChange("glasses", streamEffects);

        setEffectsDisabled(false);
      }}
      holdContent={
        <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
          {Object.entries(glassesEffects).map(([glasses, effect]) => (
            <div
              key={glasses}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={glasses}
            >
              <FgImage
                src={effect.image}
                srcLoading={effect.loading}
                alt={glasses}
                style={{ width: "90%", height: "90%" }}
                data-value={glasses}
              />
            </div>
          ))}
        </div>
      }
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Glasses
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
