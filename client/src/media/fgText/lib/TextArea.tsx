import React from "react";
import { Settings } from "./typeConstant";

export default function TextArea({
  text,
  settings,
  textAreaRef,
}: {
  text: React.MutableRefObject<string>;
  settings: Settings;
  textAreaRef: React.RefObject<HTMLPreElement>;
}) {
  const handleDivClick = (event: React.MouseEvent) => {
    // Check if the click was inside the <pre> element
    if (
      textAreaRef.current &&
      !textAreaRef.current.contains(event.target as Node)
    ) {
      // Move cursor to the end of the <pre> element
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(textAreaRef.current);
      range.collapse(false); // false means collapse to the end
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  return (
    <div className='grow h-max min-h-full' onClick={handleDivClick}>
      <div className='h-full w-max min-w-full'>
        <pre
          ref={textAreaRef}
          contentEditable
          suppressContentEditableWarning
          className='min-w-full w-max h-max outline-none font-K2D text-lg'
          style={{
            color: settings.colors.textColor.value,
            whiteSpace: "pre",
            fontFamily: settings.fontStyle.value,
            fontSize: settings.fontSize.value,
            lineHeight: `calc(${settings.fontSize.value} + 8px)`,
          }}
        >
          {text.current}
        </pre>
      </div>
    </div>
  );
}
