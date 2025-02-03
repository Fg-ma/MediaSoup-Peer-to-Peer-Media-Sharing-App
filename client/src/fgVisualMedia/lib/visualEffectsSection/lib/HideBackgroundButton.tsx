import React, { useRef, useState, Suspense } from "react";
import { useMediaContext } from "../../../../context/mediaContext/MediaContext";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import {
  HideBackgroundEffectTypes,
  PostProcessEffects,
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgImageElement from "../../../../fgElements/fgImageElement/FgImageElement";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import LazyScrollingContainer from "../../../../fgElements/lazyScrollingContainer/LazyScrollingContainer";
import { backgroundChoices, hideBackgroundLabels } from "./typeConstant";

const ColorPicker = React.lazy(() => import("./ColorPicker"));

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const hideBackgroundIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/hideBackgroundIcon.svg";
const hideBackgroundOffIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/hideBackgroundOffIcon.svg";

export default function HideBackgroundButton({
  username,
  instance,
  type,
  visualMediaId,
  isUser,
  handleVisualEffectChange,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  username: string;
  instance: string;
  type: "camera";
  visualMediaId: string;
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean,
    hideBackgroundStyle?: HideBackgroundEffectTypes,
    hideBackgroundColor?: string,
    postProcessStyle?: PostProcessEffects
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userMedia } = useMediaContext();
  const {
    userEffectsStyles,
    remoteEffectsStyles,
    userStreamEffects,
    remoteStreamEffects,
  } = useEffectsContext();

  const [closeHoldToggle, setCloseHoldToggle] = useState(false);
  const [color, setColor] = useState("#F56114");
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const [_, setRerender] = useState(0);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);
  const hideBackgroundContainerRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef("#F56114");

  const streamEffects = isUser
    ? userStreamEffects.current.camera[visualMediaId].hideBackground
    : remoteStreamEffects.current[username][instance].camera[visualMediaId]
        .hideBackground;
  const effectsStyles = isUser
    ? userEffectsStyles.current[type][visualMediaId].hideBackground
    : remoteEffectsStyles.current[username][instance][type][visualMediaId]
        .hideBackground;

  const handleColorPicker = () => {
    setTempColor(colorRef.current);
    setIsColorPicker((prev) => !prev);
  };

  const clickFunction = async () => {
    setEffectsDisabled(true);
    setRerender((prev) => prev + 1);

    if (isUser) {
      userMedia.current.camera[
        visualMediaId
      ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
        effectsStyles.style
      );
    }

    await handleVisualEffectChange(
      "hideBackground",
      false,
      effectsStyles.style
    );

    setEffectsDisabled(false);
  };

  const holdFunction = async (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if (!effectsStyles || !target || !target.dataset.visualEffectsButtonValue) {
      return;
    }

    setEffectsDisabled(true);

    const effectType = target.dataset
      .visualEffectsButtonValue as HideBackgroundEffectTypes;

    if (effectsStyles.style !== effectType || !streamEffects) {
      effectsStyles.style = effectType;
      if (isUser) {
        userMedia.current.camera[
          visualMediaId
        ].babylonScene.babylonRenderLoop.swapHideBackgroundEffectImage(
          effectType
        );
      }

      await handleVisualEffectChange(
        "hideBackground",
        streamEffects,
        effectType,
        undefined
      );
    }

    setEffectsDisabled(false);
    setCloseHoldToggle(true);
  };

  const handleAcceptColorCallback = async () => {
    setEffectsDisabled(true);

    if (isUser) {
      userMedia.current.camera[
        visualMediaId
      ].babylonScene.babylonRenderLoop.swapHideBackgroundContextFillColor(
        colorRef.current
      );
    }

    if (effectsStyles.style !== "color" || !streamEffects) {
      effectsStyles.style = "color";
      effectsStyles.color = colorRef.current;

      await handleVisualEffectChange(
        "hideBackground",
        streamEffects,
        undefined,
        colorRef.current
      );
    }

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
                  data-visual-effects-button-value={"color"}
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
                        data-visual-effects-button-value={background}
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
                          data-visual-effects-button-value={background}
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
      <div className='flex items-center justify-center min-w-10 w-10 aspect-square'>
        <FgButton
          externalRef={colorPickerBtnRef}
          clickFunction={() => handleColorPicker()}
          hoverContent={<FgHoverContentStandard content='Color picker' />}
          scrollingContainerRef={scrollingContainerRef}
          className='border w-6 h-6 m-2 border-white rounded'
          style={{ backgroundColor: tempColor }}
          options={{
            hoverTimeoutDuration: 750,
            disabled: effectsDisabled,
          }}
        />
        {isColorPicker && (
          <Suspense fallback={<div>Loading...</div>}>
            <ColorPicker
              color={color}
              setColor={setColor}
              tempColor={tempColor}
              setTempColor={setTempColor}
              setIsColorPicker={setIsColorPicker}
              colorRef={colorRef}
              colorPickerBtnRef={colorPickerBtnRef}
              handleAcceptColorCallback={handleAcceptColorCallback}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
