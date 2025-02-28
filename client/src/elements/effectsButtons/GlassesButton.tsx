import React, { useRef, useState } from "react";
import { GlassesEffectTypes } from "../../context/effectsContext/typeConstant";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import FgImageElement from "../fgImageElement/FgImageElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import { glassesEffects, glassesLabels } from "./typeConstant";
import LazyScrollingContainer from "../lazyScrollingContainer/LazyScrollingContainer";

export default function GlassesButton({
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
    style: GlassesEffectTypes;
  };
  clickFunctionCallback?: () => Promise<void>;
  holdFunctionCallback?: (effectType: GlassesEffectTypes) => Promise<void>;
}) {
  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [_, setRerender] = useState(0);
  const glassesContainerRef = useRef<HTMLDivElement>(null);

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    if (clickFunctionCallback) await clickFunctionCallback();

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (
      !effectsStyles ||
      !target ||
      !target.dataset.glassesEffectsButtonValue
    ) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .glassesEffectsButtonValue as GlassesEffectTypes;
    if (
      effectType in glassesEffects &&
      (effectsStyles.style !== effectType || !streamEffects)
    ) {
      if (holdFunctionCallback) await holdFunctionCallback(effectType);
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  return (
    <FgButton
      className='flex items-center justify-center h-full !aspect-square border-2 border-fg-white border-opacity-90 rounded-full hover:border-fg-red-light'
      clickFunction={clickFunction}
      holdFunction={holdFunction}
      contentFunction={() => {
        if (!effectsStyles) {
          return;
        }

        if (glassesEffects[effectsStyles.style].icon) {
          const iconSrc =
            glassesEffects[effectsStyles.style][
              streamEffects ? "iconOff" : "icon"
            ];

          if (iconSrc) {
            return (
              <FgSVG
                src={iconSrc}
                className='flex h-full w-full items-center justify-center'
                attributes={[
                  { key: "width", value: "90%" },
                  { key: "height", value: "90%" },
                  { key: "fill", value: "#f2f2f2" },
                ]}
                data-glasses-effects-button-value={effectsStyles.style}
              />
            );
          }
        } else {
          const imageSrc =
            glassesEffects[effectsStyles.style][
              streamEffects ? "imageOff" : "image"
            ];

          const imageLoadingSrc =
            glassesEffects[effectsStyles.style][
              streamEffects ? "imageOffSmall" : "imageSmall"
            ];

          if (imageSrc) {
            return (
              <FgImageElement
                src={imageSrc}
                srcLoading={imageLoadingSrc}
                alt={effectsStyles?.style}
                style={{ width: "90%", height: "90%" }}
                data-glasses-effects-button-value={effectsStyles.style}
              />
            );
          }
        }
      }}
      holdContent={
        <LazyScrollingContainer
          externalRef={glassesContainerRef}
          className='grid border overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid-cols-3 w-60 gap-x-1 gap-y-1 p-2 border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
          items={[
            ...Object.entries(glassesEffects).map(([glasses, effect]) => (
              <FgButton
                key={glasses}
                className='flex w-full aspect-square items-center justify-center'
                contentFunction={() => (
                  <div
                    className={`${
                      glasses === effectsStyles.style
                        ? "border-fg-secondary border-3 border-opacity-100"
                        : ""
                    } ${effect.flipped && "scale-x-[-1]"} ${
                      effect.bgColor === "white" &&
                      "bg-white border-fg-black-35"
                    } ${
                      effect.bgColor === "black" && "border-white"
                    } flex items-center justify-center w-full h-full hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
                    onClick={(event) => {
                      holdFunction(event as unknown as PointerEvent);
                    }}
                    data-glasses-effects-button-value={glasses}
                  >
                    <FgImageElement
                      src={effect.image}
                      srcLoading={effect.imageSmall}
                      alt={glasses}
                      style={{ width: "100%", height: "100%" }}
                      data-glasses-effects-button-value={glasses}
                    />
                  </div>
                )}
                hoverContent={
                  <FgHoverContentStandard
                    content={glassesLabels[glasses as GlassesEffectTypes]}
                  />
                }
                scrollingContainerRef={glassesContainerRef}
                options={{
                  hoverZValue: 999999999999999,
                  hoverTimeoutDuration: 750,
                }}
              />
            )),
          ]}
        />
      }
      hoverContent={<FgHoverContentStandard content='Glasses' />}
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
