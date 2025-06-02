import React, { useRef, useState, Suspense } from "react";
import { motion } from "framer-motion";

const FgPortal = React.lazy(() => import("../../elements/fgPortal/FgPortal"));

const positionVariants = {
  0: {
    left: "0%",
    right: "",
    transform: "translate(0%, -50%)",
    transition: { duration: 0.175, ease: "linear" },
  },
  1: {
    left: "50%",
    right: "",
    transform: "translate(-50%, -50%)",
    transition: { duration: 0.175, ease: "linear" },
  },
  2: {
    left: "",
    right: "0%",
    transform: "translate(0%, -50%)",
    transition: { duration: 0.175, ease: "linear" },
  },
};

export default function FgTriToggleButton({
  kind = "cycle",
  initPosition = 1,
  stateChangeFunction,
  btnLabels,
  hoverable = false,
}: {
  kind?: "tapSelect" | "cycle";
  initPosition?: 0 | 1 | 2;
  stateChangeFunction?: (state: 0 | 1 | 2) => void;
  btnLabels?: [string, string, string];
  hoverable?: boolean;
}) {
  const [btnState, setBtnState] = useState<0 | 1 | 2>(initPosition);
  const [portalVisible, setPortalVisible] = useState(false);
  const [hoveringState, setHoveringState] = useState<0 | 1 | 2>(initPosition);
  const [hovering, setHovering] = useState(false);
  const portalVisibleTimeout = useRef<NodeJS.Timeout | undefined>();
  const hoveringTimeout = useRef<NodeJS.Timeout | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const invisibleBtnThumbRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent) => {
    if (!containerRef.current) {
      return;
    }

    let newBtnState: 0 | 1 | 2 = 0;
    if (kind === "tapSelect") {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const clickX = event.clientX - container.getBoundingClientRect().left; // Get click position relative to container

      if (clickX < containerWidth / 3) {
        if (btnState !== 0) {
          newBtnState = 0;
        } else {
          newBtnState = 1;
        }
      } else if (clickX < (2 * containerWidth) / 3) {
        if (btnState !== 1) {
          newBtnState = 1;
        } else {
          newBtnState = 2;
        }
      } else {
        if (btnState !== 2) {
          newBtnState = 2;
        } else {
          newBtnState = 0;
        }
      }
    } else {
      newBtnState = ((btnState + 1) % 3) as 0 | 1 | 2;
    }

    setBtnState(newBtnState);
    if (stateChangeFunction) {
      stateChangeFunction(newBtnState);
    }

    setPortalVisible(true);
    if (portalVisibleTimeout.current === undefined) {
      portalVisibleTimeout.current = setTimeout(() => {
        setPortalVisible(false);
      }, 1500);
    } else {
      clearTimeout(portalVisibleTimeout.current);
      portalVisibleTimeout.current = setTimeout(() => {
        setPortalVisible(false);
      }, 1500);
    }
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const eventX = event.clientX - container.getBoundingClientRect().left; // Get click position relative to container

    if (eventX < containerWidth / 3) {
      if (hoveringState !== 0) {
        setHoveringState(0);
      }
    } else if (eventX < (2 * containerWidth) / 3) {
      if (hoveringState !== 1) {
        setHoveringState(1);
      }
    } else {
      if (hoveringState !== 2) {
        setHoveringState(2);
      }
    }
  };

  const handlePointerEnter = () => {
    if (hoveringTimeout.current !== undefined) {
      return;
    }

    hoveringTimeout.current = setTimeout(() => {
      setHovering(true);
    }, 2000);
  };

  const handlePointerLeave = () => {
    setHovering(false);

    if (hoveringTimeout.current) {
      clearTimeout(hoveringTimeout.current);
      hoveringTimeout.current = undefined;
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full cursor-pointer items-center justify-center rounded-full border-2 border-fg-off-white bg-fg-tone-black-4"
      onClick={handleClick}
      onPointerMove={hoverable ? handlePointerMove : undefined}
      onPointerEnter={hoverable ? handlePointerEnter : undefined}
      onPointerLeave={hoverable ? handlePointerLeave : undefined}
    >
      <div
        className="relative"
        style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }}
      >
        <motion.div
          className={`absolute top-1/2 aspect-square h-full rounded-full border-2 border-fg-red-dark bg-fg-red ${
            btnState === 0
              ? "bg-fg-red bg-opacity-90"
              : btnState === 1
                ? "bg-fg-red"
                : "bg-fg-red-light"
          }`}
          initial={false}
          variants={positionVariants}
          animate={`${btnState}`}
        />
        <div
          ref={invisibleBtnThumbRef}
          className="absolute top-1/2 aspect-square h-full rounded-full opacity-0"
          style={{
            left: btnState === 0 ? "0%" : btnState === 1 ? "50%" : "",
            right: btnState === 0 ? "" : btnState === 1 ? "" : "0%",
            transform:
              btnState === 0
                ? "translate(0%, -40%)"
                : btnState === 1
                  ? "translate(-50%, -40%)"
                  : "translate(0%, -40%)",
          }}
        />
        {(portalVisible || hovering) && (
          <Suspense fallback={<div>Loading...</div>}>
            <FgPortal
              type={portalVisible ? "below" : "mouse"}
              mouseType="bottomRight"
              content={
                <div className="text-md relative bottom-0 mb-1 w-max rounded-md bg-fg-white px-2 py-1 font-K2D text-fg-tone-black-1 shadow-lg">
                  {portalVisible
                    ? btnLabels && btnLabels[btnState]
                    : btnLabels && btnLabels[hoveringState]}
                </div>
              }
              externalRef={invisibleBtnThumbRef}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
