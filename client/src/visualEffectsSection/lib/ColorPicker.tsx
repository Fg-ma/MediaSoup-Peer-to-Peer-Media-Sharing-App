import React, { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import ReactDOM from "react-dom";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";

export default function ColorPicker({
  username,
  instance,
  type,
  videoId,
  isUser,
  color,
  setColor,
  tempColor,
  setTempColor,
  setIsColorPicker,
  tintColor,
  colorPickerBtnRef,
  handleEffectChange,
}: {
  username: string;
  instance: string;
  type: "camera" | "screen";
  videoId: string;
  isUser: boolean;
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  tempColor: string;
  setTempColor: React.Dispatch<React.SetStateAction<string>>;
  setIsColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
  tintColor: React.MutableRefObject<string>;
  colorPickerBtnRef: React.RefObject<HTMLButtonElement>;
  handleEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => void;
}) {
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const [hexValue, setHexValue] = useState(color.slice(1));
  const [colorPickerPosition, setColorPickerPosition] = useState<{
    top: number | null;
    left: number | null;
  }>({
    top: null,
    left: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const mousePickerOffset = useRef<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].tint
    : remoteStreamEffects.current[username][instance][type][videoId].tint;

  const getColorPickerPosition = () => {
    const rect = colorPickerBtnRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const bodyRect = document.body.getBoundingClientRect();

    const topPercent = ((rect.top + rect.height + 15) / bodyRect.height) * 100;
    const leftPercent = ((rect.left + rect.width + 15) / bodyRect.width) * 100;

    setColorPickerPosition({
      top: topPercent,
      left: leftPercent,
    });
  };

  const handleClick = (event: MouseEvent) => {
    if (
      !colorPickerRef.current?.contains(event.target as Node) &&
      event.target !== colorPickerBtnRef.current
    ) {
      setTempColor(color);
      setIsColorPicker(false);
    }
  };

  useEffect(() => {
    getColorPickerPosition();

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("resize", getColorPickerPosition);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", getColorPickerPosition);
    };
  }, []);

  const handleChangeComplete = (color: string) => {
    setTempColor(color);
  };

  const handleAcceptColor = () => {
    setColor(tempColor);
    tintColor.current = tempColor;
    setIsColorPicker(false);
    if (streamEffects) {
      handleEffectChange("tint", streamEffects);
      if (isUser) {
        userStreamEffects.current[type][videoId].tint = true;
      } else {
        remoteStreamEffects.current[username][instance][type][videoId].tint =
          true;
      }
    }
  };

  const handleCancelColor = () => {
    setTempColor(color);
    setIsColorPicker(false);
  };

  const handleTintHexColorChanges = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHexValue((prev) =>
      event.target.value.length > 6 ? prev : event.target.value
    );
    if (isValidHex(event.target.value)) {
      setTempColor(`#${event.target.value}`);
    }
  };

  const handleTintRGBColorChanges = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "r" | "g" | "b"
  ) => {
    const { r, b, g } = hexToRgb(color);
    let value = parseInt(event.target.value);
    if (Number.isNaN(value)) {
      value = 0;
    }
    if (0 <= value && value <= 255) {
      let hexVal: string | undefined;
      if (type === "r") {
        hexVal = rgbToHex(value, b, g);
      } else if (type === "g") {
        hexVal = rgbToHex(r, value, g);
      } else if (type === "b") {
        hexVal = rgbToHex(r, b, value);
      }
      if (hexVal) {
        setTempColor(hexVal);
        setHexValue(hexVal.slice(1));
      }
    }
  };

  const isValidHex = (hex: string) => {
    const hexRegex = /^([0-9A-Fa-f]{3}){1,2}$/;
    return hexRegex.test(hex);
  };

  const hexToRgb = (hex: string) => {
    hex = hex.replace(/^#/, "");

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    let rHex = r.toString(16).padStart(2, "0");
    let gHex = g.toString(16).padStart(2, "0");
    let bHex = b.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  };

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const excludedElements = [
      "input",
      "button",
      ".react-colorful",
      "svg",
      "label",
    ];

    const isExcluded = excludedElements.some((selector) => {
      if (selector.startsWith(".")) {
        return (e.target as Element).closest(selector);
      }
      return (e.target as Element).tagName.toLowerCase() === selector;
    });

    if (isExcluded) {
      return;
    }

    setIsDragging(true);
    const rect = colorPickerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const bodyRect = document.body.getBoundingClientRect();

    const topColorPickerPercent = (rect.top / bodyRect.height) * 100;
    const leftColorPickerPercent = (rect.left / bodyRect.width) * 100;

    const topMousePercent = (e.clientY / bodyRect.height) * 100;
    const leftMousePercent = (e.clientX / bodyRect.width) * 100;

    mousePickerOffset.current = {
      top: topMousePercent - topColorPickerPercent,
      left: leftMousePercent - leftColorPickerPercent,
    };
  };

  const onDrag = (e: MouseEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    const bodyRect = document.body.getBoundingClientRect();
    const topPercent = (e.clientY / bodyRect.height) * 100;
    const leftPercent = (e.clientX / bodyRect.width) * 100;

    setColorPickerPosition({
      top: topPercent - mousePickerOffset.current.top,
      left: leftPercent - mousePickerOffset.current.left,
    });
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", stopDrag);
    } else {
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", stopDrag);
    }

    return () => {
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", stopDrag);
    };
  }, [isDragging]);

  return ReactDOM.createPortal(
    <>
      {colorPickerPosition.top && colorPickerPosition.left && (
        <div
          ref={colorPickerRef}
          className='absolute bg-white rounded-lg shadow-md p-3 flex flex-col space-y-2 z-50'
          style={{
            top: `${colorPickerPosition.top}%`,
            left: `${colorPickerPosition.left}%`,
            cursor: isDragging ? "grabbing" : "",
          }}
          onMouseDown={startDrag}
        >
          <HexColorPicker color={tempColor} onChange={handleChangeComplete} />
          <div className='flex space-x-1'>
            <div className='flex flex-col space-y-1 items-center justify-center w-16'>
              <input
                type='text'
                id={`effect_section_hex_${videoId}`}
                className='w-16 bg-white h-8 rounded-md text-sm text-black pl-1 pr-0.5 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                onChange={handleTintHexColorChanges}
                autoComplete='off'
                value={hexValue}
              ></input>
              <label
                htmlFor={`effect_section_hex_${videoId}`}
                className='text-base text-black cursor-pointer'
              >
                Hex
              </label>
            </div>
            <div className='flex flex-col space-y-1 items-center justify-center w-10'>
              <input
                type='text'
                id={`effect_section_r_${videoId}`}
                className='w-10 bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                onChange={(event) => handleTintRGBColorChanges(event, "r")}
                autoComplete='off'
                value={hexToRgb(tempColor).r ? hexToRgb(tempColor).r : 0}
              ></input>
              <label
                htmlFor={`effect_section_r_${videoId}`}
                className='text-base text-black cursor-pointer'
              >
                R
              </label>
            </div>
            <div className='flex flex-col space-y-1 items-center justify-center w-10'>
              <input
                type='text'
                id={`effect_section_g_${videoId}`}
                className='w-10 bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                onChange={(event) => handleTintRGBColorChanges(event, "g")}
                autoComplete='off'
                value={hexToRgb(tempColor).g ? hexToRgb(tempColor).g : 0}
              ></input>
              <label
                htmlFor={`effect_section_g_${videoId}`}
                className='text-base text-black cursor-pointer'
              >
                G
              </label>
            </div>
            <div className='flex flex-col space-y-1 items-center justify-center w-10'>
              <input
                type='text'
                id={`effect_section_b_${videoId}`}
                className='w-10 bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                onChange={(event) => handleTintRGBColorChanges(event, "b")}
                autoComplete='off'
                value={hexToRgb(tempColor).b ? hexToRgb(tempColor).b : 0}
              ></input>
              <label
                htmlFor={`effect_section_b_${videoId}`}
                className='text-base text-black cursor-pointer'
              >
                B
              </label>
            </div>
          </div>
          <div className='flex space-x-2 w-max'>
            <button
              className='px-4 w-max h-max bg-fg-primary rounded'
              onClick={handleAcceptColor}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='32px'
                viewBox='0 -960 960 960'
                width='32px'
                fill='white'
              >
                <path d='m382-354 339-339q12-12 28-12t28 12q12 12 12 28.5T777-636L410-268q-12 12-28 12t-28-12L182-440q-12-12-11.5-28.5T183-497q12-12 28.5-12t28.5 12l142 143Z' />
              </svg>
            </button>
            <button
              className='px-4 w-max h-max bg-fg-black-25 rounded'
              onClick={handleCancelColor}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='32px'
                viewBox='0 -960 960 960'
                width='32px'
                fill='white'
              >
                <path d='M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z' />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
