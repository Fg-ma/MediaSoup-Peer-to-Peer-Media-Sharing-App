import React, { useRef } from "react";
import { Settings } from "./typeConstant";
import LineNumbers from "./LineNumbers";
import TextArea from "./TextArea";

export default function EditableText({
  text,
  settings,
  expandLineNumbersButtonRef,
  lineNumbersRef,
}: {
  text: React.MutableRefObject<string>;
  settings: Settings;
  expandLineNumbersButtonRef: React.RefObject<HTMLButtonElement>;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
}) {
  const textAreaRef = useRef<HTMLPreElement>(null);

  return (
    <div
      className='flex w-full h-full overflow-auto px-4 py-3 small-multidirectional-scroll-bar bg-fg-tone-black-1 text-fg-white'
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
      <TextArea text={text} settings={settings} textAreaRef={textAreaRef} />
    </div>
  );
}
