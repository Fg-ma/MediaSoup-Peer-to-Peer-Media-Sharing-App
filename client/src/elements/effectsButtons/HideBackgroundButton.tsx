import React, { useRef, useState } from "react";
import { HideBackgroundEffectTypes } from "../../context/effectsContext/typeConstant";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import FgImageElement from "../fgImageElement/FgImageElement";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";
import LazyScrollingContainer from "../lazyScrollingContainer/LazyScrollingContainer";
import { backgroundChoices, hideBackgroundLabels } from "./typeConstant";
import ColorPickerButton from "../colorPickerButton/ColorPickerButton";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const hideBackgroundIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/hideBackgroundIcon.svg";
const hideBackgroundOffIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/hideBackgroundOffIcon.svg";

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
    effectType: HideBackgroundEffectTypes
  ) => Promise<void>;
  acceptColorCallback?: (color: string) => Promise<void>;
}) {
  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const hideBackgroundContainerRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef("#d40213");

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

  return (
    <div className='flex w-max items-center justify-center'>
      <FgButton
        clickFunction={clickFunction}
        contentFunction={() => {
          return (
            <FgSVG
              src={streamEffects ? hideBackgroundOffIcon : hideBackgroundIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: "white" },
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
            className='grid border overflow-y-auto small-vertical-scroll-bar max-h-48 mb-4 grid-cols-3 w-60 gap-x-1 gap-y-1 p-2 border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'
            items={[
              <div className='flex w-full h-full items-center justify-center'>
                <div
                  className='border-3 border-white border-opacity-75 rounded'
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
                    className='flex w-full aspect-square items-center justify-center'
                    contentFunction={() => (
                      <div
                        className={`${
                          background === effectsStyles.style
                            ? "border-fg-secondary border-3 border-opacity-100"
                            : ""
                        } border-white flex items-center justify-center w-full h-full hover:border-fg-secondary rounded border-2 hover:border-3 border-opacity-75`}
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
                      hoverZValue: 999999999999999,
                      hoverTimeoutDuration: 750,
                    }}
                  />
                )
              ),
            ]}
          />
        }
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
      <ColorPickerButton
        className='min-w-8 w-8 mx-1'
        scrollingContainerRef={scrollingContainerRef}
        handleAcceptColorCallback={handleAcceptColorCallback}
        externalColorRef={colorRef}
        disabled={effectsDisabled}
      />
    </div>
  );
}
