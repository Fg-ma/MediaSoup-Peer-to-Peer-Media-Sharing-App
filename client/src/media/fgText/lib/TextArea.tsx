import React from "react";
import { Settings } from "./typeConstant";
import LowerTextController from "./lowerTextControls/LowerTextController";

export default function TextArea({
  lowerTextController,
  text,
  settings,
  textAreaRef,
  isEditing,
  setIsEditing,
  textAreaContainerRef,
}: {
  lowerTextController: LowerTextController;
  text: React.MutableRefObject<string>;
  settings: Settings;
  textAreaRef: React.RefObject<HTMLPreElement>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  textAreaContainerRef: React.RefObject<HTMLDivElement>;
}) {
  const handleEditingPointerDown = (event: React.PointerEvent) => {
    if (
      isEditing &&
      textAreaRef.current &&
      !textAreaRef.current.contains(event.target as Node)
    ) {
      textAreaRef.current.focus();

      setTimeout(() => {
        const range = document.createRange();
        const selection = window.getSelection();
        if (textAreaRef.current) range.selectNodeContents(textAreaRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }, 0);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);

    document.addEventListener(
      "pointerdown",
      lowerTextController.handlePointerDown
    );
  };

  const handleContainerDoubleClick = (event: React.MouseEvent) => {
    if (
      !isEditing &&
      textAreaRef.current &&
      !textAreaRef.current.contains(event.target as Node)
    ) {
      setIsEditing(true);

      document.addEventListener(
        "pointerdown",
        lowerTextController.handlePointerDown
      );

      setTimeout(() => {
        const range = document.createRange();
        const selection = window.getSelection();
        if (textAreaRef.current) range.selectNodeContents(textAreaRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }, 0);
    }
  };

  return (
    <div
      ref={textAreaContainerRef}
      className='grow h-max min-h-full'
      onDoubleClick={handleContainerDoubleClick}
      onPointerDown={handleEditingPointerDown}
    >
      <div className='h-full w-max min-w-full'>
        <pre
          ref={textAreaRef}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onDoubleClick={handleDoubleClick}
          className={`${
            !isEditing ? "cursor-default" : ""
          } min-w-full w-max h-max outline-none font-K2D text-lg`}
          style={{
            color: settings.colors.textColor.value,
            whiteSpace: "pre",
            fontFamily: settings.fontStyle.value,
            fontSize: settings.fontSize.value,
            lineHeight: `calc(${settings.fontSize.value} + ${
              parseInt(settings.fontSize.value.slice(0, -2)) * 0.25
            }px)`,
          }}
        >
          {text.current}
        </pre>
      </div>
    </div>
  );
}
