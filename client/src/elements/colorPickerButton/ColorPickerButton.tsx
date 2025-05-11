import React, { Suspense, useEffect, useRef, useState } from "react";
import FgButton from "../fgButton/FgButton";
import FgHoverContentStandard from "../fgHoverContentStandard/FgHoverContentStandard";

const ColorPicker = React.lazy(() => import("./lib/ColorPicker"));

export default function ColorPickerButton({
  className,
  defaultColor = "#d40213",
  scrollingContainerRef,
  handleAcceptColorCallback,
  externalColorRef,
  externalColorPickerPanelRef,
  disabled,
  isAlpha,
}: {
  className?: string;
  defaultColor?: string;
  scrollingContainerRef?: React.RefObject<HTMLDivElement>;
  handleAcceptColorCallback?: (
    hex: string,
    hexa: string,
    a: number,
    rgba: { r: number; g: number; a: number },
  ) => void;
  externalColorRef?: React.MutableRefObject<string>;
  externalColorPickerPanelRef?: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
  isAlpha?: boolean;
}) {
  const colorRef = externalColorRef ? externalColorRef : useRef(defaultColor);
  const [color, setColor] = useState(colorRef.current);
  const [isColorPicker, setIsColorPicker] = useState(false);
  const tempColor = useRef(colorRef.current);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);

  const [_, setRerender] = useState(false);

  const handleColorPicker = () => {
    tempColor.current = colorRef.current;
    setIsColorPicker((prev) => !prev);
  };

  useEffect(() => {
    colorRef.current = defaultColor;
    setColor(colorRef.current);
    tempColor.current = colorRef.current;
    setRerender((prev) => !prev);
  }, [defaultColor]);

  useEffect(() => {
    if (!externalColorRef) return;

    colorRef.current = externalColorRef.current;
    setColor(colorRef.current);
    tempColor.current = colorRef.current;
    setRerender((prev) => !prev);
  }, [externalColorRef?.current]);

  return (
    <div
      className={`${className} flex !aspect-square items-center justify-center`}
    >
      <FgButton
        externalRef={colorPickerBtnRef}
        clickFunction={handleColorPicker}
        hoverContent={<FgHoverContentStandard content="Color picker" />}
        scrollingContainerRef={scrollingContainerRef}
        className="h-full w-full rounded-full border-2 border-fg-white border-opacity-90 hover:border-fg-red-light"
        style={{
          backgroundColor: tempColor.current,
        }}
        options={{
          hoverTimeoutDuration: 750,
          disabled,
        }}
      />
      {isColorPicker && (
        <Suspense fallback={<div>Loading...</div>}>
          <ColorPicker
            color={color}
            setColor={setColor}
            tempColor={tempColor}
            setIsColorPicker={setIsColorPicker}
            colorRef={colorRef}
            colorPickerBtnRef={colorPickerBtnRef}
            handleAcceptColorCallback={(hex, hexa, a, rgba) => {
              if (handleAcceptColorCallback)
                handleAcceptColorCallback(hex, hexa, a, rgba);
            }}
            externalColorPickerPanelRef={externalColorPickerPanelRef}
            isAlpha={isAlpha}
            setRerender={setRerender}
          />
        </Suspense>
      )}
    </div>
  );
}
