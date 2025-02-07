import React, { useRef, useState } from "react";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import { HatsEffectTypes } from "../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgImageElement from "../../../../fgElements/fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import LowerImageController from "../../lowerImageControls/LowerImageController";
import { hatsEffects, hatsLabels } from "./typeConstant";

export default function HatsButton({
  imageId,
  lowerImageController,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  imageId: string;
  lowerImageController: LowerImageController;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userEffectsStyles, userStreamEffects } = useEffectsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [_, setRerender] = useState(0);
  const hatsContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = userStreamEffects.current.image[imageId].hats;
  const effectsStyles = userEffectsStyles.current.image[imageId].hats;

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    await lowerImageController.handleImageEffect("hats", false);

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.imageEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .imageEffectsButtonValue as HatsEffectTypes;
    if (
      effectType in hatsEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      effectsStyles.style = effectType;

      await lowerImageController.handleImageEffect("hats", streamEffects);
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  return (
    <FgButton
      clickFunction={clickFunction}
      holdFunction={holdFunction}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        if (hatsEffects[effectsStyles.style].icon) {
          const iconSrc =
            hatsEffects[effectsStyles.style][
              streamEffects ? "iconOff" : "icon"
            ];

          if (iconSrc) {
            return (
              <FgSVG
                src={iconSrc}
                attributes={[
                  { key: "width", value: "95%" },
                  { key: "height", value: "95%" },
                ]}
                data-image-effects-button-value={effectsStyles.style}
              />
            );
          }
        } else {
          const imageSrc =
            hatsEffects[effectsStyles.style][
              streamEffects ? "imageOff" : "image"
            ];

          const imageLoadingSrc =
            hatsEffects[effectsStyles.style][
              streamEffects ? "imageOffSmall" : "imageSmall"
            ];

          if (imageSrc) {
            return (
              <FgImageElement
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles.style}
                style={{ width: "90%", height: "90%" }}
                data-image-effects-button-value={effectsStyles.style}
              />
            );
          }
        }
      }}
      holdContent={
        <div
          ref={hatsContainerRef}
          className='grid border overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
        >
          {Object.entries(hatsEffects).map(([hat, effect]) => (
            <FgButton
              key={hat}
              contentFunction={() => (
                <div
                  className={`${
                    hat === effectsStyles.style
                      ? "border-fg-secondary border-3 border-opacity-100"
                      : ""
                  } ${effect.flipped && "scale-x-[-1]"} ${
                    effect.bgColor === "white" && "bg-white border-fg-black-35"
                  } ${
                    effect.bgColor === "black" && "border-white"
                  } flex items-center justify-center w-14 min-w-14 aspect-square hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                  onClick={(event) => {
                    holdFunction(event as unknown as PointerEvent);
                  }}
                  data-image-effects-button-value={hat}
                >
                  <FgImageElement
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={hat}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-image-effects-button-value={hat}
                  />
                </div>
              )}
              hoverContent={
                <FgHoverContentStandard
                  content={hatsLabels[hat as HatsEffectTypes]}
                />
              }
              scrollingContainerRef={hatsContainerRef}
              options={{
                hoverZValue: 999999999999999,
                hoverTimeoutDuration: 750,
              }}
            />
          ))}
        </div>
      }
      hoverContent={<FgHoverContentStandard content='Hats' />}
      closeHoldToggle={closeHoldToggle}
      setCloseHoldToggle={setCloseHoldToggle}
      scrollingContainerRef={scrollingContainerRef}
      className='flex items-center justify-center min-w-10 w-10 aspect-square'
      options={{
        defaultDataValue: effectsStyles?.style,
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
        holdKind: "toggle",
      }}
    />
  );
}
