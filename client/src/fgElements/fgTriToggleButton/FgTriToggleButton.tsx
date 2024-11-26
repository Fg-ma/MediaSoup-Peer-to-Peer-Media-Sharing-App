import React, { useRef, useState, Suspense } from "react";
import { motion } from "framer-motion";

const FgPortal = React.lazy(() => import("../../fgElements/fgPortal/FgPortal"));

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

  const handleMouseMove = (event: React.MouseEvent) => {
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

  const handleMouseEnter = () => {
    if (hoveringTimeout.current !== undefined) {
      return;
    }

    hoveringTimeout.current = setTimeout(() => {
      setHovering(true);
    }, 2000);
  };

  const handleMouseLeave = () => {
    setHovering(false);

    if (hoveringTimeout.current) {
      clearTimeout(hoveringTimeout.current);
      hoveringTimeout.current = undefined;
    }
  };

  return (
    <div
      ref={containerRef}
      className='w-full h-full bg-fg-white-95 border-2 border-fg-white-85 rounded-full flex items-center justify-center cursor-pointer'
      onClick={handleClick}
      onMouseMove={hoverable ? handleMouseMove : undefined}
      onMouseEnter={hoverable ? handleMouseEnter : undefined}
      onMouseLeave={hoverable ? handleMouseLeave : undefined}
    >
      <div
        className='relative'
        style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }}
      >
        <motion.div
          className={`rounded-full h-full aspect-square absolute top-1/2 border-2 border-fg-primary ${
            btnState === 0
              ? "bg-fg-primary-desaturated-2"
              : btnState === 1
              ? "bg-fg-primary-desaturated"
              : "bg-fg-primary"
          }`}
          initial={false}
          variants={positionVariants}
          animate={`${btnState}`}
        />
        <div
          ref={invisibleBtnThumbRef}
          className='rounded-full h-full aspect-square absolute top-1/2 opacity-0'
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
              mouseType='bottomRight'
              content={
                <div className='mb-1 w-max py-1 px-2 text-black font-K2D text-md bg-white shadow-lg rounded-md relative bottom-0'>
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
