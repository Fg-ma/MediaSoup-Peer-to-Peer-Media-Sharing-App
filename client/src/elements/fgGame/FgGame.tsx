import React, { useState, useRef, useEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
import FgContentAdjustmentController from "../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
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

const GameVar: Variants = {
  init: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 100 },
      backgroundColor: { duration: 0.3, ease: "linear" },
    },
  },
};

export default function FgGame({
  gameId,
  gameStarted,
  sharedBundleRef,
  content,
  gameFunctionsSection,
  players,
  resizeCallback,
  startGameFunction,
  joinGameFunction,
  leaveGameFunction,
  closeGameFunction,
  popupRefs,
  initPosition = { x: 0, y: 0 },
}: {
  gameId: string;
  gameStarted: boolean;
  sharedBundleRef: React.RefObject<HTMLDivElement>;
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
  resizeCallback?: () => void;
  startGameFunction?: () => void;
  joinGameFunction?: () => void;
  leaveGameFunction?: () => void;
  closeGameFunction?: () => void;
  popupRefs?: React.RefObject<HTMLElement>[];
  initPosition?: {
    x?: number;
    y?: number;
    referenceElement?: HTMLElement;
    placement?: "above" | "below" | "left" | "right";
    padding?: number;
    relativeToBoundaries?: "center";
  };
}) {
  const { table_id, username, instance } = useUserInfoContext();
  const { userDataStreams, remoteDataStreams } = useMediaContext();
  const { mediasoupSocket } = useSocketContext();

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
  const [hideControls, setHideControls] = useState(true);
  const [adjustingDimensions, setAdjustingDimensions] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const panBtnRef = useRef<HTMLButtonElement>(null);
  const isResizing = useRef(false);
  const resizingDirection = useRef<"se" | "sw" | "nw" | "ne" | undefined>(
    undefined
  );
  const pointerLeaveHideControlsTimeout = useRef<NodeJS.Timeout | undefined>(
    undefined
  );
  const pointerStillHideControlsTimeout = useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const fgContentAdjustmentController = new FgContentAdjustmentController(
    sharedBundleRef,
    positioning,
    setAdjustingDimensions,
    setRerender
  );

  const fgGameController = new FgGameController(
    mediasoupSocket,
    table_id,
    gameId,
    hideControls,
    gameStarted,
    setHideControls,
    pointerLeaveHideControlsTimeout,
    pointerStillHideControlsTimeout,
    gameRef,
    closeGameFunction,
    startGameFunction,
    joinGameFunction,
    leaveGameFunction,
    remoteDataStreams,
    positioningListeners,
    positioning,
    setRerender,
    sharedBundleRef,
    panBtnRef,
    fgContentAdjustmentController,
    popupRefs
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
    mediasoupSocket.current?.addMessageListener(fgGameController.handleMessage);

    mediasoupSocket.current?.sendMessage({
      type: "requestGameCatchUpData",
      header: {
        table_id: table_id.current,
        inquiringUsername: username.current,
        inquiringInstance: instance.current,
        gameId: gameId,
      },
    });

    fgGameController.attachPositioningListeners();

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener()
        )
      );
      mediasoupSocket.current?.removeMessageListener(
        fgGameController.handleMessage
      );
    };
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", fgGameController.handleKeyDown);

    return () => {
      document.removeEventListener("keydown", fgGameController.handleKeyDown);
    };
  }, [hideControls]);

  useEffect(() => {
    if (popupRefs) {
      for (const ref of popupRefs) {
        if (!ref.current) {
          continue;
        }

        ref.current.addEventListener(
          "pointerenter",
          fgGameController.handlePointerEnter
        );
        ref.current.addEventListener(
          "pointerleave",
          fgGameController.handlePointerLeave
        );
      }
    }

    return () => {
      if (popupRefs) {
        for (const ref of popupRefs) {
          if (!ref.current) {
            continue;
          }

          ref.current.removeEventListener(
            "pointerenter",
            fgGameController.handlePointerEnter
          );
          ref.current.removeEventListener(
            "pointerleave",
            fgGameController.handlePointerLeave
          );
        }
      }
    };
  }, [popupRefs]);

  useEffect(() => {
    if (
      adjustingDimensions &&
      userDataStreams.current.positionScaleRotation?.readyState === "open"
    ) {
      userDataStreams.current.positionScaleRotation?.send(
        JSON.stringify({
          table_id: table_id.current,
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
      onPointerEnter={fgGameController.handlePointerEnter}
      onPointerLeave={fgGameController.handlePointerLeave}
      onPointerMove={fgGameController.handlePointerMove}
      className={`fg-game ${hideControls ? "z-[5] cursor-none" : "z-[49]"} ${
        hideControls ? "hide-controls" : ""
      } rounded absolute pointer-events-auto`}
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
          userPlaying={players?.user === undefined ? false : true}
          playerCount={
            (players?.players.length ?? 0) +
            (players?.user === undefined ? 0 : 1)
          }
        />
        <EndGameButton closeGameFunction={closeGameFunction} />
      </div>
      {content}
      <FgGameAdjustmentButtons
        sharedBundleRef={sharedBundleRef}
        panBtnRef={panBtnRef}
        fgContentAdjustmentController={fgContentAdjustmentController}
        positioning={positioning}
      />
    </motion.div>
  );
}
