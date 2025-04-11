import React from "react";

export default function Divider({
  lightness,
  togglePaneHeight,
  dividerContent,
  dividerHeight,
  dividerButton,
}: {
  lightness: number;
  togglePaneHeight: () => void;
  dividerContent?: React.ReactNode;
  dividerHeight: string;
  dividerButton: boolean;
}) {
  return (
    <div
      className="flex items-center drop-shadow-md"
      style={{
        backgroundColor: `hsl(355.1, 99.1%, ${lightness}%)`,
        height: dividerHeight,
      }}
    >
      <div className="grow">{dividerContent}</div>
      {dividerButton && (
        <div className="flex mr-5 items-center">
          <div
            className="flex h-5 cursor-pointer items-center"
            onClick={togglePaneHeight}
          >
            <button
              className="rounded bg-fg-tone-black-3"
              style={{
                height: `calc(${dividerHeight} * 1 / 3)`,
                width: `calc(${dividerHeight} * 2.5)`,
              }}
            ></button>
          </div>
        </div>
      )}
    </div>
  );
}
