import React, { useState, useRef, useEffect, Suspense } from "react";
import { useEffectsContext } from "../../../../context/effectsContext/EffectsContext";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../context/effectsContext/typeConstant";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetSeverBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const tintIcon = nginxAssetSeverBaseUrl + "svgs/visualEffects/tintIcon.svg";
const tintOffIcon =
  nginxAssetSeverBaseUrl + "svgs/visualEffects/tintOffIcon.svg";

const ColorPicker = React.lazy(() => import("./ColorPicker"));

export default function TintSection({
  username,
  instance,
  visualMediaId,
  type,
  isUser,
  handleVisualEffectChange,
  tintColor,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  username: string;
  instance: string;
  visualMediaId: string;
  type: "camera" | "screen";
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  tintColor: React.MutableRefObject<string>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userStreamEffects, remoteStreamEffects } = useEffectsContext();

  const [color, setColor] = useState("#F56114");
  const [_, setRerender] = useState(0);
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);

  const streamEffects = isUser
    ? userStreamEffects.current[type][visualMediaId].tint
    : remoteStreamEffects.current[username][instance][type][visualMediaId].tint;

  const handleColorPicker = () => {
    setTempColor(tintColor.current);
    setIsColorPicker((prev) => !prev);
  };

  if (isUser) {
    useEffect(() => {
      setRerender((prev) => prev + 1);
    }, [userStreamEffects.current[type][visualMediaId].tint]);
  }

  return (
    <div className='w-max flex'>
      <FgButton
        clickFunction={async () => {
          setEffectsDisabled(true);
          setRerender((prev) => prev + 1);

          await handleVisualEffectChange("tint");

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
                handleVisualEffectChange("tint", streamEffects);
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
