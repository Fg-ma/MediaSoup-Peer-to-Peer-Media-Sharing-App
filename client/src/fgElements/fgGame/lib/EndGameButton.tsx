import React from "react";
import FgButton from "../../fgButton/FgButton";

export default function EndGameButton({
  closeGameFunction,
}: {
  closeGameFunction?: () => void;
}) {
  return (
    <FgButton
      className='bg-fg-primary h-10 w-16 rounded flex items-center justify-center my-2'
      clickFunction={closeGameFunction}
      contentFunction={() => (
        <div className='font-K2D text-lg select-none'>End</div>
      )}
    />
  );
}
