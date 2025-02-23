import React, { useRef } from "react";
import { Settings } from "./lib/typeConstant";

const TextArea = ({
  text,
  settings,
  handleTextChange,
}: {
  text: React.MutableRefObject<string>;
  settings: Settings;
  handleTextChange: () => void;
}) => {
  const preRef = useRef<HTMLPreElement>(null);

  const handleInput = () => {
    if (!preRef.current) return;
    text.current = preRef.current.innerText;
    handleTextChange();
  };

  return (
    <pre
      ref={preRef}
      contentEditable
      suppressContentEditableWarning
      className='w-full min-h-full h-max outline-none'
      style={{
        backgroundColor: settings.colors.backgroundColor.value,
        color: settings.colors.textColor.value,
        whiteSpace: "pre-wrap", // Allows wrapping without <div> elements
      }}
      onInput={handleInput}
    >
      {text.current}
    </pre>
  );
};

export default TextArea;
