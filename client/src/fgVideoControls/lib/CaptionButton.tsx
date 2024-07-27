import React, { useState } from "react";
import Controls from "./Controls";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import captionsIcon from "../../../public/svgs/captionsIcon.svg";

export default function CaptionButton({
  controls,
  effectsActive,
}: {
  controls: Controls;
  effectsActive: boolean;
}) {
  const [active, setActive] = useState(false);

  return (
    <FgButton
      clickFunction={() => {
        controls.handleClosedCaptions();
        setActive((prev) => !prev);
      }}
      contentFunction={() => {
        return (
          <>
            <FgSVG
              src={captionsIcon}
              attributes={[
                { key: "width", value: "36px" },
                { key: "height", value: "36px" },
                { key: "fill", value: "white" },
              ]}
            />
            {active && <div className='caption-button-underline'></div>}
          </>
        );
      }}
      hoverContent={
        !effectsActive ? (
          <div className='mb-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
            Captions (c)
          </div>
        ) : undefined
      }
      className='caption-button flex-col items-center justify-center'
    />
  );
}
