import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
  useStreamsContext,
} from "../../context/StreamsContext";
import blurIcon from "../../../public/svgs/visualEffects/blurIcon.svg";
import blurOffIcon from "../../../public/svgs/visualEffects/blurOffIcon.svg";

export default function BlurButton({
  username,
  instance,
  type,
  videoId,
  isUser,
  handleVisualEffectChange,
  effectsDisabled,
  setEffectsDisabled,
}: {
  username: string;
  instance: string;
  type: "camera" | "screen";
  videoId: string;
  isUser: boolean;
  handleVisualEffectChange: (
    effect: CameraEffectTypes | ScreenEffectTypes,
    blockStateChange?: boolean
  ) => Promise<void>;
  effectsDisabled: boolean;
  setEffectsDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { userStreamEffects, remoteStreamEffects } = useStreamsContext();

  const [rerender, setRerender] = useState(0);

  const streamEffects = isUser
    ? userStreamEffects.current[type][videoId].blur
    : remoteStreamEffects.current[username][instance][type][videoId].blur;

  return (
    <FgButton
      clickFunction={async () => {
        setEffectsDisabled(true);
        setRerender((prev) => prev + 1);

        await handleVisualEffectChange("blur");

        setEffectsDisabled(false);
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={streamEffects ? blurOffIcon : blurIcon}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        <div className='mb-3.5 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Blur
        </div>
      }
      className='flex items-center justify-center min-w-10 w-10 aspect-square'
      options={{
        hoverTimeoutDuration: 750,
        disabled: effectsDisabled,
      }}
    />
  );
}
