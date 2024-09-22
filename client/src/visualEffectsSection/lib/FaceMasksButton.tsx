import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  FaceMasksEffectTypes,
} from "../../context/CurrentEffectsStylesContext";
import baseFaceMask from "../../../public/2DAssets/faceMasks/baseFaceMask.png";
import loading_baseFaceMask from "../../../public/2DAssets/faceMasks/loading_baseFaceMask.png";
import baseFaceMaskIcon from "../../../public/svgs/faceMasks/baseFaceMaskIcon.svg";
import baseFaceMaskOffIcon from "../../../public/svgs/faceMasks/baseFaceMaskOffIcon.svg";
import threeDim_baseFaceMaskIcon from "../../../public/svgs/faceMasks/threeDim_baseFaceMaskIcon.svg";
import threeDim_baseFaceMaskOffIcon from "../../../public/svgs/faceMasks/threeDim_baseFaceMaskOffIcon.svg";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

export default function FaceMasksButton({
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
    ? userStreamEffects.current[type][videoId].faceMasks
    : remoteStreamEffects.current[username][instance][type][videoId].faceMasks;
  const effectsStyles = isUser
    ? currentEffectsStyles.current[type][videoId].faceMasks
    : remoteCurrentEffectsStyles.current[username][instance][type][videoId]
        .faceMasks;

  const faceMasksEffects: {
    [key in FaceMasksEffectTypes]: {
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
    baseFaceMask: {
      image: baseFaceMask,
      loading: loading_baseFaceMask,
      icon: baseFaceMaskIcon,
      offIcon: baseFaceMaskOffIcon,
      threeDimIcon: threeDim_baseFaceMaskIcon,
      threeDimOffIcon: threeDim_baseFaceMaskOffIcon,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);

        await handleVisualEffectChange("faceMasks");

        setEffectsDisabled(false);
      }}
      holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (!effectsStyles || !target || !target.dataset.value) {
          return;
        }

        setEffectsDisabled(true);

        const effectType = target.dataset.value as FaceMasksEffectTypes;
        if (
          effectType in faceMasksEffects &&
          (effectsStyles.style !== effectType || !streamEffects)
        ) {
          if (isUser) {
            if (currentEffectsStyles.current[type][videoId].faceMasks) {
              currentEffectsStyles.current[type][videoId].faceMasks.style =
                effectType;
            }
          } else {
            if (
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].faceMasks
            ) {
              remoteCurrentEffectsStyles.current[username][instance][type][
                videoId
              ].faceMasks.style = effectType;
            }
          }

          await handleVisualEffectChange(
            "faceMasks",
            isUser
              ? userStreamEffects.current[type][videoId].faceMasks
              : remoteStreamEffects.current[username][instance][type][videoId]
                  .faceMasks
          );
        }

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        const iconSrc =
          faceMasksEffects[effectsStyles.style][
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
          {Object.entries(faceMasksEffects).map(([faceMasks, effect]) => (
            <div
              key={faceMasks}
              className={`${effect.flipped && "scale-x-[-1]"} ${
                effect.bgColor === "white" && "bg-white border-fg-black-35"
              } ${
                effect.bgColor === "black" && "border-white"
              } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
              data-value={faceMasks}
            >
              <FgImage
                src={effect.image}
                srcLoading={effect.loading}
                alt={faceMasks}
                style={{ width: "90%", height: "90%" }}
                data-value={faceMasks}
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
