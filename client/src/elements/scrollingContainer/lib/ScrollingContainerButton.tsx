import React, { useState, ReactNode } from "react";

export default function ScrollingContainerButton({
  initActivity = false,
  externalValue,
  content,
  id,
  callbackFunction,
  backgroundColor = "#3e3e3e",
}: {
  initActivity?: boolean;
  externalValue?: boolean;
  content: ReactNode;
  id?: string;
  callbackFunction?: (active: boolean, id?: string) => void;
  backgroundColor?: string;
}) {
  const [active, setActive] = useState(initActivity);

  return (
    <button
      className={`scrolling-container-button ${
        externalValue !== undefined
          ? externalValue
            ? "selected"
            : ""
          : active
            ? "selected"
            : ""
      } w-max rounded px-5 pb-2 font-K2D text-lg text-fg-off-white shadow`}
      style={{ backgroundColor: backgroundColor }}
      onClick={() => {
        setActive((prev) => !prev);

        if (callbackFunction) {
          callbackFunction(!active, id);
        }
      }}
    >
      {content}
      <div className="scrolling-container-button-underline h-0.5 w-full rounded-full"></div>
    </button>
  );
}
