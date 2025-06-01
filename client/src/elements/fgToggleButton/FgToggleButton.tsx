import React, { useRef, useState, Suspense } from "react";
import { motion } from "framer-motion";

const FgPortal = React.lazy(() => import("../../elements/fgPortal/FgPortal"));

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
          className={`absolute top-1/2 aspect-square h-full rounded-full border-2 border-fg-red-dark ${
            btnState === 0 ? "bg-fg-red" : "bg-fg-red-light"
          }`}
          initial={false}
          variants={positionVariants}
          animate={`${btnState}`}
        />
        {(portalVisible || hovering) && (
          <Suspense fallback={<div>Loading...</div>}>
            <FgPortal
              type="above"
              content={
                <div className="text-md relative bottom-0 mb-1 w-max rounded-md bg-white px-2 py-1 font-K2D text-black shadow-lg">
                  {portalVisible
                    ? btnLabels && btnLabels[btnState]
                    : btnLabels && btnLabels[hoveringState]}
                </div>
              }
              externalRef={containerRef}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
