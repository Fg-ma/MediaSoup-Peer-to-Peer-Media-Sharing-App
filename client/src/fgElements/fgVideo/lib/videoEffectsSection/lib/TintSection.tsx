import React, { useState, useRef, useEffect, Suspense } from "react";
import { useEffectsContext } from "../../../../../context/effectsContext/EffectsContext";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
import FgLowerVideoController from "../../fgLowerVideoControls/lib/FgLowerVideoController";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tintIcon = nginxAssetSeverBaseUrl + "svgs/visualEffects/tintIcon.svg";
const tintOffIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/tintOffIcon.svg";

const ColorPicker = React.lazy(() => import("./ColorPicker"));

export default function TintSection({
  videoId,
  fgLowerVideoController,
  tintColor,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  videoId: string;
  fgLowerVideoController: FgLowerVideoController;
  tintColor: React.MutableRefObject<string>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userStreamEffects } = useEffectsContext();

  const [color, setColor] = useState("#F56114");
  const [_, setRerender] = useState(0);
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);

  const streamEffects = userStreamEffects.current.video[videoId].video.tint;

  const handleColorPicker = () => {
    setTempColor(tintColor.current);
    setIsColorPicker((prev) => !prev);
  };

  useEffect(() => {
    setRerender((prev) => prev + 1);
  }, [streamEffects]);

  return (
    <div className='w-max flex'>
      <FgButton
        clickFunction={async () => {
          setEffectsDisabled(true);
          setRerender((prev) => prev + 1);

          await fgLowerVideoController.handleVideoEffect("tint", false);

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
          className='w-6 h-6 m-2 border border-white rounded'
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
                fgLowerVideoController.handleVideoEffect("tint", streamEffects);
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
