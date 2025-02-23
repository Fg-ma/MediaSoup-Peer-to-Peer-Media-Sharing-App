import React, { useRef, useEffect, useState } from "react";
import { Settings } from "./lib/typeConstant";
import LineNumbers from "./LineNumbers";
import TextArea from "./TextArea";

export default function EditableText({
  text,
  settings,
}: {
  text: React.MutableRefObject<string>;
  settings: Settings;
}) {
  const [lineCount, setLineCount] = useState(0); // Track line count for re-render trigger

  const handleTextChange = () => {
    setLineCount((prev) => prev + 1); // Trigger re-render in the parent to update LineNumbers
  };

  return (
    <div className='flex w-full h-full overflow-auto px-4 pt-3 small-multidirectional-scroll-bar bg-fg-tone-black-1 text-fg-white'>
      {/* Line Numbers */}
      <LineNumbers text={text} settings={settings} />

      {/* Editable Text Area */}
      <TextArea
        text={text}
        settings={settings}
        handleTextChange={handleTextChange}
      />
    </div>
  );
}
