import React, { useRef } from "react";
import "./lib/fgGameButtonStyles.css";

export default function FgGameButton() {
  const movingPartRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    if (!movingPartRef.current) {
      return;
    }

    document.addEventListener("mouseup", handleMouseUp);

    const classes = movingPartRef.current.classList;

    if (!classes.contains("fg-game-button-clicked-2")) {
      classes.add("fg-game-button-clicked-2");
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp);

    if (!movingPartRef.current) {
      return;
    }

    movingPartRef.current.classList.remove("fg-game-button-clicked-2");
  };

  return (
    <div className='fg-game-button-stationary-rim-2 relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
      <div
        ref={movingPartRef}
        className='fg-game-button-moving-part-2 absolute top-1/2 left-1/2 w-[90%]'
        style={{ backgroundColor: "#3cf599" }}
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
}
