import React, { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import FgPanel from "../../../../fgElements/fgPanel/FgPanel";

export default function ColorPicker({
  color,
  setColor,
  tempColor,
  setTempColor,
  setIsColorPicker,
  colorRef,
  colorPickerBtnRef,
  handleAcceptColorCallback,
}: {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  tempColor: string;
  setTempColor: React.Dispatch<React.SetStateAction<string>>;
  setIsColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
  colorRef: React.MutableRefObject<string>;
  colorPickerBtnRef: React.RefObject<HTMLButtonElement>;
  handleAcceptColorCallback?: () => void;
}) {
  const [hexValue, setHexValue] = useState(color.slice(1));
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleChangeComplete = (color: string) => {
    setTempColor(color);
  };

  const handleAcceptColor = () => {
    setColor(tempColor);
    colorRef.current = tempColor;
    setIsColorPicker(false);
    if (handleAcceptColorCallback) {
      handleAcceptColorCallback();
    }
  };

  const handleCancelColor = () => {
    setTempColor(color);
    setIsColorPicker(false);
  };

  const handleHexColorChanges = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHexValue((prev) =>
      event.target.value.length > 6 ? prev : event.target.value
    );
    if (isValidHex(event.target.value)) {
      setTempColor(`#${event.target.value}`);
    }
  };

  const handleRGBColorChanges = (
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

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    const rHex = r.toString(16).padStart(2, "0");
    const gHex = g.toString(16).padStart(2, "0");
    const bHex = b.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  };

  return (
    <FgPanel
      content={
        <div ref={colorPickerRef} className='flex flex-col space-y-2'>
          <HexColorPicker color={tempColor} onChange={handleChangeComplete} />
          <div className='flex space-x-1'>
            <div className='flex flex-col space-y-1 items-center justify-center w-16'>
              <label className='flex text-base text-black cursor-pointer flex-col items-center justify-center'>
                <input
                  type='text'
                  className='w-16 bg-white h-8 rounded-md text-sm text-black pl-1 pr-0.5 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                  onChange={handleHexColorChanges}
                  autoComplete='off'
                  value={hexValue}
                ></input>
                Hex
              </label>
            </div>
            <div className='flex flex-col space-y-1 items-center justify-center w-10'>
              <label className='flex text-base text-black cursor-pointer flex-col items-center justify-center'>
                <input
                  type='text'
                  className='w-10 bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                  onChange={(event) => handleRGBColorChanges(event, "r")}
                  autoComplete='off'
                  value={hexToRgb(tempColor).r ? hexToRgb(tempColor).r : 0}
                ></input>
                R
              </label>
            </div>
            <div className='flex flex-col space-y-1 items-center justify-center w-10'>
              <label className='flex text-base text-black cursor-pointer flex-col items-center justify-center'>
                <input
                  type='text'
                  className='w-10 bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                  onChange={(event) => handleRGBColorChanges(event, "g")}
                  autoComplete='off'
                  value={hexToRgb(tempColor).g ? hexToRgb(tempColor).g : 0}
                ></input>
                G
              </label>
            </div>
            <div className='flex flex-col space-y-1 items-center justify-center w-10'>
              <label className='flex text-base text-black cursor-pointer flex-col items-center justify-center'>
                <input
                  type='text'
                  className='w-10 bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                  onChange={(event) => handleRGBColorChanges(event, "b")}
                  autoComplete='off'
                  value={hexToRgb(tempColor).b ? hexToRgb(tempColor).b : 0}
                ></input>
                B
              </label>
            </div>
          </div>
          <div className='flex space-x-2 w-full items-center justify-center'>
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
      }
      initPosition={{
        referenceElement: colorPickerBtnRef.current ?? undefined,
        placement: "above",
      }}
      resizeable={false}
      initHeight='max-content'
      initWidth='max-content'
    />
  );
}
