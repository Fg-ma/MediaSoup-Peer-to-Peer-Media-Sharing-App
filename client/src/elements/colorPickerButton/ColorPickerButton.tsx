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
}: {
  className?: string;
  defaultColor?: string;
  scrollingContainerRef?: React.RefObject<HTMLDivElement>;
  handleAcceptColorCallback?: (color: string) => void;
  externalColorRef?: React.MutableRefObject<string>;
  externalColorPickerPanelRef?: React.RefObject<HTMLDivElement>;
  disabled?: boolean;
}) {
  const colorRef = externalColorRef ? externalColorRef : useRef(defaultColor);
  const [color, setColor] = useState(colorRef.current);
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);

  const handleColorPicker = () => {
    setTempColor(colorRef.current);
    setIsColorPicker((prev) => !prev);
  };

  useEffect(() => {
    colorRef.current = defaultColor;
    setColor(colorRef.current);
    setTempColor(colorRef.current);
  }, [defaultColor]);

  return (
    <div
      className={`${className} flex items-center justify-center aspect-square`}
    >
      <FgButton
        externalRef={colorPickerBtnRef}
        clickFunction={() => handleColorPicker()}
        hoverContent={<FgHoverContentStandard content='Color picker' />}
        scrollingContainerRef={scrollingContainerRef}
        className='border w-full h-full border-white rounded'
        style={{
          backgroundColor: tempColor,
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
            setTempColor={setTempColor}
            setIsColorPicker={setIsColorPicker}
            colorRef={colorRef}
            colorPickerBtnRef={colorPickerBtnRef}
            handleAcceptColorCallback={() => {
              if (handleAcceptColorCallback)
                handleAcceptColorCallback(colorRef.current);
            }}
            externalColorPickerPanelRef={externalColorPickerPanelRef}
          />
        </Suspense>
      )}
    </div>
  );
}
