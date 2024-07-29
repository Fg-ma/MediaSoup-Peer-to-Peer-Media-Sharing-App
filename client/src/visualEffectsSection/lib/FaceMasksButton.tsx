import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import FgImage from "../../fgImage/FgImage";
import {
  useCurrentEffectsStylesContext,
  FaceMasksEffectTypes,
} from "../../context/CurrentEffectsStylesContext";
import faceMask1 from "../../../public/2DAssets/faceMasks/faceMask1.png";
import loading_faceMask1 from "../../../public/2DAssets/faceMasks/loading_faceMask1.png";
import faceMaskIcon1 from "../../../public/svgs/faceMasks/faceMaskIcon1.svg";
import faceMaskOffIcon1 from "../../../public/svgs/faceMasks/faceMaskOffIcon1.svg";
import threeDim_faceMaskIcon1 from "../../../public/svgs/faceMasks/threeDim_faceMaskIcon1.svg";
import threeDim_faceMaskOffIcon1 from "../../../public/svgs/faceMasks/threeDim_faceMaskOffIcon1.svg";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

export default function FaceMasksButton({
  type,
  videoId,
  handleEffectChange,
  effectsDisabled,
  setEffectsDisabled,
}: {
  handleEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  type: "camera";
  videoId: string;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentEffectsStyles } = useCurrentEffectsStylesContext();
  const { userStreamEffects } = useStreamsContext();

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
    faceMask1: {
      image: faceMask1,
      loading: loading_faceMask1,
      icon: faceMaskIcon1,
      offIcon: faceMaskOffIcon1,
      threeDimIcon: threeDim_faceMaskIcon1,
      threeDimOffIcon: threeDim_faceMaskOffIcon1,
      flipped: false,
      bgColor: "white",
    },
  };

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);

        await handleEffectChange("faceMasks");

        setEffectsDisabled(false);
      }}
      holdFunction={async (event: React.MouseEvent<Element, MouseEvent>) => {
        const target = event.target as HTMLElement;
        if (
          !currentEffectsStyles.current[type][videoId].faceMasks ||
          !target ||
          !target.dataset.value
        ) {
          return;
        }

        setEffectsDisabled(true);

        const effectType = target.dataset.value as FaceMasksEffectTypes;
        if (
          effectType in faceMasksEffects &&
          (currentEffectsStyles.current[type][videoId].faceMasks.style !==
            effectType ||
            !userStreamEffects.current[type][videoId].faceMasks)
        ) {
          currentEffectsStyles.current[type][videoId].faceMasks.style =
            effectType;
          await handleEffectChange("faceMasks");
        }

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        if (!currentEffectsStyles.current[type][videoId].faceMasks) {
          return;
        }

        const iconSrc =
          faceMasksEffects[
            currentEffectsStyles.current[type][videoId].faceMasks.style
          ][
            currentEffectsStyles.current[type][videoId].faceMasks.threeDim
              ? userStreamEffects.current[type][videoId].faceMasks
                ? "threeDimOffIcon"
                : "threeDimIcon"
              : userStreamEffects.current[type][videoId].faceMasks
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
      className='flex items-center justify-center w-10 aspect-square'
      defaultDataValue={
        currentEffectsStyles.current[type][videoId].faceMasks?.style
      }
      hoverTimeoutDuration={750}
      disabled={effectsDisabled}
    />
  );
}
