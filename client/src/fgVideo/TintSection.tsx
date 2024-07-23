import React, { useEffect, useRef, useState } from "react";
import ColorPicker from "./ColorPicker";
import tintIcon from "../../public/svgs/tintIcon.svg";
import { EffectTypes, useStreamsContext } from "../context/StreamsContext";

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
      <button
        onClick={() => {
          handleEffectChange("tint");
          setButtonState(
            userStreamEffects.current.tint[type]?.[videoId]
              ? "inActive"
              : "active"
          );
        }}
        className='flex items-center justify-center w-10 aspect-square'
      >
        {userStreamEffects.current.tint[type]?.[videoId] ? (
          <svg
            viewBox='0 0 8.4666665 8.4666666'
            version='1.1'
            id='svg1'
            xmlns='http://www.w3.org/2000/svg'
            style={{
              width: "83.333333%",
              height: "83.333333%",
            }}
          >
            <defs id='defs1'>
              <path id='path-effect8' />
              <path id='path-effect7' offset='-2.229583' />
            </defs>
            <g id='layer1'>
              <path
                style={{
                  fill: "none",
                  stroke: "white",
                  strokeWidth: "0.255202",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeDasharray: "none",
                  strokeOpacity: 1,
                }}
                d='M 1.0452881,2.1608049 V 6.3058618 H 7.4213786 V 4.8603756 a 2.695588,2.695588 0 0 0 0,-0.00331 2.695588,2.695588 0 0 0 -2.695583,-2.6955829 2.695588,2.695588 0 0 0 -0.002,0 v -6.646e-4 z'
                id='path2'
              />
              <path
                id='path1'
                style={{
                  fill: color,
                  stroke: "white",
                  strokeWidth: "0.255202",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeDasharray: "none",
                  strokeOpacity: 1,
                }}
                d='M 1.4257528 2.5419637 L 1.4257528 4.9583537 L 1.4257528 5.1294027 L 1.4273031 5.130953 L 2.210201 5.1304362 L 2.2107178 5.9148844 L 2.2158854 5.9200521 L 2.4825358 5.9200521 L 7.036263 5.9200521 L 7.036263 4.7423462 A 2.3718405 2.1969058 0 0 0 7.036263 4.7418294 A 2.3718405 2.1969058 0 0 0 7.036263 4.7413127 A 2.3718405 2.1969058 0 0 0 7.036263 4.7407959 A 2.3718405 2.1969058 0 0 0 7.036263 4.7402791 A 2.3718405 2.1969058 0 0 0 7.036263 4.7397624 A 2.3718405 2.1969058 0 0 0 4.6643148 2.5424805 A 2.3718405 2.1969058 0 0 0 4.6622477 2.5424805 L 4.6622477 2.5419637 L 1.4257528 2.5419637 z'
              />
              <path
                style={{
                  fill: "none",
                  stroke: "white",
                  strokeWidth: "0.255202",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeDasharray: "none",
                  strokeOpacity: 1,
                }}
                d='M 1.4227569,5.1286893 2.2079175,5.9134273 2.2074803,5.1283185 Z'
                id='path10-8'
              />
            </g>
          </svg>
        ) : (
          <img
            src={tintIcon}
            alt='icon'
            className='w-5/6 h-5/6 fill-white stroke-white'
          />
        )}
      </button>
      <div className='flex items-center justify-center w-10 aspect-square'>
        <button
          ref={colorPickerBtnRef}
          className='w-6 aspect-square border bottom-2 border-white rounded'
          style={{ backgroundColor: tempColor }}
          onClick={handleColorPicker}
        ></button>
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
