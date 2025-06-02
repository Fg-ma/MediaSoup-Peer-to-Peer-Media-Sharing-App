import React, { useRef, useState } from "react";
import { PetsEffectTypes } from "../../../../universal/effectsTypeConstant";
import FgButton from "..//fgButton/FgButton";
import FgSVGElement from "../fgSVGElement/FgSVGElement";
import FgImageElement from "../fgImageElement/FgImageElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import { petsEffects, petsLabels } from "./typeConstant";
import LazyScrollingContainer from "../lazyScrollingContainer/LazyScrollingContainer";

export default function PetsButton({
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
  streamEffects,
  effectsStyles,
  clickFunctionCallback,
  holdFunctionCallback,
}: {
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  streamEffects: boolean;
  effectsStyles: {
    style: PetsEffectTypes;
  };
  clickFunctionCallback?: () => Promise<void>;
  holdFunctionCallback?: (effectType: PetsEffectTypes) => Promise<void>;
}) {
  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [_, setRerender] = useState(false);
  const petsContainerRef = useRef<HTMLDivElement>(null);

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => !prev);

    if (clickFunctionCallback) await clickFunctionCallback();

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.petsEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset.petsEffectsButtonValue as PetsEffectTypes;
    if (
      effectType in petsEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      if (holdFunctionCallback) await holdFunctionCallback(effectType);
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  return (
    <FgButton
      className="flex !aspect-square h-full items-center justify-center rounded-full border-2 border-fg-white hover:border-fg-red-light"
      clickFunction={clickFunction}
      holdFunction={holdFunction}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        if (petsEffects[effectsStyles.style].icon) {
          const iconSrc =
            petsEffects[effectsStyles.style][
              streamEffects ? "iconOff" : "icon"
            ];

          if (iconSrc) {
            return (
              <FgSVGElement
                src={iconSrc}
                className="flex h-full w-full items-center justify-center"
                attributes={[
                  { key: "width", value: "90%" },
                  { key: "height", value: "90%" },
                  { key: "fill", value: "#f2f2f2" },
                ]}
                data-pets-effects-button-value={effectsStyles.style}
              />
            );
          }
        } else {
          const imageSrc =
            petsEffects[effectsStyles.style][
              streamEffects ? "imageOff" : "image"
            ];

          const imageLoadingSrc =
            petsEffects[effectsStyles.style][
              streamEffects ? "imageOffSmall" : "imageSmall"
            ];

          if (imageSrc) {
            return (
              <FgImageElement
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles.style}
                style={{ width: "90%", height: "90%" }}
                data-pets-effects-button-value={effectsStyles.style}
              />
            );
          }
        }
      }}
      holdContent={
        <LazyScrollingContainer
          externalRef={petsContainerRef}
          className="small-vertical-scroll-bar mb-4 grid max-h-48 w-60 grid-cols-3 gap-x-1 gap-y-1 overflow-y-auto rounded-md border border-fg-white bg-fg-tone-black-1 p-2 shadow-lg"
          items={[
            ...Object.entries(petsEffects).map(([pet, effect]) => (
              <FgButton
                key={pet}
                className="flex aspect-square w-full items-center justify-center"
                contentFunction={() => (
                  <div
                    className={`${
                      pet === effectsStyles.style
                        ? "border-3 border-fg-red-light border-opacity-100"
                        : ""
                    } ${effect.flipped && "scale-x-[-1]"} ${
                      effect.bgColor === "white" &&
                      "border-fg-black-35 bg-fg-white"
                    } ${
                      effect.bgColor === "black" && "border-fg-white"
                    } flex h-full w-full items-center justify-center rounded border-2 hover:border-3 hover:border-fg-red-light`}
                    onClick={(event) => {
                      holdFunction(event as unknown as PointerEvent);
                    }}
                    data-pets-effects-button-value={pet}
                  >
                    <FgImageElement
                      src={effect.image}
                      srcLoading={effect.imageSmall}
                      alt={pet}
                      style={{ width: "100%", height: "100%" }}
                      data-pets-effects-button-value={pet}
                    />
                  </div>
                )}
                hoverContent={
                  <FgHoverContentStandard
                    content={petsLabels[pet as PetsEffectTypes]}
                  />
                }
                scrollingContainerRef={petsContainerRef}
                options={{
                  hoverTimeoutDuration: 750,
                }}
              />
            )),
          ]}
        />
      }
      hoverContent={<FgHoverContentStandard content="Pets" />}
      closeHoldToggle={closeHoldToggle}
      setCloseHoldToggle={setCloseHoldToggle}
      scrollingContainerRef={scrollingContainerRef}
      options={{
        defaultDataValue: effectsStyles?.style,
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
        holdKind: "toggle",
      }}
    />
  );
}
