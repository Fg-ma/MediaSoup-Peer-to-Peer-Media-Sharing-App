import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSignalContext } from "../../context/signalContext/SignalContext";

export default function SidePanelDragger({
  setTableSidePanelWidth,
  tablePanelRef,
}: {
  setTableSidePanelWidth: React.Dispatch<React.SetStateAction<number>>;
  tablePanelRef: React.RefObject<HTMLDivElement>;
}) {
  const { sendGroupSignal } = useSignalContext();

  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleDividerPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();

    document.addEventListener("pointerup", handleDividerPointerUp);
    document.addEventListener("pointermove", handleDividerPointerMove);

    setDragging(true);
  };

  const handleDividerPointerMove = (event: PointerEvent) => {
    const box = tablePanelRef.current?.getBoundingClientRect();
    setTableSidePanelWidth(event.clientX - (box?.left ?? 0) - 16);

    sendGroupSignal({ type: "groupUpdate" });
  };

  const handleDividerPointerUp = () => {
    document.removeEventListener("pointerup", handleDividerPointerUp);
    document.removeEventListener("pointermove", handleDividerPointerMove);

    setDragging(false);
  };

  return (
    <div
      className={`${dragging ? "cursor-pointer" : ""} flex h-full !w-7 items-center justify-center`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <AnimatePresence>
        {(hover || dragging) && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{
              opacity: 1,
              height: dragging ? "97.5%" : "95%",
              width: dragging ? "0.5rem" : "0.25rem",
            }}
            whileHover={{
              height: "97.5%",
              width: "0.5rem",
            }}
            exit={{ opacity: 0, scaleX: 0.8 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer rounded-full bg-fg-off-white"
            onPointerDown={handleDividerPointerDown}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
