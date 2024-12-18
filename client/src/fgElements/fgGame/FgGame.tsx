import React, { useState, useRef, useEffect } from "react";
import { Transition, Variants, motion } from "framer-motion";
import FgGameController from "./lib/FgGameController";
import FgGameAdjustmentButtons from "./lib/FgGameAdjustmentButtons";
import ControlButtons from "./lib/ControlButtons";
import PlayersSection from "./lib/playersSection/PlayersSection";
import EndGameButton from "./EndGameButton";

const GameTransition: Transition = {
  transition: {
    opacity: { duration: 0.15 },
  },
};

export default function FgGame({
  bundleRef,
  content,
  gameFunctionsSection,
  initPosition = { x: 0, y: 0 },
  resizeCallback,
  focusCallback,
  closeCallback,
  backgroundColor = "#ffffff",
  secondaryBackgroundColor = "#f3f3f3",
}: {
  bundleRef: React.RefObject<HTMLDivElement>;
  content?: React.ReactNode;
  gameFunctionsSection?: React.ReactNode;
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
  closeCallback?: () => void;
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

  const [_, setRerender] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const positioning = useRef<{
    position: { left: number; top: number };
    scale: { x: number; y: number };
    rotation: number;
  }>({
    position: { left: 32.5, top: 32.5 },
    scale: { x: 35, y: 35 },
    rotation: 0,
  });
  const [focus, setFocus] = useState(true);
  const [focusClicked, setFocusClicked] = useState(true);
  const [_adjustingDimensions, setAdjustingDimensions] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const resizingDirection = useRef<"se" | "sw" | "nw" | "ne" | undefined>(
    undefined
  );

  const fgGameController = new FgGameController(
    setFocus,
    setFocusClicked,
    gameRef,
    closeCallback
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
    if (closeCallback && isHover) {
      document.addEventListener("keydown", fgGameController.handleKeyDown);
    }

    return () => {
      if (closeCallback && isHover) {
        document.removeEventListener("keydown", fgGameController.handleKeyDown);
      }
    };
  }, [isHover]);

  useEffect(() => {
    document.addEventListener("mousedown", fgGameController.handleGameClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        fgGameController.handleGameClick
      );
    };
  }, []);

  if (focusCallback) {
    useEffect(() => {
      focusCallback(focus);
    }, [focus]);
  }

  return (
    <motion.div
      ref={gameRef}
      onMouseEnter={() => {
        setFocus(true);
      }}
      onMouseLeave={() => {
        if (!focusClicked) {
          setFocus(false);
        }
      }}
      onHoverEnd={closeCallback && (() => setIsHover(false))}
      onHoverStart={closeCallback && (() => setIsHover(true))}
      className={`${
        focusClicked ? "z-[50]" : focus ? "z-[49]" : "z-0"
      } rounded absolute`}
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
      <div className='absolute right-full bottom-0 flex flex-col items-end justify-between w-max h-full'>
        {gameFunctionsSection}
        <PlayersSection />
      </div>
      <div className='absolute left-0 bottom-full flex items-end justify-between w-full h-max space-x-2'>
        <ControlButtons />
        <EndGameButton />
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
