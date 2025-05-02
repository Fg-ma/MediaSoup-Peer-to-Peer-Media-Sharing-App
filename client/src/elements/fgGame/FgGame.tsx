import React, { useState, useRef, useEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import { useMediaContext } from "../../context/mediaContext/MediaContext";
import { useSocketContext } from "../../context/socketContext/SocketContext";
import { useUserInfoContext } from "../../context/userInfoContext/UserInfoContext";
import { useSignalContext } from "../../context/signalContext/SignalContext";
import FgContentAdjustmentController from "../../elements/fgAdjustmentElements/lib/FgContentAdjustmentControls";
import FgGameController from "./lib/FgGameController";
import FgGameAdjustmentButtons from "./lib/FgGameAdjustmentButtons";
import ControlButtons from "./lib/ControlButtons";
import PlayersSection from "./lib/playersSection/PlayersSection";
import EndGameButton from "./lib/EndGameButton";
import "./lib/fgGame.css";
import ReactButton from "../reactButton/ReactButton";

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
  const { mediasoupSocket, tableSocket } = useSocketContext();
  const { addGroupSignalListener, removeGroupSignalListener } =
    useSignalContext();

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
  const [reactionsPanelActive, setReactionsPanelActive] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const panBtnRef = useRef<HTMLButtonElement>(null);
  const isResizing = useRef(false);
  const resizingDirection = useRef<"se" | "sw" | "nw" | "ne" | undefined>(
    undefined,
  );
  const pointerLeaveHideControlsTimeout = useRef<NodeJS.Timeout | undefined>(
    undefined,
  );
  const pointerStillHideControlsTimeout = useRef<NodeJS.Timeout | undefined>(
    undefined,
  );

  const behindEffectsContainerRef = useRef<HTMLDivElement>(null);
  const frontEffectsContainerRef = useRef<HTMLDivElement>(null);

  const fgContentAdjustmentController = useRef<FgContentAdjustmentController>(
    new FgContentAdjustmentController(
      sharedBundleRef,
      positioning,
      setAdjustingDimensions,
      setRerender,
    ),
  );

  const fgGameController = useRef(
    new FgGameController(
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
      popupRefs,
      behindEffectsContainerRef,
      frontEffectsContainerRef,
      tableSocket,
    ),
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
    mediasoupSocket.current?.addMessageListener(
      fgGameController.current.handleMessage,
    );
    tableSocket.current?.addMessageListener(
      fgGameController.current.handleTableMessage,
    );
    addGroupSignalListener(fgGameController.current.handleSignal);

    mediasoupSocket.current?.sendMessage({
      type: "requestGameCatchUpData",
      header: {
        table_id: table_id.current,
        inquiringUsername: username.current,
        inquiringInstance: instance.current,
        gameId: gameId,
      },
    });

    fgGameController.current.attachPositioningListeners();

    return () => {
      Object.values(positioningListeners.current).forEach((userListners) =>
        Object.values(userListners).forEach((removeListener) =>
          removeListener(),
        ),
      );
      mediasoupSocket.current?.removeMessageListener(
        fgGameController.current.handleMessage,
      );
      tableSocket.current?.removeMessageListener(
        fgGameController.current.handleTableMessage,
      );
      removeGroupSignalListener(fgGameController.current.handleSignal);
    };
  }, []);

  useEffect(() => {
    document.addEventListener(
      "keydown",
      fgGameController.current.handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        fgGameController.current.handleKeyDown,
      );
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
          fgGameController.current.handlePointerEnter,
        );
        ref.current.addEventListener(
          "pointerleave",
          fgGameController.current.handlePointerLeave,
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
            fgGameController.current.handlePointerEnter,
          );
          ref.current.removeEventListener(
            "pointerleave",
            fgGameController.current.handlePointerLeave,
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
        }),
      );
    }
  }, [positioning.current]);

  return (
    <motion.div
      ref={gameRef}
      onPointerEnter={fgGameController.current.handlePointerEnter}
      onPointerLeave={fgGameController.current.handlePointerLeave}
      onPointerMove={fgGameController.current.handlePointerMove}
      className={`fg-game ${
        hideControls && !reactionsPanelActive ? "z-[5] cursor-none" : "z-[49]"
      } ${
        hideControls && !reactionsPanelActive ? "hide-controls" : ""
      } pointer-events-auto absolute z-base-content rounded`}
      style={{
        left: `${positioning.current.position.left}%`,
        top: `${positioning.current.position.top}%`,
        width: `${Math.max(
          positioning.current.scale.x,
          positioning.current.scale.y,
        )}%`,
        height: `${Math.max(
          positioning.current.scale.x,
          positioning.current.scale.y,
        )}%`,
        rotate: `${positioning.current.rotation}deg`,
        transformOrigin: "0% 0%",
      }}
      variants={GameVar}
      initial="init"
      animate="animate"
      exit="init"
      transition={GameTransition}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
        <div
          ref={frontEffectsContainerRef}
          className="pointer-events-none relative z-[100] h-full w-full"
        />
      </div>
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
        <div
          ref={behindEffectsContainerRef}
          className="pointer-events-none relative -z-[100] h-full w-full"
        />
      </div>
      <div className="fg-game-left-controls-section absolute bottom-0 right-full flex h-full w-[15%] min-w-14 max-w-24 flex-col items-end justify-between">
        <div className="z-20 h-max w-full">{gameFunctionsSection}</div>
        <PlayersSection players={players} />
      </div>
      <div className="fg-game-top-controls-section absolute bottom-full left-0 flex h-[15%] max-h-16 min-h-10 w-full items-center justify-between space-x-2 overflow-x-auto">
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
        <div className="flex h-full w-max items-end justify-center">
          <div className="aspect-square h-[75%] pb-1">
            <ReactButton
              reactionsPanelActive={reactionsPanelActive}
              setReactionsPanelActive={setReactionsPanelActive}
              clickFunction={() => setReactionsPanelActive((prev) => !prev)}
              reactionFunction={
                fgGameController.current.reactController.handleReaction
              }
            />
          </div>
          <EndGameButton closeGameFunction={closeGameFunction} />
        </div>
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
