import React, { useRef } from "react";
import { Settings } from "./typeConstant";
import LineNumbers from "./LineNumbers";
import TextArea from "./TextArea";

export default function EditableText({
  className,
  text,
  settings,
  isLineNums,
  setIsLineNums,
  isEditing,
  setIsEditing,
}: {
  className?: string;
  text: React.MutableRefObject<string>;
  settings: Settings;
  isLineNums: boolean;
  setIsLineNums: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const editableTextRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={editableTextRef}
      className={`${className} pointer-events-auto flex h-full w-full px-4 py-3`}
      style={{
        backgroundColor: settings.colors.backgroundColor.value,
      }}
    >
      <TextArea
        text={text}
        settings={settings}
        editableTextRef={editableTextRef}
        isLineNums={isLineNums}
        setIsLineNums={setIsLineNums}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    </div>
  );
}
