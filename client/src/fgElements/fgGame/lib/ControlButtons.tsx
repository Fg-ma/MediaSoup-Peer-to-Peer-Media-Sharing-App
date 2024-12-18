import React from "react";
import FgGameButton from "../../fgGameButton/FgGameButton";

export default function ControlButtons() {
  return (
    <div className='flex items-center justify-center w-max h-10 space-x-2 my-2'>
      <FgGameButton
        className='h-full aspect-square'
        hoverContent={
          <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
            Start (p)
          </div>
        }
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
        hoverContent={
          <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
            Join game (j)
          </div>
        }
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
        hoverContent={
          <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
            Leave game (l)
          </div>
        }
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
