import React, { useState, useRef } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import ColorPicker from "./ColorPicker";
import { EffectTypes, useStreamsContext } from "../../context/StreamsContext";
import tintIcon from "../../../public/svgs/tintIcon.svg";
import tintOffIcon from "../../../public/svgs/tintOffIcon.svg";

export default function TintSection({
  videoId,
  type,
  handleEffectChange,
  tintColor,
}: {
  videoId: string;
  type: "camera" | "screen";
  handleEffectChange: (effect: EffectTypes, blockStateChange?: boolean) => void;
  tintColor: React.MutableRefObject<string>;
}) {
  const { userStreamEffects } = useStreamsContext();

  const [color, setColor] = useState("#F56114");
  const colorRef = useRef("#F56114");
  const [buttonState, setButtonState] = useState("");
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);

  const handleColorPicker = () => {
    setTempColor(color);
    setIsColorPicker((prev) => !prev);
  };

  return (
    <div className='w-max flex'>
      <FgButton
        clickFunction={() => {
          handleEffectChange("tint");
          setButtonState(
            userStreamEffects.current.tint[type]?.[videoId]
              ? "inActive"
              : "active"
          );
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={
                userStreamEffects.current.tint[type]?.[videoId]
                  ? tintOffIcon
                  : tintIcon
              }
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: color, id: "tintColorPath" },
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
