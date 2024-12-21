import React, { useState, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Transition, Variants, motion } from "framer-motion";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import FgGameController from "./lib/FgGameController";
import FgGameAdjustmentButtons from "./lib/FgGameAdjustmentButtons";
import ControlButtons from "./lib/ControlButtons";
import PlayersSection from "./lib/playersSection/PlayersSection";
import EndGameButton from "./lib/EndGameButton";
import "./lib/fgGame.css";

const GameTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

export default function FgGame({
  socket,
  table_id,
  username,
  instance,
  gameId,
  gameStarted,
  bundleRef,
  content,
  gameFunctionsSection,
  players,
  initPosition = { x: 0, y: 0 },
  resizeCallback,
  focusCallback,
  startGameFunction,
  joinGameFunction,
  leaveGameFunction,
  closeGameFunction,
  backgroundColor = "#ffffff",
  secondaryBackgroundColor = "#f3f3f3",
}: {
  socket: React.MutableRefObject<Socket>;
  table_id: string;
  username: string;
  instance: string;
  gameId: string;
  gameStarted: boolean;
  bundleRef: React.RefObject<HTMLDivElement>;
  content?: React.ReactNode;
  gameFunctionsSection?: React.ReactNode;
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
  initPosition?: {
    x?: number;
    y?: number;
    referenceElement?: HTMLElement;
    placement?: "above" | "below" | "left" | "right";
    padding?: number;
    relativeToBoundaries?: "center";
  };
  resizeCallback?: () => void;
  focusCallback?: (focus: boolean) => void;
  startGameFunction?: () => void;
  joinGameFunction?: () => void;
  leaveGameFunction?: () => void;
  closeGameFunction?: () => void;
  backgroundColor?: string;
  secondaryBackgroundColor?: string;
}) {
  const GameVar: Variants = {
    init: { opacity: 0, scale: 0.8 },
    animate: (focus: boolean) => ({
      opacity: 1,
      scale: 1,
      backgroundColor: focus ? backgroundColor : secondaryBackgroundColor,
      transition: {
        scale: { type: "spring", stiffness: 100 },
        backgroundColor: { duration: 0.3, ease: "linear" },
      },
    }),
  };

  const { userDataStreams, remoteDataStreams } = useMediaContext();

  const [_, setRerender] = useState(false);
  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 32.5, top: 32.5 },
    scale: { x: 35, y: 35 },
    rotation: 0,
  });
  const positioningListeners = useRef<{
    [username: string]: {
      [instance: string]: () => void;
    };
  }>({});
  const [focus, setFocus] = useState(true);
  const [hideControls, setHideControls] = useState(true);
  const [focusClicked, setFocusClicked] = useState(true);
  const [adjustingDimensions, setAdjustingDimensions] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const resizingDirection = useRef<"se" | "sw" | "nw" | "ne" | undefined>(
    undefined
  );
  const mouseLeaveHideControlsTimeout = useRef<NodeJS.Timeout | undefined>(
    undefined
  );
  const mouseStillHideControlsTimeout = useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const fgGameController = new FgGameController(
    socket,
    table_id,
    gameId,
    gameStarted,
    setFocus,
    setFocusClicked,
    focusClicked,
    setHideControls,
    mouseLeaveHideControlsTimeout,
    mouseStillHideControlsTimeout,
    gameRef,
    closeGameFunction,
    startGameFunction,
    remoteDataStreams,
    positioningListeners,
    positioning,
    setRerender
  );

  useEffect(() => {
    if (
      !initPosition.referenceElement ||
      !initPosition.placement ||
      !gameRef.current
    ) {
      return;
    }

    const referenceRect = initPosition.referenceElement.getBoundingClientRect();

    let top: number;
    if (initPosition.placement === "above") {
      top = referenceRect.top - gameRef.current.clientHeight;

      if (initPosition.padding) {
        top -= initPosition.padding;
      }
    } else if (initPosition.placement === "below") {
      top = referenceRect.bottom;

      if (initPosition.padding) {
        top += initPosition.padding;
      }
    } else {
      top =
        referenceRect.top +
        referenceRect.height / 2 -
        gameRef.current.clientHeight / 2;
    }

    let left: number;
    if (initPosition.placement === "left") {
      left = referenceRect.left - gameRef.current.clientWidth;

      if (initPosition.padding) {
        left -= initPosition.padding;
      }
    } else if (initPosition.placement === "right") {
      left = referenceRect.right;

      if (initPosition.padding) {
        left += initPosition.padding;
      }
    } else {
      left =
        referenceRect.left +
        referenceRect.width / 2 -
        gameRef.current.clientWidth / 2;
    }

    positioning.current.position = { left: left, top: top };
  }, [
    initPosition.referenceElement,
    initPosition.placement,
    initPosition.padding,
  ]);

  useEffect(() => {
    if (isResizing.current && resizingDirection.current) {
      document.body.style.cursor = `${resizingDirection.current}-resize`;
    } else {
      document.body.style.cursor = "";
    }
  }, [isResizing.current]);

  useEffect(() => {
    if (resizeCallback) {
      resizeCallback();
    }
  }, [positioning.current.scale]);

  useEffect(() => {
    socket.current.on("message", fgGameController.handleMessage);

    const msg = {
      type: "requestGameCatchUpData",
      table_id: table_id,
      inquiringUsername: username,
      inquiringInstance: instance,
      gameId: gameId,
    };
    socket.current.send(msg);

    fgGameController.attachPositioningListeners();

    document.addEventListener("keydown", fgGameController.handleKeyDown);

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener()
        )
      );
      socket.current.off("message", fgGameController.handleMessage);
      document.removeEventListener("keydown", fgGameController.handleKeyDown);
    };
  }, []);

  if (focusCallback) {
    useEffect(() => {
      focusCallback(focus);
    }, [focus]);
  }

  useEffect(() => {
    if (
      adjustingDimensions &&
      userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          table_id,
          gameId,
          type: "games",
          positioning: positioning.current,
        })
      );
    }
  }, [positioning.current]);

  return (
    <motion.div
      ref={gameRef}
      onMouseEnter={fgGameController.handleMouseEnter}
      onMouseLeave={fgGameController.handleMouseLeave}
      onMouseMove={fgGameController.handleMouseMove}
      onMouseDown={fgGameController.handleGameClick}
      className={`fg-game ${
        focusClicked ? "z-[50]" : focus ? "z-[49]" : "z-0"
      } ${hideControls ? "hide-controls" : ""} rounded absolute`}
      style={{
        left: `${positioning.current.position.left}%`,
        top: `${positioning.current.position.top}%`,
        width: `${Math.max(
          positioning.current.scale.x,
          positioning.current.scale.y
        )}%`,
        height: `${Math.max(
          positioning.current.scale.x,
          positioning.current.scale.y
        )}%`,
        rotate: `${positioning.current.rotation}deg`,
        transformOrigin: "0% 0%",
      }}
      custom={focus}
      variants={GameVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={GameTransition}
    >
      <div className='fg-game-left-controls-section absolute right-full bottom-0 flex flex-col items-end justify-between w-[15%] min-w-14 max-w-24 h-full'>
        <div className='w-full h-max z-20'>{gameFunctionsSection}</div>
        <PlayersSection players={players} />
      </div>
      <div className='fg-game-top-controls-section absolute left-0 bottom-full flex items-center justify-between w-full h-[15%] min-h-10 max-h-16 space-x-2 overflow-x-auto'>
        <ControlButtons
          startGameFunction={startGameFunction}
          joinGameFunction={joinGameFunction}
          leaveGameFunction={leaveGameFunction}
        />
        <EndGameButton closeGameFunction={closeGameFunction} />
      </div>
      {content}
      <FgGameAdjustmentButtons
        bundleRef={bundleRef}
        positioning={positioning}
        setAdjustingDimensions={setAdjustingDimensions}
        setRerender={setRerender}
      />
    </motion.div>
  );
}
