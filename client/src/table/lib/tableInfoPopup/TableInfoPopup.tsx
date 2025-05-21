import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, Transition, Variants, motion } from "framer-motion";
import { useSignalContext } from "../../../context/signalContext/SignalContext";
import {
  GeneralSignals,
  onTableInfoSignalType,
} from "../../../context/signalContext/lib/typeConstant";

const TableInfoPopupVar: Variants = {
  init: { opacity: 0, scale: 0.8, top: 0 },
  animate: {
    opacity: 1,
    scale: 1,
    top: 20,
    transition: {
      scale: { type: "spring", stiffness: 100 },
    },
  },
};

const TableInfoPopupTransition: Transition = {
  transition: {
    opacity: { duration: 0.001 },
    scale: { duration: 0.001 },
    top: { duration: 0.001 },
  },
};

export default function TableInfoPopup() {
  const { addGeneralSignalListener, removeGeneralSignalListener } =
    useSignalContext();

  const [visible, setVisible] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const visiblityTimeout = useRef<NodeJS.Timeout | undefined>();

  const onTableInfoSignal = (signal: onTableInfoSignalType) => {
    const { message, timeout } = signal.data;

    setVisible(true);
    setInfoMessage(message);

    visiblityTimeout.current = setTimeout(() => {
      setVisible(false);
      setInfoMessage("");
    }, timeout);
  };

  const handleSignals = (signal: GeneralSignals) => {
    switch (signal.type) {
      case "tableInfoSignal":
        onTableInfoSignal(signal);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    addGeneralSignalListener(handleSignals);

    return () => {
      removeGeneralSignalListener(handleSignals);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="max-w-4/5 pointer-events-none absolute left-1/2 z-table-info h-max w-max !-translate-x-1/2 select-none rounded-lg bg-fg-white px-8 py-2 font-K2D text-2xl"
          variants={TableInfoPopupVar}
          initial={"init"}
          animate={"animate"}
          exit={"init"}
          transition={TableInfoPopupTransition}
        >
          {infoMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
