import React, { useState, useRef, useEffect, Suspense } from "react";
import FgButton from "../fgButton/FgButton";
import FgSVG from "../fgSVG/FgSVG";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tintIcon = nginxAssetSeverBaseUrl + "svgs/visualEffects/tintIcon.svg";
const tintOffIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/tintOffIcon.svg";

const ColorPicker = React.lazy(() => import("./ColorPicker"));

export default function TintSection({
  tintColor,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
  streamEffects,
  clickFunctionCallback,
  acceptColorCallback,
}: {
  tintColor: React.MutableRefObject<string>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
  streamEffects: boolean;
  clickFunctionCallback?: () => Promise<void>;
  acceptColorCallback?: () => void;
}) {
  const [color, setColor] = useState("#F56114");
  const [_, setRerender] = useState(0);
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);

  const handleColorPicker = () => {
    setTempColor(tintColor.current);
    setIsColorPicker((prev) => !prev);
  };

  useEffect(() => {
    setRerender((prev) => prev + 1);
  }, [streamEffects]);

  return (
    <div className='flex w-max'>
      <FgButton
        clickFunction={async () => {
          setEffectsDisabled(true);
          setRerender((prev) => prev + 1);

          if (clickFunctionCallback) await clickFunctionCallback();

          setEffectsDisabled(false);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={streamEffects ? tintOffIcon : tintIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: tintColor.current, id: "tintColorPath" },
              ]}
            />
          );
        }}
        hoverContent={<FgHoverContentStandard content='Tint' />}
        scrollingContainerRef={scrollingContainerRef}
        className='flex items-center justify-center min-w-10 w-10 aspect-square'
        options={{
          hoverTimeoutDuration: 750,
          disabled: effectsDisabled,
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
              colorRef={tintColor}
              colorPickerBtnRef={colorPickerBtnRef}
              handleAcceptColorCallback={() => {
                if (acceptColorCallback) acceptColorCallback();
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
