import React, { useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import { PostProcessEffectTypes } from "../../../../universal/effectsTypeConstant";
import FgImageElement from "../fgImageElement/FgImageElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import { postProcessEffectsChoices } from "./typeConstant";
import LazyScrollingContainer from "../lazyScrollingContainer/LazyScrollingContainer";

export default function BabylonPostProcessEffectsButton({
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
    style: PostProcessEffectTypes;
  };
  clickFunctionCallback?: () => Promise<void>;
  holdFunctionCallback?: (effectType: PostProcessEffectTypes) => Promise<void>;
}) {
  const [_, setRerender] = useState(0);
  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const postProcessEffectsContainerRef = useRef<HTMLDivElement>(null);

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
      !target.dataset.postProcessEffectsButtonValue
    ) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .postProcessEffectsButtonValue as PostProcessEffectTypes;

    if (effectsStyles.style !== effectType || !streamEffects) {
      if (holdFunctionCallback) await holdFunctionCallback(effectType);
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  return (
    <FgButton
      className="flex !aspect-square h-full items-center justify-center rounded-full border-2 border-fg-white hover:border-fg-red-light"
      clickFunction={clickFunction}
      contentFunction={() => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          style={{
            width: "90%",
            height: "90%",
            fill: "#f2f2f2",
            transform: streamEffects ? "rotate(30deg)" : "rotate(0deg)",
            transition: "transform 0.2s linear",
          }}
        >
          <path
            d="M 48.69375,35.75 H 14.85 Q 18.05625,27.55625 24.64688,21.67812 31.2375,15.8 39.7875,13.425 l 10.925,18.7625 q 0.7125,1.1875 0,2.375 Q 50,35.75 48.69375,35.75 Z m 17.1,5.9375 q -0.7125,1.1875 -2.01875,1.1875 -1.30625,0 -2.01875,-1.1875 L 44.775,12.475 Q 46.08125,12.2375 47.3875,12.11875 48.69375,12 50,12 57.8375,12 64.60625,14.96875 71.375,17.9375 76.6,22.925 Z M 86.8125,59.5 H 65.08125 q -1.30625,0 -2.07812,-1.1875 -0.77188,-1.1875 -0.0594,-2.375 L 79.92498,26.725 q 3.8,4.86875 5.9375,10.74687 2.1375,5.87813 2.1375,12.52813 0,2.49375 -0.29687,4.80937 Q 87.40623,57.125 86.81248,59.5 Z m -26.6,27.075 -10.80625,-18.7625 q -0.7125,-1.1875 0.0594,-2.375 Q 50.23752,64.25 51.54377,64.25 H 85.15 Q 81.94375,72.44375 75.35313,78.32187 68.7625,84.2 60.2125,86.575 Z M 50,88 Q 42.1625,88 35.39375,85.03125 28.625,82.0625 23.4,77.075 L 34.20625,58.3125 q 0.7125,-1.1875 2.01875,-1.1875 1.30625,0 2.01875,1.1875 L 55.225,87.525 Q 53.91875,87.7625 52.67188,87.88125 51.425,88 50,88 Z M 20.075,73.275 Q 16.275,68.40625 14.1375,62.52812 12,56.65 12,50 12,47.50625 12.29688,45.19062 12.59375,42.875 13.1875,40.5 h 21.73125 q 1.30625,0 2.07813,1.1875 0.77187,1.1875 0.0594,2.375 z M 50,50 Z m 0,47.5 q 9.7375,0 18.40625,-3.74063 Q 77.075,90.01875 83.54688,83.54687 90.01875,77.075 93.75938,68.40625 97.5,59.7375 97.5,50 97.5,40.14375 93.75938,31.53437 90.01875,22.925 83.54688,16.45312 77.075,9.98125 68.40625,6.24062 59.7375,2.5 50,2.5 40.14375,2.5 31.53438,6.24062 22.925,9.98125 16.45313,16.45312 9.98125,22.925 6.24063,31.53437 2.5,40.14375 2.5,50 2.5,59.7375 6.24063,68.40625 9.98125,77.075 16.45313,83.54687 22.925,90.01875 31.53438,93.75937 40.14375,97.5 50,97.5 Z"
            strokeWidth={0.11875}
          />
        </svg>
      )}
      holdFunction={holdFunction}
      holdContent={
        <LazyScrollingContainer
          externalRef={postProcessEffectsContainerRef}
          className="small-vertical-scroll-bar mb-4 grid max-h-48 w-60 grid-cols-3 gap-x-2 gap-y-2 overflow-y-auto rounded-md border-3 border-fg-black-45 bg-fg-tone-black-1 py-3 pl-3 pr-1 shadow-lg"
          items={[
            ...Object.entries(postProcessEffectsChoices).map(
              ([postProcessEffect, choice]) => (
                <FgButton
                  key={postProcessEffect}
                  className="flex aspect-square w-full items-center justify-center"
                  contentFunction={() => (
                    <div
                      className={`${
                        postProcessEffect === effectsStyles.style
                          ? "border-3 border-fg-red-light border-opacity-100"
                          : ""
                      } flex h-full w-full items-center justify-center rounded border-2 border-fg-white hover:border-3 hover:border-fg-red-light`}
                      onClick={(event) => {
                        holdFunction(event as unknown as PointerEvent);
                      }}
                      data-post-process-effects-button-value={postProcessEffect}
                    >
                      <FgImageElement
                        src={choice.image}
                        srcLoading={choice.imageSmall}
                        alt={postProcessEffect}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                        data-post-process-effects-button-value={
                          postProcessEffect
                        }
                      />
                    </div>
                  )}
                  hoverContent={
                    <FgHoverContentStandard content={choice.label} />
                  }
                  scrollingContainerRef={postProcessEffectsContainerRef}
                  options={{
                    hoverTimeoutDuration: 750,
                  }}
                />
              ),
            ),
          ]}
        />
      }
      hoverContent={<FgHoverContentStandard content="Camera effects" />}
      closeHoldToggle={closeHoldToggle}
      setCloseHoldToggle={setCloseHoldToggle}
      scrollingContainerRef={scrollingContainerRef}
      options={{
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
        holdKind: "toggle",
      }}
    />
  );
}
