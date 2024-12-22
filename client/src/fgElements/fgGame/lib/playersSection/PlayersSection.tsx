import React, { useEffect, useRef, useState } from "react";
import GamePlayerIcon from "./lib/GamePlayerIcon";

export default function PlayersSection({
  players,
}: {
  players?: {
    user?: {
      primaryColor?: string;
      secondaryColor?: string;
      shadowColor?: { r: number; g: number; b: number };
    };
    players: {
      primaryColor?: string;
      secondaryColor?: string;
      shadowColor?: { r: number; g: number; b: number };
    }[];
  };
}) {
  const [isHover, setIsHover] = useState(false);
  const playersSectionRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!isHover || !playersSectionRef.current) {
      return;
    }

    playersSectionRef.current.scrollTop =
      playersSectionRef.current.scrollHeight;
  }, [isHover]);

  return (
    <div
      ref={playersSectionRef}
      className='hide-scroll-bar overflow-y-auto z-10 w-full py-2 min-h-14'
    >
      <div
        className='flex flex-col items-center justify-end w-full h-max space-y-2 px-2'
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onWheel={(event) => {
          event.stopPropagation();
        }}
      >
        {isHover &&
          players &&
          players.players.map((player, index) => {
            if (index !== 0 || players.user !== undefined) {
              return (
                <GamePlayerIcon
                  key={index}
                  primaryColor={player.primaryColor}
                  secondaryColor={player.secondaryColor}
                  shadowColor={player.shadowColor}
                />
              );
            }
          })}
        {players &&
          (players.user ? (
            <GamePlayerIcon
              primaryColor={players.user.primaryColor}
              secondaryColor={players.user.secondaryColor}
              shadowColor={players.user.shadowColor}
            />
          ) : (
            players.players[0] && (
              <GamePlayerIcon
                primaryColor={players.players[0].primaryColor}
                secondaryColor={players.players[0].secondaryColor}
                shadowColor={players.players[0].shadowColor}
              />
            )
          ))}
      </div>
    </div>
  );
}
