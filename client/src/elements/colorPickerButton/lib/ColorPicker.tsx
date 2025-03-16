import React, { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import FgPanel from "../../fgPanel/FgPanel";
import FgSlider from "../../fgSlider/FgSlider";
import FgButton from "../../fgButton/FgButton";
import FgSVGElement from "../../fgSVGElement/FgSVGElement";
import FgHoverContentStandard from "../../fgHoverContentStandard/FgHoverContentStandard";

const nginxAssetServerBaseUrl = process.env.NGINX_ASSET_SERVER_BASE_URL;

const closeIcon = nginxAssetServerBaseUrl + "svgs/closeIcon.svg";
const checkIcon = nginxAssetServerBaseUrl + "svgs/checkIcon.svg";

export default function ColorPicker({
  color,
  setColor,
  tempColor,
  setTempColor,
  setIsColorPicker,
  colorRef,
  colorPickerBtnRef,
  handleAcceptColorCallback,
  externalColorPickerPanelRef,
  isAlpha = false,
}: {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  tempColor: string;
  setTempColor: React.Dispatch<React.SetStateAction<string>>;
  setIsColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
  colorRef: React.MutableRefObject<string>;
  colorPickerBtnRef: React.RefObject<HTMLButtonElement>;
  handleAcceptColorCallback?: (
    hex: string,
    hexa: string,
    a: number,
    rgba: { r: number; g: number; a: number }
  ) => void;
  externalColorPickerPanelRef?: React.RefObject<HTMLDivElement>;
  isAlpha?: boolean;
}) {
  const [hexValue, setHexValue] = useState(
    color.slice(1) + (isAlpha && color.length !== 9 ? "ff" : "")
  );
  const [alpha, setAlpha] = useState(
    color.length === 9 ? parseInt(color.slice(7), 16) / 255 : 1
  );

  const hexToRgb = (hex: string) => {
    hex = hex.replace(/^#/, "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  };

  const hexToRgba = (hex: string) => {
    hex = hex.replace(/^#/, "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = parseInt(hex.substring(6, 8), 16) / 255;

    return { r, g, b, a };
  };

  const [rgba, setRgba] = useState<{
    r: string;
    g: string;
    b: string;
    a: string;
  }>(() => {
    const rgba = isAlpha ? hexToRgba(color) : { ...hexToRgb(color), a: 0 };

    return {
      r: `${rgba.r}`,
      g: `${rgba.g}`,
      b: `${rgba.b}`,
      a: `${Number.isNaN(rgba.a) ? 1 : rgba.a}`,
    };
  });

  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleChangeComplete = (color: string) => {
    const { r, g, b } = hexToRgb(color);

    if (isAlpha) {
      const hexA = `${Math.round(Math.max(0, Math.min(1, alpha)) * 255)
        .toString(16)
        .padStart(2, "0")}`;

      setTempColor(color + hexA);
      setHexValue(color.slice(1) + hexA);
      setRgba({ r: `${r}`, g: `${g}`, b: `${b}`, a: `${alpha}` });
    } else {
      setTempColor(color);
      setHexValue(color.slice(1));

      setRgba((prev) => ({ r: `${r}`, g: `${g}`, b: `${b}`, a: prev.a }));
    }
  };

  const handleAcceptColor = () => {
    setColor(tempColor);
    colorRef.current = tempColor;
    setIsColorPicker(false);
    if (handleAcceptColorCallback) {
      handleAcceptColorCallback(
        colorRef.current.length === 9
          ? colorRef.current.slice(0, -2)
          : colorRef.current,
        colorRef.current.length === 9
          ? colorRef.current
          : colorRef.current +
              Math.round(Math.max(0, Math.min(1, alpha)) * 255)
                .toString(16)
                .padStart(2, "0"),
        alpha,
        colorRef.current.length === 9
          ? hexToRgba(colorRef.current)
          : { ...hexToRgb(colorRef.current), a: alpha }
      );
    }
  };

  const handleCancelColor = () => {
    setTempColor(color);
    setIsColorPicker(false);
  };

  const handleHexColorChanges = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHexValue(event.target.value);

    if (isValidHex(event.target.value)) {
      setTempColor(`#${event.target.value}`);
      if (isAlpha) {
        const { r, g, b, a } = hexToRgba(`#${event.target.value}`);
        setRgba({ r: `${r}`, g: `${g}`, b: `${b}`, a: `${a}` });
        setAlpha(a);
      } else {
        const { r, g, b } = hexToRgb(color);
        setRgba((prev) => ({ r: `${r}`, g: `${g}`, b: `${b}`, a: prev.a }));
      }
    }
  };

  const handleRGBColorChanges = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "r" | "g" | "b"
  ) => {
    if (!isAlpha) {
      const { r, b, g } = hexToRgb(tempColor);

      setRgba((prev) => {
        const newRgba = { ...prev };

        newRgba[type] = event.target.value;

        return newRgba;
      });

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
    } else {
      const { r, b, g, a } = hexToRgba(tempColor);

      setRgba((prev) => {
        const newRgba = { ...prev };

        newRgba[type] = event.target.value;

        return newRgba;
      });

      let value = parseInt(event.target.value);

      if (Number.isNaN(value)) {
        value = 0;
      }

      if (0 <= value && value <= 255) {
        let hexVal: string | undefined;
        if (type === "r") {
          hexVal = rgbaToHex(value, b, g, a);
        } else if (type === "g") {
          hexVal = rgbaToHex(r, value, g, a);
        } else if (type === "b") {
          hexVal = rgbaToHex(r, b, value, a);
        }
        if (hexVal) {
          setTempColor(hexVal);
          setHexValue(hexVal.slice(1));
        }
      }
    }
  };

  const handleAlphaChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { r, b, g } = hexToRgba(tempColor);

    setRgba((prev) => {
      const newRgba = { ...prev };

      newRgba.a = event.target.value;

      return newRgba;
    });

    let value = parseFloat(event.target.value);

    if (Number.isNaN(value)) {
      value = 0;
    }

    if (0 <= value && value <= 1) {
      setAlpha(value);

      let hexVal: string | undefined;
      hexVal = rgbaToHex(r, b, g, value);
      if (hexVal) {
        setTempColor(hexVal);
        setHexValue(hexVal.slice(1));
      }
    }
  };

  const handleAlphaSliderChanges = (value: number) => {
    const { r, g, b } = hexToRgb(tempColor);
    const alphaValue = parseFloat(value.toFixed(2));

    setRgba((prev) => {
      const newRgba = { ...prev };

      newRgba.a = `${alphaValue}`;

      return newRgba;
    });

    setAlpha(alphaValue);

    if (0 <= alphaValue && alphaValue <= 1) {
      let hexVal: string | undefined;
      hexVal = rgbaToHex(r, g, b, alphaValue);
      if (hexVal) {
        setTempColor(hexVal);
        setHexValue(hexVal.slice(1));
      }
    }
  };

  const isValidHex = (hex: string) => {
    if (!isAlpha) {
      const hexRegex = /^([0-9A-Fa-f]{3}){1,2}$/;
      return hexRegex.test(hex);
    } else {
      const hexRegex = /^([0-9A-Fa-f]{4}){1,2}$/;
      return hexRegex.test(hex);
    }
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

  const rgbaToHex = (r: number, g: number, b: number, a: number) => {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    a = Math.max(0, Math.min(1, a));

    const rHex = r.toString(16).padStart(2, "0");
    const gHex = g.toString(16).padStart(2, "0");
    const bHex = b.toString(16).padStart(2, "0");
    const aHex = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");

    return `#${rHex}${gHex}${bHex}${aHex}`;
  };

  return (
    <FgPanel
      externalRef={externalColorPickerPanelRef}
      content={
        <div ref={colorPickerRef} className='flex flex-col space-y-2'>
          <div
            className={`mb-2 flex items-center justify-center ${
              isAlpha ? "h-[220px]" : "h-[200px]"
            }`}
          >
            <HexColorPicker
              color={isAlpha ? tempColor.slice(0, -2) : tempColor}
              onChange={handleChangeComplete}
              style={{
                height: isAlpha ? "220px" : "200px",
                width: isAlpha ? "220px" : "200px",
              }}
            />
            {isAlpha && (
              <FgSlider
                className='w-10'
                externalValue={alpha}
                externalStyleValue={alpha}
                onValueChange={(value) => handleAlphaSliderChanges(value.value)}
                options={{
                  initValue: alpha,
                  ticks: 6,
                  rangeMax: 1,
                  rangeMin: 0,
                  orientation: "vertical",
                  tickLabels: false,
                  precision: 2,
                }}
              />
            )}
          </div>
          <div className='flex space-x-1'>
            <div
              className={`flex flex-col space-y-1 items-center justify-center ${
                isAlpha ? "w-[88px]" : "w-[70px]"
              }`}
            >
              <label className='flex text-base text-black cursor-pointer flex-col items-center justify-center'>
                <input
                  type='text'
                  className='w-full bg-white h-8 rounded-md text-sm text-black pl-1 pr-0.5 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
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
                  className='w-full bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                  onChange={(event) => handleRGBColorChanges(event, "r")}
                  autoComplete='off'
                  value={rgba.r}
                ></input>
                R
              </label>
            </div>
            <div className='flex flex-col space-y-1 items-center justify-center w-10'>
              <label className='flex text-base text-black cursor-pointer flex-col items-center justify-center'>
                <input
                  type='text'
                  className='w-full bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                  onChange={(event) => handleRGBColorChanges(event, "g")}
                  autoComplete='off'
                  value={rgba.g}
                ></input>
                G
              </label>
            </div>
            <div className='flex flex-col space-y-1 items-center justify-center w-10'>
              <label className='flex text-base text-black cursor-pointer flex-col items-center justify-center'>
                <input
                  type='text'
                  className='w-full bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                  onChange={(event) => handleRGBColorChanges(event, "b")}
                  autoComplete='off'
                  value={rgba.b}
                ></input>
                B
              </label>
            </div>
            {isAlpha && (
              <div className='flex flex-col space-y-1 items-center justify-center w-[3.25rem] pl-1'>
                <label className='flex text-base text-black cursor-pointer flex-col items-center justify-center'>
                  <input
                    type='text'
                    className='w-full bg-white h-8 rounded-md text-sm text-black pl-1.5 pr-1 font-K2D focus:outline-none focus:border-2 focus:border-fg-secondary border border-fg-white-85'
                    onChange={(event) => handleAlphaChanges(event)}
                    autoComplete='off'
                    value={rgba.a}
                  ></input>
                  a
                </label>
              </div>
            )}
          </div>
          <div className='flex space-x-2 w-full items-center justify-center'>
            <FgButton
              className='flex h-10 w-10 bg-fg-red rounded-full items-center justify-center'
              clickFunction={handleAcceptColor}
              contentFunction={() => (
                <FgSVGElement
                  src={checkIcon}
                  className='w-[75%] h-[75%]'
                  attributes={[
                    { key: "width", value: "100%" },
                    { key: "height", value: "100%" },
                    { key: "fill", value: "#f2f2f2" },
                    { key: "stroke", value: "#f2f2f2" },
                  ]}
                />
              )}
              hoverContent={
                <FgHoverContentStandard content='Confirm color' style='light' />
              }
              options={{
                hoverSpacing: 4,
                hoverTimeoutDuration: 1250,
                hoverType: "above",
                hoverZValue: 500000000000,
              }}
            />
            <FgButton
              className='flex h-10 w-10 bg-fg-tone-black-4 rounded-full items-center justify-center'
              clickFunction={handleCancelColor}
              contentFunction={() => (
                <FgSVGElement
                  src={closeIcon}
                  className='w-[55%] h-[55%]'
                  attributes={[
                    { key: "width", value: "100%" },
                    { key: "height", value: "100%" },
                    { key: "fill", value: "#f2f2f2" },
                    { key: "stroke", value: "#f2f2f2" },
                  ]}
                />
              )}
              hoverContent={
                <FgHoverContentStandard content='Cancel' style='light' />
              }
              options={{
                hoverSpacing: 4,
                hoverTimeoutDuration: 1250,
                hoverType: "above",
                hoverZValue: 500000000000,
              }}
            />
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
