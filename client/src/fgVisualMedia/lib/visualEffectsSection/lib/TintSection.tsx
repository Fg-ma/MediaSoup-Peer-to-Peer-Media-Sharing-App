import React, { useState, useRef, useEffect, Suspense } from "react";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../../context/streamsContext/typeConstant";
import { useStreamsContext } from "../../../../context/streamsContext/StreamsContext";
import FgButton from "../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../fgElements/fgSVG/FgSVG";
import tintIcon from "../../../../../public/svgs/visualEffects/tintIcon.svg";
import tintOffIcon from "../../../../../public/svgs/visualEffects/tintOffIcon.svg";

const ColorPicker = React.lazy(() => import("./ColorPicker"));

export default function TintSection({
  username,
  instance,
  visualMediaId,
  type,
  isUser,
  handleVisualEffectChange,
  tintColor,
  effectsDisabled,
  setEffectsDisabled,
  scrollingContainerRef,
}: {
  username: string;
  instance: string;
  visualMediaId: string;
  type: "camera" | "screen";
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  tintColor: React.MutableRefObject<string>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  scrollingContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const [color, setColor] = useState("#F56114");
  const [_, setRerender] = useState(0);
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);

  const streamEffects = isUser
    ? userStreamEffects.current[type][visualMediaId].tint
    : remoteStreamEffects.current[username][instance][type][visualMediaId].tint;

  const handleColorPicker = () => {
    setTempColor(tintColor.current);
    setIsColorPicker((prev) => !prev);
  };

  if (isUser) {
    useEffect(() => {
      setRerender((prev) => prev + 1);
    }, [userStreamEffects.current[type][visualMediaId].tint]);
  }

  return (
    <div className='w-max flex'>
      <FgButton
        clickFunction={async () => {
          setEffectsDisabled(true);
          setRerender((prev) => prev + 1);

          await handleVisualEffectChange("tint");

          setEffectsDisabled(false);
        }}
        contentFunction={() => {
          return (
            <FgSVG
              src={streamEffects ? tintOffIcon : tintIcon}
              attributes={[
                { key: "width", value: "95%" },
                { key: "height", value: "95%" },
                { key: "fill", value: tintColor.current, id: "tintColorPath" },
              ]}
            />
          );
        }}
        hoverContent={
          <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Tint
          </div>
        }
        scrollingContainerRef={scrollingContainerRef}
        className='flex items-center justify-center min-w-10 w-10 aspect-square'
        options={{
          hoverTimeoutDuration: 750,
          disabled: effectsDisabled,
        }}
      />
      <div className='flex items-center justify-center min-w-10 w-10 aspect-square'>
        <FgButton
          externalRef={colorPickerBtnRef}
          clickFunction={() => handleColorPicker()}
          hoverContent={
            <div className='mb-6 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
              Color picker
            </div>
          }
          scrollingContainerRef={scrollingContainerRef}
          className='w-6 h-6 m-2 border border-white rounded'
          style={{ backgroundColor: tempColor }}
          options={{
            hoverTimeoutDuration: 750,
            disabled: effectsDisabled,
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
              colorRef={tintColor}
              colorPickerBtnRef={colorPickerBtnRef}
              handleAcceptColorCallback={() => {
                handleVisualEffectChange("tint", streamEffects);
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
