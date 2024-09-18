import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { motion, Transition, Variants } from "framer-motion";
import FgButton from "../../fgButton/FgButton";
import ClosedCaptionsPage, {
  closedCaptionsSelections,
} from "./ClosedCaptionsPage";

const SelectionPanelVar: Variants = {
  init: { opacity: 0 },
  animate: { opacity: 1 },
};

const SelectionPanelTransition: Transition = {
  transition: {
    opacity: { duration: 0.025 },
  },
};

export default function SettingsPanel({
  externalRef,
}: {
  externalRef: React.RefObject<HTMLElement>;
}) {
  const [portalPosition, setPortalPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [closedCaptionsActive, setClosedCaptionsActive] = useState(false);
  const [currentCaptionLanguage, setCurrentCaptionLanguage] =
    useState<keyof typeof closedCaptionsSelections>("English");

  useEffect(() => {
    getStaticPanelPosition();
  }, [closedCaptionsActive]);

  const getStaticPanelPosition = () => {
    const externalRect = externalRef?.current?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!externalRect || !panelRef.current) {
      return;
    }

    let top = externalRect.top - panelRef.current?.clientHeight - 8;

    // Check if the panel overflows the top of the viewport
    if (top < 0) {
      top = 0; // Adjust to fit within the top boundary of the viewport
    }

    // Check if the panel overflows the bottom of the viewport
    const panelBottom = top + panelRef.current.clientHeight;
    if (panelBottom > viewportHeight) {
      // Adjust to fit within the bottom boundary of the viewport
      top = viewportHeight - panelRef.current.clientHeight;
    }

    let left =
      externalRect.left +
      externalRect.width / 2 -
      panelRef.current.clientWidth / 2;

    // Check if the panel overflows the left of the viewport
    if (left < 0) {
      left = 0; // Adjust to fit within the left boundary of the viewport
    }

    // Check if the panel overflows the bottom of the viewport
    const panelRight = left + panelRef.current.clientWidth;
    if (panelRight > viewportWidth) {
      // Adjust to fit within the bottom boundary of the viewport
      left = viewportWidth - panelRef.current.clientWidth;
    }

    setPortalPosition({
      top,
      left,
    });
  };

  const handleClosedCaptionsActive = () => {
    setClosedCaptionsActive((prev) => !prev);
  };

  return ReactDOM.createPortal(
    <motion.div
      ref={panelRef}
      className='max-h-60 w-max absolute z-[99999999999999] flex p-2 h-max shadow-md rounded bg-black bg-opacity-75 font-K2D text-lg text-white'
      style={{
        top: `${portalPosition?.top}px`,
        left: `${portalPosition?.left}px`,
      }}
      variants={SelectionPanelVar}
      initial='init'
      animate='animate'
      exit='init'
      transition={SelectionPanelTransition}
    >
      {!closedCaptionsActive && (
        <div className='w-full h-full flex flex-col justify-center items-center space-y-1'>
          <FgButton
            contentFunction={() => (
              <div className='w-full text-nowrap hover:bg-gray-400 flex justify-between space-x-4 px-1 rounded'>
                <div>Subtitles/cc</div>
                <div>{closedCaptionsSelections[currentCaptionLanguage]}</div>
              </div>
            )}
            mouseDownFunction={handleClosedCaptionsActive}
          />
        </div>
      )}
      {closedCaptionsActive && (
        <ClosedCaptionsPage
          currentCaptionLanguage={currentCaptionLanguage}
          setCurrentCaptionLanguage={setCurrentCaptionLanguage}
          setClosedCaptionsActive={setClosedCaptionsActive}
        />
      )}
    </motion.div>,
    document.body
  );
}
