import React from "react";
import Controls from "../../fgVideoControls/lib/Controls";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";
import closeIcon from "../../../public/svgs/closeIcon.svg";

export default function CloseButton({ controls }: { controls: Controls }) {
  return (
    <FgButton
      clickFunction={() => {
        controls.handleCloseVideo();
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={closeIcon}
            attributes={[
              { key: "width", value: "95%" },
              { key: "height", value: "95%" },
              { key: "fill", value: "white" },
            ]}
          />
        );
      }}
      hoverContent={
        <div className='mt-1 w-max py-1 px-2 text-white font-K2D text-sm bg-black bg-opacity-75 shadow-lg rounded-md relative bottom-0'>
          Close (x)
        </div>
      }
      className='flex items-center justify-center w-10 aspect-square'
      options={{ hoverType: "below" }}
    />
  );
}
