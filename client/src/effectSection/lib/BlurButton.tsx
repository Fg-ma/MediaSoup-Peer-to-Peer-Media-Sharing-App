import React, { useState } from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import { EffectTypes, useStreamsContext } from "../../context/StreamsContext";
import blurIcon from "../../../public/svgs/blurIcon.svg";
import blurOffIcon from "../../../public/svgs/blurOffIcon.svg";

export default function BlurButton({
  videoId,
  type,
  handleEffectChange,
}: {
  videoId: string;
  type: "camera" | "screen";
  handleEffectChange: (effect: EffectTypes, blockStateChange?: boolean) => void;
}) {
  const { userStreamEffects } = useStreamsContext();
  const [buttonState, setButtonState] = useState("");

  return (
    <FgButton
      clickFunction={() => {
        handleEffectChange("blur");
        setButtonState(
          userStreamEffects.current.blur[type]?.[videoId]
            ? "inActive"
            : "active"
        );
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={
              userStreamEffects.current.blur[type]?.[videoId]
                ? blurOffIcon
                : blurIcon
            }
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
      className='flex items-center justify-center w-10 aspect-square'
      hoverTimeoutDuration={750}
    />
  );
}
