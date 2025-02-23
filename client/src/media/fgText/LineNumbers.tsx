import React from "react";
import { Settings } from "./lib/typeConstant";

const LineNumbers = React.memo(
  ({
    text,
    settings,
  }: {
    text: React.MutableRefObject<string>;
    settings: Settings;
  }) => {
    const lines = text.current.split("\n");
    const maxDigits = String(lines.length).length;

    return (
      <div className='flex h-max flex-col text-right pr-2'>
        {lines.map((_line, index) => (
          <span
            key={index}
            className='select-none'
            style={{
              color: settings.colors.indexColor.value,
              whiteSpace: "pre",
            }}
            contentEditable={false}
          >
            [{String(index + 1).padStart(maxDigits, " ")}]
          </span>
        ))}
      </div>
    );
  }
);

export default LineNumbers;
