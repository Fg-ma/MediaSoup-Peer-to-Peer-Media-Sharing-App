import React, { useRef, useState } from "react";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import { BeardsEffectTypes } from "../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgImageElement from "../../../../fgElements/fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import LowerImageController from "../../lowerImageControls/LowerImageController";
import { beardsEffects, beardsLabels } from "./typeConstant";

export default function BeardsButton({
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
  const beardsContainerRef = useRef<HTMLDivElement>(null);

  const streamEffects = userStreamEffects.current.image[imageId].beards;
  const effectsStyles = userEffectsStyles.current.image[imageId].beards;

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    await lowerImageController.handleImageEffect("beards", false);

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.imageEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .imageEffectsButtonValue as BeardsEffectTypes;
    if (
      effectType in beardsEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      effectsStyles.style = effectType;

      await lowerImageController.handleImageEffect("beards", streamEffects);
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

        if (beardsEffects[effectsStyles.style].icon) {
          const iconSrc =
            beardsEffects[effectsStyles.style][
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
            beardsEffects[effectsStyles.style][
              streamEffects ? "imageOff" : "image"
            ];

          const imageLoadingSrc =
            beardsEffects[effectsStyles.style][
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
          ref={beardsContainerRef}
          className='grid border overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
        >
          {Object.entries(beardsEffects).map(([beard, effect]) => (
            <FgButton
              key={beard}
              contentFunction={() => (
                <div
                  className={`${
                    beard === effectsStyles.style
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
                  data-image-effects-button-value={beard}
                >
                  <FgImageElement
                    src={effect.image}
                    srcLoading={effect.imageSmall}
                    alt={beard}
                    style={{ width: "2.75rem", height: "2.75rem" }}
                    data-image-effects-button-value={beard}
                  />
                </div>
              )}
              hoverContent={
                <FgHoverContentStandard
                  content={beardsLabels[beard as BeardsEffectTypes]}
                />
              }
              scrollingContainerRef={beardsContainerRef}
              options={{
                hoverZValue: 999999999999999,
                hoverTimeoutDuration: 750,
              }}
            />
          ))}
        </div>
      }
      hoverContent={<FgHoverContentStandard content='Beards' />}
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
