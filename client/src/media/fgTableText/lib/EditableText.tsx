import React from "react";
import { Settings } from "./typeConstant";
import LineNumbers from "./LineNumbers";
import TextArea from "./TextArea";

export default function EditableText({
  className,
  text,
  settings,
  expandLineNumbersButtonRef,
  lineNumbersRef,
  textAreaRef,
  isEditing,
  setIsEditing,
  textAreaContainerRef,
}: {
  className?: string;
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
      className={`${className} small-multidirectional-scroll-bar pointer-events-auto flex h-full w-full overflow-auto px-4 py-3`}
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
