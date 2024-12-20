import React from "react";
import FgButton from "../../fgButton/FgButton";
import FgSVG from "../../fgSVG/FgSVG";

import closeIcon from "../../../../public/svgs/closeIcon.svg";

export default function EndGameButton({
  closeGameFunction,
}: {
  closeGameFunction?: () => void;
}) {
  return (
    <FgButton
      className='h-full aspect-square rounded flex items-end justify-end py-2 pr-2'
      clickFunction={closeGameFunction}
      contentFunction={() => (
        <FgSVG
          className='flex items-center justify-center h-full max-h-8 aspect-square'
          src={closeIcon}
          attributes={[
            { key: "width", value: "80%" },
            { key: "height", value: "80%" },
            { key: "stroke", value: "white" },
            { key: "fill", value: "white" },
          ]}
        />
      )}
    />
  );
}
