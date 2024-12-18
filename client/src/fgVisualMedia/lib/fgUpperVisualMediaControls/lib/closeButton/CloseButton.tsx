import React from "react";
import FgButton from "../../../../../fgElements/fgButton/FgButton";
import FgSVG from "../../../../../fgElements/fgSVG/FgSVG";
import FgHoverContentStandard from "../../../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";
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
      hoverContent={<FgHoverContentStandard content='Close (x)' />}
      className='flex items-center justify-end w-10 aspect-square pointer-events-auto'
      options={{ hoverType: "below" }}
    />
  );
}
