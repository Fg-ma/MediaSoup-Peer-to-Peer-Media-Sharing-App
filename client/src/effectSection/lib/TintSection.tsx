import React, { useState, useRef } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import ColorPicker from "./ColorPicker";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  AudioEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import tintIcon from "../../../public/svgs/tintIcon.svg";
import tintOffIcon from "../../../public/svgs/tintOffIcon.svg";

export default function TintSection({
  videoId,
  type,
  handleEffectChange,
  tintColor,
  effectsDisabled,
  setEffectsDisabled,
}: {
  videoId: string;
  type: "camera" | "screen";
  handleEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes | AudioEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  tintColor: React.MutableRefObject<string>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userStreamEffects } = useStreamsContext();

  const [color, setColor] = useState("#F56114");
  const [buttonState, setButtonState] = useState("");
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);

  const handleColorPicker = () => {
    setTempColor(tintColor.current);
    setIsColorPicker((prev) => !prev);
  };

  return (
    <div className='w-max flex'>
      <FgButton
        clickFunction={async () => {
          setEffectsDisabled(true);
          setButtonState(
            userStreamEffects.current[type][videoId].tint
              ? "inActive"
              : "active"
          );

          await handleEffectChange("tint");

          setEffectsDisabled(false);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={
                userStreamEffects.current[type][videoId].tint
                  ? tintOffIcon
                  : tintIcon
              }
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: tintColor.current, id: "tintColorPath" },
              ]}
            />
          );
        }}
        hoverContent={
          <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Tint
          </div>
        }
        className='flex items-center justify-center w-10 aspect-square'
        hoverTimeoutDuration={750}
        disabled={effectsDisabled}
      />
      <div className='flex items-center justify-center w-10 aspect-square'>
        <FgButton
          externalRef={colorPickerBtnRef}
          clickFunction={() => handleColorPicker()}
          hoverContent={
            <div className='mb-6 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Color picker
            </div>
          }
          className='w-6 h-6 m-2 border border-white rounded'
          style={{ backgroundColor: tempColor }}
          hoverTimeoutDuration={750}
          disabled={effectsDisabled}
        />
        {isColorPicker && (
          <ColorPicker
            videoId={videoId}
            type={type}
            color={color}
            setColor={setColor}
            tempColor={tempColor}
            setTempColor={setTempColor}
            setIsColorPicker={setIsColorPicker}
            tintColor={tintColor}
            colorPickerBtnRef={colorPickerBtnRef}
            handleEffectChange={handleEffectChange}
          />
        )}
      </div>
    </div>
  );
}
