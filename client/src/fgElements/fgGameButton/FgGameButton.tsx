import React, { useEffect, useRef } from "react";
import "./lib/fgGameButtonStyles.css";
import FgButton from "../fgButton/FgButton";

const defaultFgGameButtonOptions = {
  primaryColor: "#3cf599",
  secondaryColor: "#00e359",
  hoverTimeoutDuration: 0,
  hoverType: undefined,
  hoverSpacing: undefined,
};

export default function FgGameButton({
  className,
  clickFunction,
  hoverContent,
  options,
}: {
  className?: string;
  clickFunction?: (event: React.MouseEvent) => void;
  hoverContent?: React.ReactElement;
  options?: {
    primaryColor?: string;
    secondaryColor?: string;
    hoverTimeoutDuration?: number;
    hoverType?: "above" | "below" | "left" | "right" | undefined;
    hoverSpacing?: number;
  };
}) {
  const fgGameButtonOptions = { ...defaultFgGameButtonOptions, ...options };

  const rimRef = useRef<HTMLDivElement>(null);
  const movingPartRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = () => {
    if (!movingPartRef.current) {
      return;
    }

    document.addEventListener("pointerup", handlePointerUp);

    const classes = movingPartRef.current.classList;

    if (!classes.contains("fg-game-button-clicked")) {
      classes.add("fg-game-button-clicked");
    }
  };

  const handlePointerUp = () => {
    document.removeEventListener("pointerup", handlePointerUp);

    if (!movingPartRef.current) {
      return;
    }

    movingPartRef.current.classList.remove("fg-game-button-clicked");
  };

  useEffect(() => {
    rimRef.current?.style.setProperty(
      "--primary-color",
      `${fgGameButtonOptions.primaryColor}`
    );
    rimRef.current?.style.setProperty(
      "--secondary-color",
      `${fgGameButtonOptions.secondaryColor}`
    );
  }, []);

  return (
    <FgButton
      className={className}
      clickFunction={clickFunction}
      hoverContent={hoverContent}
      contentFunction={() => (
        <div
          ref={rimRef}
          className='fg-game-button-stationary-rim w-full h-full relative'
          onPointerDown={handlePointerDown}
        >
          <div
            ref={movingPartRef}
            className='fg-game-button-moving-part absolute top-1/2 left-1/2 w-[90%]'
          ></div>
        </div>
      )}
      options={{
        hoverTimeoutDuration: fgGameButtonOptions.hoverTimeoutDuration,
        hoverType: fgGameButtonOptions.hoverType,
        hoverZValue: 1000000,
        hoverSpacing: fgGameButtonOptions.hoverSpacing,
      }}
    />
  );
}
