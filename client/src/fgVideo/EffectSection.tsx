import React, { useState, useEffect, useRef } from "react";
import effectIcon from "../../public/svgs/effectIcon.svg";
import tintIcon from "../../public/svgs/tintIcon.svg";
import handleEffects from "./lib/handleEffects";
import { EffectTypes } from "src/context/StreamsContext";
import ColorPicker from "./ColorPicker";

export default function EffectSection({
  videoContainerRef,
  userStreamEffects,
  type,
  videoId,
  handleEffectChange,
  tintColor,
}: {
  videoContainerRef: React.RefObject<HTMLDivElement>;
  userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      webcam?:
        | {
            [webcamId: string]: boolean;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: boolean;
          }
        | undefined;
      audio?: boolean;
    };
  }>;
  type: "webcam" | "screen";
  videoId: string;
  handleEffectChange: (effect: EffectTypes, blockStateChange?: boolean) => void;
  tintColor: React.MutableRefObject<string>;
}) {
  const [isEffects, setIsEffects] = useState(false);
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [color, setColor] = useState("#F56114");
  const [tempColor, setTempColor] = useState(color);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (userStreamEffects.current.tint[type]?.[videoId]) {
      handleEffectChange("tint", true);
    }
  }, [color]);

  const handleColorPicker = () => {
    setTempColor(color);
    setIsColorPicker((prev) => !prev);
  };

  return (
    <div className='relative'>
      <button
        onClick={() =>
          handleEffects(isEffects, setIsEffects, videoContainerRef)
        }
        className='flex items-center justify-center w-10 aspect-square relative'
      >
        <img
          src={effectIcon}
          alt='icon'
          className='w-5/6 h-5/6 fill-white stroke-white'
        />
      </button>
      {isEffects && (
        <div className='absolute bottom-full left-1/2 -translate-x-1/2 w-max h-max'>
          <div className='effect-container shadow-md grid grid-cols-3'>
            <button
              onClick={() => handleEffectChange("blur")}
              className='flex items-center justify-center w-10 aspect-square'
            >
              {userStreamEffects.current.blur[type]?.[videoId] ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  height='36px'
                  viewBox='0 -960 960 960'
                  width='36px'
                  fill='white'
                >
                  <path d='M764-84 84-764q-11-11-11-28t11-28q11-11 28-11t28 11l680 680q11 11 11 28t-11 28q-11 11-28 11t-28-11Zm-364-16q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm160 0q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6ZM240-200q-17 0-28.5-11.5T200-240q0-17 11.5-28.5T240-280q17 0 28.5 11.5T280-240q0 17-11.5 28.5T240-200Zm160 0q-17 0-28.5-11.5T360-240q0-17 11.5-28.5T400-280q17 0 28.5 11.5T440-240q0 17-11.5 28.5T400-200Zm160 0q-17 0-28.5-11.5T520-240q0-17 11.5-28.5T560-280q17 0 28.5 11.5T600-240q0 17-11.5 28.5T560-200ZM400-340q-26 0-43-17t-17-43q0-26 17-43t43-17q26 0 43 17t17 43q0 26-17 43t-43 17Zm-160-20q-17 0-28.5-11.5T200-400q0-17 11.5-28.5T240-440q17 0 28.5 11.5T280-400q0 17-11.5 28.5T240-360Zm472-1-31-31q-4-20 8.5-34t30.5-14q17 0 28.5 11.5T760-400q0 18-14 30.5t-34 8.5Zm-592-19q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm720 0q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6ZM572-502l-70-70q5-21 20-34.5t38-13.5q26 0 43 17t17 43q0 23-14 38.5T572-502Zm-332-18q-17 0-28.5-11.5T200-560q0-17 11.5-28.5T240-600q17 0 28.5 11.5T280-560q0 17-11.5 28.5T240-520Zm480 0q-17 0-28.5-11.5T680-560q0-17 11.5-28.5T720-600q17 0 28.5 11.5T760-560q0 17-11.5 28.5T720-520Zm-600-20q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm720 0q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6ZM560-680q-17 0-28.5-11.5T520-720q0-17 11.5-28.5T560-760q17 0 28.5 11.5T600-720q0 17-11.5 28.5T560-680Zm-167-1-32-32q-3-20 9-33.5t30-13.5q17 0 28.5 11.5T440-720q0 18-13.5 30t-33.5 9Zm327 1q-17 0-28.5-11.5T680-720q0-17 11.5-28.5T720-760q17 0 28.5 11.5T760-720q0 17-11.5 28.5T720-680ZM400-820q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm160 0q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Z' />
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  height='36px'
                  viewBox='0 -960 960 960'
                  width='36px'
                  fill='white'
                >
                  <path d='M120-380q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm0-160q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm120 340q-17 0-28.5-11.5T200-240q0-17 11.5-28.5T240-280q17 0 28.5 11.5T280-240q0 17-11.5 28.5T240-200Zm0-160q-17 0-28.5-11.5T200-400q0-17 11.5-28.5T240-440q17 0 28.5 11.5T280-400q0 17-11.5 28.5T240-360Zm0-160q-17 0-28.5-11.5T200-560q0-17 11.5-28.5T240-600q17 0 28.5 11.5T280-560q0 17-11.5 28.5T240-520Zm0-160q-17 0-28.5-11.5T200-720q0-17 11.5-28.5T240-760q17 0 28.5 11.5T280-720q0 17-11.5 28.5T240-680Zm160 340q-25 0-42.5-17.5T340-400q0-25 17.5-42.5T400-460q25 0 42.5 17.5T460-400q0 25-17.5 42.5T400-340Zm0-160q-25 0-42.5-17.5T340-560q0-25 17.5-42.5T400-620q25 0 42.5 17.5T460-560q0 25-17.5 42.5T400-500Zm0 300q-17 0-28.5-11.5T360-240q0-17 11.5-28.5T400-280q17 0 28.5 11.5T440-240q0 17-11.5 28.5T400-200Zm0-480q-17 0-28.5-11.5T360-720q0-17 11.5-28.5T400-760q17 0 28.5 11.5T440-720q0 17-11.5 28.5T400-680Zm0 580q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm0-720q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm160 480q-25 0-42.5-17.5T500-400q0-25 17.5-42.5T560-460q25 0 42.5 17.5T620-400q0 25-17.5 42.5T560-340Zm0-160q-25 0-42.5-17.5T500-560q0-25 17.5-42.5T560-620q25 0 42.5 17.5T620-560q0 25-17.5 42.5T560-500Zm0 300q-17 0-28.5-11.5T520-240q0-17 11.5-28.5T560-280q17 0 28.5 11.5T600-240q0 17-11.5 28.5T560-200Zm0-480q-17 0-28.5-11.5T520-720q0-17 11.5-28.5T560-760q17 0 28.5 11.5T600-720q0 17-11.5 28.5T560-680Zm0 580q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm0-720q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm160 620q-17 0-28.5-11.5T680-240q0-17 11.5-28.5T720-280q17 0 28.5 11.5T760-240q0 17-11.5 28.5T720-200Zm0-160q-17 0-28.5-11.5T680-400q0-17 11.5-28.5T720-440q17 0 28.5 11.5T760-400q0 17-11.5 28.5T720-360Zm0-160q-17 0-28.5-11.5T680-560q0-17 11.5-28.5T720-600q17 0 28.5 11.5T760-560q0 17-11.5 28.5T720-520Zm0-160q-17 0-28.5-11.5T680-720q0-17 11.5-28.5T720-760q17 0 28.5 11.5T760-720q0 17-11.5 28.5T720-680Zm120 300q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Zm0-160q-8 0-14-6t-6-14q0-8 6-14t14-6q8 0 14 6t6 14q0 8-6 14t-14 6Z' />
                </svg>
              )}
            </button>
            <div className='col-span-2 border-l border-white flex'>
              <button
                onClick={() => handleEffectChange("tint")}
                className='flex items-center justify-center w-10 aspect-square'
              >
                {userStreamEffects.current.tint[type]?.[videoId] ? (
                  <svg
                    width='32'
                    height='32'
                    viewBox='0 0 8.4666665 8.4666666'
                    version='1.1'
                    id='svg1'
                    xmlns='http://www.w3.org/2000/svg'
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
                    color={color}
                    setColor={setColor}
                    tempColor={tempColor}
                    setTempColor={setTempColor}
                    setIsColorPicker={setIsColorPicker}
                    tintColor={tintColor}
                    videoId={videoId}
                    colorPickerBtnRef={colorPickerBtnRef}
                  />
                )}
              </div>
            </div>
            <div className='effect-container-trapezoid'></div>
            <div className='effect-container-tip'></div>
          </div>
        </div>
      )}
    </div>
  );
}
