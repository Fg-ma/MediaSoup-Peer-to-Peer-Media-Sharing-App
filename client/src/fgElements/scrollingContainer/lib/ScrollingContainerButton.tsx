import React, { useState, ReactNode } from "react";

export default function ScrollingContainerButton({
  content,
  id,
  callbackFunction,
}: {
  content: ReactNode;
  id?: string;
  callbackFunction?: (active: boolean, id?: string) => void;
}) {
  const [active, setActive] = useState(false);

  return (
    <button
      className={`scrolling-container-button ${
        active ? "selected" : ""
      } font-K2D text-lg bg-fg-white-95 rounded px-5 pb-2 shadow w-max`}
      onClick={() => {
        setActive((prev) => !prev);

        if (callbackFunction) {
          callbackFunction(!active, id);
        }
      }}
    >
      {content}
      <div className='scrolling-container-button-underline h-0.5 w-full rounded-full'></div>
    </button>
  );
}
