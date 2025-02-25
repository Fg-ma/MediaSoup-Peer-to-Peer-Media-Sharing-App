import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "./typeConstant";

export default function LineNumbers({
  text,
  settings,
  textAreaRef,
  expandLineNumbersButtonRef,
  lineNumbersRef,
}: {
  text: React.MutableRefObject<string>;
  settings: Settings;
  textAreaRef: React.RefObject<HTMLPreElement>;
  expandLineNumbersButtonRef: React.RefObject<HTMLButtonElement>;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const [numLines, setNumLines] = useState(1);
  const [maxDigits, setMaxDigits] = useState(1);

  const [_, setRerender] = useState(false);

  const handleInput = () => {
    if (!textAreaRef.current) return;
    text.current = textAreaRef.current.innerText;
    setRerender((prev) => !prev);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    event.stopPropagation();
    setRerender((prev) => !prev);
  };

  const handleClick = (event: React.PointerEvent | PointerEvent) => {
    event.preventDefault();
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.addEventListener("keydown", handleKeyDown);
      textAreaRef.current.addEventListener("input", handleInput);
    }

    if (expandLineNumbersButtonRef.current) {
      expandLineNumbersButtonRef.current.addEventListener(
        "pointerdown",
        handleClick
      );
    }

    return () => {
      if (textAreaRef.current) {
        textAreaRef.current.removeEventListener("keydown", handleKeyDown);
        textAreaRef.current.removeEventListener("input", handleInput);
      }
      if (expandLineNumbersButtonRef.current) {
        expandLineNumbersButtonRef.current.removeEventListener(
          "pointerdown",
          handleClick
        );
      }
    };
  }, [textAreaRef.current, expandLineNumbersButtonRef.current]);

  useEffect(() => {
    if (!textAreaRef.current) return;

    const preElement = textAreaRef.current;
    const computedStyle = window.getComputedStyle(preElement);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const lineCount = Math.floor(preElement.scrollHeight / lineHeight);

    setNumLines(lineCount);
    setMaxDigits(String(lineCount).length);
  }, [text.current, collapsed]);

  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.div
          key='line-numbers'
          ref={lineNumbersRef}
          className='flex h-max flex-col text-right pr-2 cursor-pointer font-B612Mono'
          style={{
            fontSize: settings.fontSize.value,
            lineHeight: `calc(${settings.fontSize.value} + 8px)`,
          }}
          onPointerDown={handleClick}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ type: "tween", duration: 0.3 }}
        >
          {Array.from({ length: numLines }, (_, index) => {
            let numStr = String(index + 1);
            if (numStr.length > 3) {
              numStr = "*" + numStr.slice(-2);
            } else {
              numStr = numStr.padStart(maxDigits, " ");
            }

            return (
              <span
                key={index}
                className='select-none'
                style={{
                  color: settings.colors.indexColor.value,
                }}
                contentEditable={false}
              >
                {"[" + numStr + "]"}
              </span>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
