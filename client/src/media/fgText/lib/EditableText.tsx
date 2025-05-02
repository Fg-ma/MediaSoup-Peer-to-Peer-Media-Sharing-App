import React, { useRef } from "react";
import { Settings } from "./typeConstant";
import LineNumbers from "./LineNumbers";
import TextArea from "./TextArea";
import LowerTextController from "./lowerTextControls/LowerTextController";

export default function EditableText({
  lowerTextController,
  text,
  settings,
  expandLineNumbersButtonRef,
  lineNumbersRef,
  textAreaRef,
  isEditing,
  setIsEditing,
  textAreaContainerRef,
}: {
  lowerTextController: React.MutableRefObject<LowerTextController>;
  text: React.MutableRefObject<string>;
  settings: Settings;
  expandLineNumbersButtonRef: React.RefObject<HTMLButtonElement>;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
  textAreaRef: React.RefObject<HTMLPreElement>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  textAreaContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      className="small-multidirectional-scroll-bar pointer-events-auto flex h-full w-full overflow-auto px-4 py-3"
      style={{
        backgroundColor: settings.colors.backgroundColor.value,
      }}
    >
      <LineNumbers
        text={text}
        settings={settings}
        textAreaRef={textAreaRef}
        expandLineNumbersButtonRef={expandLineNumbersButtonRef}
        lineNumbersRef={lineNumbersRef}
      />
      <TextArea
        lowerTextController={lowerTextController}
        text={text}
        settings={settings}
        textAreaRef={textAreaRef}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        textAreaContainerRef={textAreaContainerRef}
      />
    </div>
  );
}
