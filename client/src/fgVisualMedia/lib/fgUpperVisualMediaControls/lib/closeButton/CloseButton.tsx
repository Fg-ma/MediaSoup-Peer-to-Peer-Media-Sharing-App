import React from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgLowerVisualMediaController from "../../../fgLowerVisualMediaControls/lib/FgLowerVisualMediaController";

import closeIcon from "../../../../../../public/svgs/closeIcon.svg";

export default function CloseButton({
  fgLowerVisualMediaController,
}: {
  fgLowerVisualMediaController: FgLowerVisualMediaController;
}) {
  return (
    <FgButton
      clickFunction={() => {
        fgLowerVisualMediaController.handleCloseVideo();
      }}
      contentFunction={() => {
        return (
          <FgSVG
            src={closeIcon}
            attributes={[
              { key: "width", value: "60%" },
              { key: "height", value: "60%" },
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
      className='flex items-center justify-end w-10 aspect-square pointer-events-auto'
      options={{ hoverType: "below" }}
    />
  );
}
