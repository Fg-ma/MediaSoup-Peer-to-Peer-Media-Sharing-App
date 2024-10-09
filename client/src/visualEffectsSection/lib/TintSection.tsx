import React, { useState, useRef, useEffect, Suspense } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import tintIcon from "../../../public/svgs/visualEffects/tintIcon.svg";
import tintOffIcon from "../../../public/svgs/visualEffects/tintOffIcon.svg";

const ColorPicker = React.lazy(() => import("./ColorPicker"));

export default function TintSection({
  username,
  instance,
  videoId,
  type,
  isUser,
  handleVisualEffectChange,
  tintColor,
  effectsDisabled,
  setEffectsDisabled,
}: {
  username: string;
  instance: string;
  videoId: string;
  type: "camera" | "screen";
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  tintColor: React.MutableRefObject<string>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const [color, setColor] = useState("#F56114");
  const [rerender, setRerender] = useState(0);
  const [isColorPicker, setIsColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(color);
  const colorPickerBtnRef = useRef<HTMLButtonElement>(null);

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].tint
    : remoteStreamEffects.current[username][instance][type][videoId].tint;

  const handleColorPicker = () => {
    setTempColor(tintColor.current);
    setIsColorPicker((prev) => !prev);
  };

  if (isUser) {
    useEffect(() => {
      setRerender((prev) => prev + 1);
    }, [userStreamEffects.current[type][videoId].tint]);
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
              username={username}
              instance={instance}
              type={type}
              videoId={videoId}
              isUser={isUser}
              color={color}
              setColor={setColor}
              tempColor={tempColor}
              setTempColor={setTempColor}
              setIsColorPicker={setIsColorPicker}
              tintColor={tintColor}
              colorPickerBtnRef={colorPickerBtnRef}
              handleVisualEffectChange={handleVisualEffectChange}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
