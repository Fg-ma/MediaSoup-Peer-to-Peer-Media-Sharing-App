import React, { useState, useEffect, useRef } from "react";
import tintIcon from "../../public/svgs/tintIcon.svg";
import dogEarsIcon from "../../public/svgs/dogEarsIcon.svg";
import dogEarsOffIcon from "../../public/svgs/dogEarsOffIcon.svg";
import beardIcon from "../../public/svgs/beardIcon.svg";
import beardOffIcon from "../../public/svgs/beardOffIcon.svg";
import { EffectTypes } from "src/context/StreamsContext";
import ColorPicker from "./ColorPicker";
import HoldButton from "./HoldButton";
import glassesImage1 from "../../public/assets/glasses/glasses1.png";
import glassesImage2 from "../../public/assets/glasses/glasses2.png";
import glassesImage3 from "../../public/assets/glasses/glasses3.png";
import glassesImage4 from "../../public/assets/glasses/glasses4.png";
import glassesImage5 from "../../public/assets/glasses/glasses5.png";
import glassesIcon1 from "../../public/svgs/glassesIcon1.svg";
import glassesOffIcon1 from "../../public/svgs/glassesOffIcon1.svg";
import glassesIcon2 from "../../public/svgs/glassesIcon2.svg";
import glassesOffIcon2 from "../../public/svgs/glassesOffIcon2.svg";
import glassesIcon3 from "../../public/svgs/glassesIcon3.svg";
import glassesOffIcon3 from "../../public/svgs/glassesOffIcon3.svg";
import glassesIcon4 from "../../public/svgs/glassesIcon4.svg";
import glassesOffIcon4 from "../../public/svgs/glassesOffIcon4.svg";
import glassesIcon5 from "../../public/svgs/glassesIcon5.svg";
import glassesOffIcon5 from "../../public/svgs/glassesOffIcon5.svg";

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
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [color, setColor] = useState("#F56114");
  const [tempColor, setTempColor] = useState(color);
  const [effectsWidth, setEffectsWidth] = useState(0);
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

  const [overflowingXDirection, setOverflowingXDirection] = useState(false);
  const effectsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (videoContainerRef.current) {
        setEffectsWidth(videoContainerRef.current.clientWidth * 0.9);
      }
      if (effectsContainerRef.current) {
        setOverflowingXDirection(
          effectsContainerRef.current.scrollWidth >
            effectsContainerRef.current.clientWidth
        );
      }
    };

    // Update width on mount
    updateWidth();

    // Add resize event listener
    window.addEventListener("resize", updateWidth);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", updateWidth);
  }, [videoContainerRef]);

  const currentGlassesEffect = useRef<
    | "glassesEffect1"
    | "glassesEffect2"
    | "glassesEffect3"
    | "glassesEffect4"
    | "glassesEffect5"
  >("glassesEffect1");

  return (
    <div
      ref={effectsContainerRef}
      className={`${
        overflowingXDirection ? "" : "pb-2"
      } tiny-horizontal-scroll-bar rounded border mb-5 border-white border-opacity-75 bg-black bg-opacity-75 shadow-xl flex space-x-1 px-2 pt-2 absolute bottom-full left-1/2 -translate-x-1/2 items-center`}
      style={{
        width: effectsWidth,
        overflow: "auto visible",
      }}
    >
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
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <div className='w-max flex'>
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
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <button
        onClick={() => handleEffectChange("dogEars")}
        className='flex items-center justify-center w-10 min-w-10 aspect-square'
      >
        {userStreamEffects.current.dogEars[type]?.[videoId] ? (
          <img
            src={dogEarsOffIcon}
            alt='icon'
            style={{ width: "90%", height: "90%" }}
          />
        ) : (
          <img
            src={dogEarsIcon}
            alt='icon'
            style={{ width: "90%", height: "90%" }}
          />
        )}
      </button>
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <HoldButton
        clickFunction={() => handleEffectChange("glasses")}
        holdFunction={(event: React.MouseEvent<Element, MouseEvent>) => {
          const target = event.target as HTMLElement;
          if (target && target.dataset.value) {
            console.log(`Held button value: ${target.dataset.value}`);
            if (target.dataset.value === "glassesEffect1") {
              currentGlassesEffect.current = target.dataset.value;
            } else if (target.dataset.value === "glassesEffect2") {
              currentGlassesEffect.current = target.dataset.value;
            } else if (target.dataset.value === "glassesEffect3") {
              currentGlassesEffect.current = target.dataset.value;
            } else if (target.dataset.value === "glassesEffect4") {
              currentGlassesEffect.current = target.dataset.value;
            } else if (target.dataset.value === "glassesEffect5") {
              currentGlassesEffect.current = target.dataset.value;
            }
          }
        }}
        contentFunction={() => {
          const iconSrc = userStreamEffects.current.glasses[type]?.[videoId]
            ? (currentGlassesEffect.current === "glassesEffect1" &&
                glassesOffIcon1) ||
              (currentGlassesEffect.current === "glassesEffect2" &&
                glassesOffIcon2) ||
              (currentGlassesEffect.current === "glassesEffect3" &&
                glassesOffIcon3) ||
              (currentGlassesEffect.current === "glassesEffect4" &&
                glassesOffIcon4) ||
              glassesOffIcon5
            : (currentGlassesEffect.current === "glassesEffect1" &&
                glassesIcon1) ||
              (currentGlassesEffect.current === "glassesEffect2" &&
                glassesIcon2) ||
              (currentGlassesEffect.current === "glassesEffect3" &&
                glassesIcon3) ||
              (currentGlassesEffect.current === "glassesEffect4" &&
                glassesIcon4) ||
              glassesIcon5;

          return (
            <img
              src={iconSrc}
              alt='icon'
              style={{ width: "90%", height: "90%" }}
              data-value={"glassesEffect1"}
            />
          );
        }}
        holdContent={
          <div className='mb-4 grid grid-cols-3 w-max gap-x-1 gap-y-1 p-2 border border-white border-opacity-75 bg-black bg-opacity-75 shadow-lg rounded-md'>
            <div
              className='flex items-center justify-center w-10 min-w-10 aspect-square bg-white border-fg-black-35 hover:border-fg-secondary rounded border hover:border-2 border-opacity-75'
              data-value={"glassesEffect1"}
            >
              <img
                src={glassesImage1}
                alt='icon'
                style={{ width: "90%" }}
                data-value={"glassesEffect1"}
              />
            </div>
            <div
              className='flex items-center justify-center w-10 min-w-10 aspect-square bg-white rounded border hover:border-2 border-fg-black-35 hover:border-fg-secondary border-opacity-75 scale-x-[-1]'
              data-value={"glassesEffect2"}
            >
              <img
                src={glassesImage2}
                alt='icon'
                style={{ width: "90%" }}
                data-value={"glassesEffect2"}
              />
            </div>
            <div
              className='flex items-center justify-center w-10 min-w-10 aspect-square rounded border hover:border-2 border-white hover:border-fg-secondary border-opacity-75 scale-x-[-1]'
              data-value={"glassesEffect3"}
            >
              <img
                src={glassesImage3}
                alt='icon'
                style={{ width: "90%" }}
                data-value={"glassesEffect3"}
              />
            </div>
            <div
              className='flex items-center justify-center w-10 min-w-10 aspect-square rounded border hover:border-2 border-white hover:border-fg-secondary border-opacity-75'
              data-value={"glassesEffect4"}
            >
              <img
                src={glassesImage4}
                alt='icon'
                style={{ width: "90%" }}
                data-value={"glassesEffect4"}
              />
            </div>
            <div
              className='flex items-center justify-center w-10 min-w-10 aspect-square rounded border hover:border-2 border-white hover:border-fg-secondary border-opacity-75'
              data-value={"glassesEffect5"}
            >
              <img
                src={glassesImage5}
                alt='icon'
                style={{ width: "90%" }}
                data-value={"glassesEffect5"}
              />
            </div>
          </div>
        }
        styles={"flex items-center justify-center w-10 aspect-square"}
        defaultDataValue={currentGlassesEffect.current}
      />
      <div className='bg-white h-10 rounded-full w-0.25 min-w-0.25'></div>
      <button
        onClick={() => handleEffectChange("beard")}
        className='flex items-center justify-center w-10 min-w-10 aspect-square'
      >
        {userStreamEffects.current.beard[type]?.[videoId] ? (
          <img
            src={beardOffIcon}
            alt='icon'
            style={{ width: "90%", height: "90%" }}
          />
        ) : (
          <img
            src={beardIcon}
            alt='icon'
            style={{ width: "90%", height: "90%" }}
          />
        )}
      </button>
    </div>
  );
}
