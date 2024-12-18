import React from "react";
import FgGameButton from "../../fgGameButton/FgGameButton";
import FgHoverContentStandard from "../../../fgElements/fgHoverContentStandard/FgHoverContentStandard";

export default function ControlButtons() {
  return (
    <div className='flex items-center justify-center w-max h-10 space-x-2 my-2'>
      <FgGameButton
        className='h-full aspect-square'
        hoverContent={<FgHoverContentStandard content='Start (p)' />}
        options={{
          primaryColor: "#3cf599",
          secondaryColor: "#00e359",
          hoverTimeoutDuration: 750,
          hoverType: "left",
          hoverSpacing: 4,
        }}
      />
      <FgGameButton
        className='h-full aspect-square'
        hoverContent={<FgHoverContentStandard content='Join game (j)' />}
        options={{
          primaryColor: "#3991ff",
          secondaryColor: "#095dcc",
          hoverTimeoutDuration: 750,
          hoverType: "left",
          hoverSpacing: 4,
        }}
      />
      <FgGameButton
        className='h-full aspect-square'
        hoverContent={<FgHoverContentStandard content='Leave game (l)' />}
        options={{
          primaryColor: "#fd473c",
          secondaryColor: "#e11008",
          hoverTimeoutDuration: 750,
          hoverType: "left",
          hoverSpacing: 4,
        }}
      />
    </div>
  );
}
