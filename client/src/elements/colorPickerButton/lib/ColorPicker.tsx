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
  setIsColorPicker,
  colorRef,
  colorPickerBtnRef,
  handleAcceptColorCallback,
  externalColorPickerPanelRef,
  isAlpha = false,
  setRerender,
}: {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  tempColor: React.MutableRefObject<string>;
  setIsColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
  colorRef: React.MutableRefObject<string>;
  colorPickerBtnRef: React.RefObject<HTMLButtonElement>;
  handleAcceptColorCallback?: (
    hex: string,
    hexa: string,
    a: number,
    rgba: { r: number; g: number; a: number },
  ) => void;
  externalColorPickerPanelRef?: React.RefObject<HTMLDivElement>;
  isAlpha?: boolean;
  setRerender: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [hexValue, setHexValue] = useState(
    color.slice(1) + (isAlpha && color.length !== 9 ? "ff" : ""),
  );
  const [alpha, setAlpha] = useState(
    color.length === 9 ? parseInt(color.slice(7), 16) / 255 : 1,
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

      tempColor.current = color + hexA;
      setRerender((prev) => !prev);
      setHexValue(color.slice(1) + hexA);
      setRgba({ r: `${r}`, g: `${g}`, b: `${b}`, a: `${alpha}` });
    } else {
      tempColor.current = color;
      setRerender((prev) => !prev);
      setHexValue(color.slice(1));

      setRgba((prev) => ({ r: `${r}`, g: `${g}`, b: `${b}`, a: prev.a }));
    }
  };

  const handleAcceptColor = () => {
    setColor(tempColor.current);
    colorRef.current = tempColor.current;
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
          : { ...hexToRgb(colorRef.current), a: alpha },
      );
    }
  };

  const handleCancelColor = () => {
    tempColor.current = color;
    setRerender((prev) => !prev);
    setIsColorPicker(false);
  };

  const handleHexColorChanges = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setHexValue(event.target.value);

    if (isValidHex(event.target.value)) {
      tempColor.current = `#${event.target.value}`;
      setRerender((prev) => !prev);
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
    type: "r" | "g" | "b",
  ) => {
    if (!isAlpha) {
      const { r, b, g } = hexToRgb(tempColor.current);

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
          tempColor.current = hexVal;
          setRerender((prev) => !prev);
          setHexValue(hexVal.slice(1));
        }
      }
    } else {
      const { r, b, g, a } = hexToRgba(tempColor.current);

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
          tempColor.current = hexVal;
          setRerender((prev) => !prev);
          setHexValue(hexVal.slice(1));
        }
      }
    }
  };

  const handleAlphaChanges = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { r, b, g } = hexToRgba(tempColor.current);

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
        tempColor.current = hexVal;
        setRerender((prev) => !prev);
        setHexValue(hexVal.slice(1));
      }
    }
  };

  const handleAlphaSliderChanges = (value: number) => {
    const { r, g, b } = hexToRgb(tempColor.current);
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
        tempColor.current = hexVal;
        setRerender((prev) => !prev);
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
        <div ref={colorPickerRef} className="flex flex-col space-y-2">
          <div
            className={`mb-2 flex items-center ${
              isAlpha ? "h-[220px] justify-between" : "h-[200px] justify-center"
            }`}
          >
            <HexColorPicker
              color={
                isAlpha ? tempColor.current.slice(0, -2) : tempColor.current
              }
              onChange={handleChangeComplete}
              style={{
                height: isAlpha ? "220px" : "200px",
                width: isAlpha ? "220px" : "200px",
              }}
            />
            {isAlpha && (
              <FgSlider
                className="grow pl-2"
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
          <div className="flex space-x-1">
            <div
              className={`flex flex-col items-center justify-center space-y-1 ${
                isAlpha ? "w-[88px]" : "w-[70px]"
              }`}
            >
              <label className="flex cursor-pointer flex-col items-center justify-center text-base text-black">
                <input
                  type="text"
                  className="h-8 w-full rounded-md border border-fg-white-85 bg-white pl-1 pr-0.5 font-K2D text-sm text-black focus:border-2 focus:border-fg-secondary focus:outline-none"
                  onChange={handleHexColorChanges}
                  autoComplete="off"
                  value={hexValue}
                ></input>
                Hex
              </label>
            </div>
            <div className="flex w-10 flex-col items-center justify-center space-y-1">
              <label className="flex cursor-pointer flex-col items-center justify-center text-base text-black">
                <input
                  type="text"
                  className="h-8 w-full rounded-md border border-fg-white-85 bg-white pl-1.5 pr-1 font-K2D text-sm text-black focus:border-2 focus:border-fg-secondary focus:outline-none"
                  onChange={(event) => handleRGBColorChanges(event, "r")}
                  autoComplete="off"
                  value={rgba.r}
                ></input>
                R
              </label>
            </div>
            <div className="flex w-10 flex-col items-center justify-center space-y-1">
              <label className="flex cursor-pointer flex-col items-center justify-center text-base text-black">
                <input
                  type="text"
                  className="h-8 w-full rounded-md border border-fg-white-85 bg-white pl-1.5 pr-1 font-K2D text-sm text-black focus:border-2 focus:border-fg-secondary focus:outline-none"
                  onChange={(event) => handleRGBColorChanges(event, "g")}
                  autoComplete="off"
                  value={rgba.g}
                ></input>
                G
              </label>
            </div>
            <div className="flex w-10 flex-col items-center justify-center space-y-1">
              <label className="flex cursor-pointer flex-col items-center justify-center text-base text-black">
                <input
                  type="text"
                  className="h-8 w-full rounded-md border border-fg-white-85 bg-white pl-1.5 pr-1 font-K2D text-sm text-black focus:border-2 focus:border-fg-secondary focus:outline-none"
                  onChange={(event) => handleRGBColorChanges(event, "b")}
                  autoComplete="off"
                  value={rgba.b}
                ></input>
                B
              </label>
            </div>
            {isAlpha && (
              <div className="flex w-[3.25rem] flex-col items-center justify-center space-y-1 pl-1">
                <label className="flex cursor-pointer flex-col items-center justify-center text-base text-black">
                  <input
                    type="text"
                    className="h-8 w-full rounded-md border border-fg-white-85 bg-white pl-1.5 pr-1 font-K2D text-sm text-black focus:border-2 focus:border-fg-secondary focus:outline-none"
                    onChange={(event) => handleAlphaChanges(event)}
                    autoComplete="off"
                    value={rgba.a}
                  ></input>
                  a
                </label>
              </div>
            )}
          </div>
          <div className="flex w-full items-center justify-center space-x-2">
            <FgButton
              className="flex h-10 w-10 items-center justify-center rounded-full bg-fg-red"
              clickFunction={handleAcceptColor}
              contentFunction={() => (
                <FgSVGElement
                  src={checkIcon}
                  className="h-[75%] w-[75%]"
                  attributes={[
                    { key: "width", value: "100%" },
                    { key: "height", value: "100%" },
                    { key: "fill", value: "#f2f2f2" },
                    { key: "stroke", value: "#f2f2f2" },
                  ]}
                />
              )}
              hoverContent={
                <FgHoverContentStandard content="Confirm color" style="light" />
              }
              options={{
                hoverSpacing: 4,
                hoverTimeoutDuration: 1250,
                hoverType: "above",
              }}
            />
            <FgButton
              className="flex h-10 w-10 items-center justify-center rounded-full bg-fg-tone-black-4"
              clickFunction={handleCancelColor}
              contentFunction={() => (
                <FgSVGElement
                  src={closeIcon}
                  className="h-[55%] w-[55%]"
                  attributes={[
                    { key: "width", value: "100%" },
                    { key: "height", value: "100%" },
                    { key: "fill", value: "#f2f2f2" },
                    { key: "stroke", value: "#f2f2f2" },
                  ]}
                />
              )}
              hoverContent={
                <FgHoverContentStandard content="Cancel" style="light" />
              }
              options={{
                hoverSpacing: 4,
                hoverTimeoutDuration: 1250,
                hoverType: "above",
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
      initHeight="max-content"
      initWidth="max-content"
    />
  );
}
