import React, { useEffect, useRef, useState } from "react";
import { HideBackgroundEffectTypes } from "../../../../universal/effectsTypeConstant";
import FgButton from "../fgButton/FgButton";
import FgSVGElement from "../fgSVGElement/FgSVGElement";
import FgImageElement from "../fgImageElement/FgImageElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import LazyScrollingContainer from "../lazyScrollingContainer/LazyScrollingContainer";
import { backgroundChoices, hideBackgroundLabels } from "./typeConstant";
import ColorPickerButton from "../colorPickerButton/ColorPickerButton";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const hideBackgroundIcon =
  nginxAssetServerBaseUrl + "svgs/visualEffects/hideBackgroundIcon.svg";
const hideBackgroundOffIcon =
  nginxAssetServerBaseUrl + "svgs/visualEffects/hideBackgroundOffIcon.svg";

export default function HideBackgroundButton({
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
  streamEffects,
  effectsStyles,
  clickFunctionCallback,
  holdFunctionCallback,
  acceptColorCallback,
}: {
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  streamEffects: boolean;
  effectsStyles: {
    style: HideBackgroundEffectTypes;
    color: string;
  };
  clickFunctionCallback?: () => Promise<void>;
  holdFunctionCallback?: (
    effectType: HideBackgroundEffectTypes,
  ) => Promise<void>;
  acceptColorCallback?: (color: string) => Promise<void>;
}) {
  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const hideBackgroundContainerRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef(effectsStyles.color);

  const [_, setRerender] = useState(false);

  const clickFunction = async () => {
    setEffectsDisabled(true);

    if (clickFunctionCallback) await clickFunctionCallback();

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (
      !effectsStyles ||
      !target ||
      !target.dataset.hideBackgroundEffectsButtonValue
    ) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .hideBackgroundEffectsButtonValue as HideBackgroundEffectTypes;

    if (effectsStyles.style !== effectType || !streamEffects) {
      if (holdFunctionCallback) await holdFunctionCallback(effectType);
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  const handleAcceptColorCallback = async () => {
    setEffectsDisabled(true);

    if (acceptColorCallback) await acceptColorCallback(colorRef.current);

    setEffectsDisabled(false);
  };

  useEffect(() => {
    colorRef.current = effectsStyles.color;
    setRerender((prev) => !prev);
  }, [effectsStyles.color]);

  return (
    <>
      <FgButton
        className="flex !aspect-square h-full items-center justify-center rounded-full border-2 border-fg-white hover:border-fg-red-light"
        clickFunction={clickFunction}
        contentFunction={() => {
          return (
            <FgSVGElement
              src={streamEffects ? hideBackgroundOffIcon : hideBackgroundIcon}
              className="flex h-full w-full items-center justify-center"
              attributes={[
                { key: "width", value: "70%" },
                { key: "height", value: "70%" },
                { key: "fill", value: "#f2f2f2" },
              ]}
            />
          );
        }}
        hoverContent={
          <FgHoverContentStandard
            content={streamEffects ? "Reveal background" : "Hide background"}
          />
        }
        holdFunction={holdFunction}
        holdContent={
          <LazyScrollingContainer
            externalRef={hideBackgroundContainerRef}
            className="small-vertical-scroll-bar mb-4 grid max-h-48 w-60 grid-cols-3 gap-x-1 gap-y-1 overflow-y-auto rounded-md border border-fg-white bg-fg-tone-black-1 p-2 shadow-lg"
            items={[
              <div className="flex h-full w-full items-center justify-center">
                <div
                  className="rounded border-3 border-fg-white"
                  style={{
                    backgroundColor: colorRef.current,
                    width: "100%",
                    height: "100%",
                  }}
                  onClick={(event) => {
                    holdFunction(event as unknown as PointerEvent);
                  }}
                  data-hide-background-effects-button-value={"color"}
                ></div>
              </div>,
              ...Object.entries(backgroundChoices).map(
                ([background, choice]) => (
                  <FgButton
                    key={background}
                    className="flex aspect-square w-full items-center justify-center"
                    contentFunction={() => (
                      <div
                        className={`${
                          background === effectsStyles.style
                            ? "border-3 border-fg-red-light border-opacity-100"
                            : ""
                        } flex h-full w-full items-center justify-center rounded border-2 border-fg-white hover:border-3 hover:border-fg-red-light`}
                        onClick={(event) => {
                          holdFunction(event as unknown as PointerEvent);
                        }}
                        data-hide-background-effects-button-value={background}
                      >
                        <FgImageElement
                          src={choice.image}
                          srcLoading={choice.imageSmall}
                          alt={background}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                          data-hide-background-effects-button-value={background}
                        />
                      </div>
                    )}
                    hoverContent={
                      <FgHoverContentStandard
                        content={
                          hideBackgroundLabels[
                            background as HideBackgroundEffectTypes
                          ]
                        }
                      />
                    }
                    scrollingContainerRef={hideBackgroundContainerRef}
                    options={{
                      hoverTimeoutDuration: 750,
                    }}
                  />
                ),
              ),
            ]}
          />
        }
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
      <ColorPickerButton
        className="h-full"
        scrollingContainerRef={scrollingContainerRef}
        handleAcceptColorCallback={handleAcceptColorCallback}
        externalColorRef={colorRef}
        defaultColor={colorRef.current}
        disabled={effectsDisabled}
      />
    </>
  );
}
