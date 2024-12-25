import React, { useRef, useState, Suspense } from "react";
import { motion } from "framer-motion";

const FgPortal = React.lazy(() => import("../../fgElements/fgPortal/FgPortal"));

const positionVariants = {
  0: {
    left: "0%",
    transform: "translate(0%, -50%)",
    transition: { duration: 0.175, ease: "linear" },
  },
  1: {
    left: "",
    right: "0%",
    transform: "translate(0%, -50%)",
    transition: { duration: 0.175, ease: "linear" },
  },
};

export default function FgToggleButton({
  initPosition = 0,
  stateChangeFunction,
  btnLabels,
  hoverable = false,
}: {
  initPosition?: 0 | 1;
  stateChangeFunction?: (state: 0 | 1) => void;
  btnLabels?: [string, string];
  hoverable?: boolean;
}) {
  const [btnState, setBtnState] = useState<0 | 1>(initPosition);
  const [portalVisible, setPortalVisible] = useState(false);
  const [hoveringState, setHoveringState] = useState<0 | 1>(initPosition);
  const [hovering, setHovering] = useState(false);
  const portalVisibleTimeout = useRef<NodeJS.Timeout | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
  const invisibleBtnThumbRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    const newBtnState = btnState === 0 ? 1 : 0;
    setBtnState(newBtnState);
    stateChangeFunction?.(newBtnState);

    setPortalVisible(true);
    if (portalVisibleTimeout.current) {
      clearTimeout(portalVisibleTimeout.current);
    }
    portalVisibleTimeout.current = setTimeout(() => {
      setPortalVisible(false);
    }, 1500);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!containerRef.current || !hoverable) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const eventX = event.clientX - container.getBoundingClientRect().left;

    const newHoveringState = eventX < containerWidth / 2 ? 0 : 1;
    if (hoveringState !== newHoveringState) {
      setHoveringState(newHoveringState);
    }
  };

  const handlePointerEnter = () => {
    if (!hoverable) return;
    setHovering(true);
  };

  const handlePointerLeave = () => {
    setHovering(false);
  };

  return (
    <div
      ref={containerRef}
      className='w-full h-full bg-fg-white-95 border-2 border-fg-white-85 rounded-full flex items-center justify-center cursor-pointer'
      onClick={handleClick}
      onPointerMove={hoverable ? handlePointerMove : undefined}
      onPointerEnter={hoverable ? handlePointerEnter : undefined}
      onPointerLeave={hoverable ? handlePointerLeave : undefined}
    >
      <div
        className='relative'
        style={{ width: "calc(100% - 4px)", height: "calc(100% - 4px)" }}
      >
        <motion.div
          className={`rounded-full h-full aspect-square absolute top-1/2 border-2 border-fg-primary ${
            btnState === 0 ? "bg-fg-primary-desaturated" : "bg-fg-primary"
          }`}
          initial={false}
          variants={positionVariants}
          animate={`${btnState}`}
        />
        <div
          ref={invisibleBtnThumbRef}
          className='rounded-full h-full aspect-square absolute top-1/2 opacity-0'
          style={{
            left: btnState === 0 ? "0%" : "50%",
            transform:
              btnState === 0 ? "translate(0%, -40%)" : "translate(-50%, -40%)",
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
