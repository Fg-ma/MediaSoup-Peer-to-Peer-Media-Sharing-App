import React, { useRef, useState } from "react";
import GamePlayerIcon from "./lib/GamePlayerIcon";

export default function PlayersSection() {
  const [isHover, setIsHover] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = () => {
    setIsHover(true);
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = undefined;
    }
  };

  const handleMouseLeave = () => {
    if (!hoverTimeout.current) {
      hoverTimeout.current = setTimeout(() => {
        setIsHover(false);
      }, 750);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center h-max space-y-2 px-2 ${
        isHover ? "w-[4.5rem]" : "w-16"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHover && (
        <>
          <GamePlayerIcon
            primaryColor='red'
            secondaryColor='blue'
            shadowColor={{ r: 0, g: 0, b: 0 }}
          />
          <GamePlayerIcon
            primaryColor='red'
            secondaryColor='blue'
            shadowColor={{ r: 0, g: 0, b: 0 }}
          />
          <GamePlayerIcon
            primaryColor='red'
            secondaryColor='blue'
            shadowColor={{ r: 0, g: 0, b: 0 }}
          />
          <GamePlayerIcon
            primaryColor='red'
            secondaryColor='blue'
            shadowColor={{ r: 0, g: 0, b: 0 }}
          />
        </>
      )}
      <GamePlayerIcon
        primaryColor='red'
        secondaryColor='blue'
        shadowColor={{ r: 0, g: 0, b: 0 }}
      />
    </div>
  );
}
