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
      className='flex items-center drop-shadow-md'
      style={{
        backgroundColor: `hsl(21, 92%, ${lightness}%)`,
        height: dividerHeight,
      }}
    >
      <div className='grow'>{dividerContent}</div>
      {dividerButton && (
        <div className='flex items-center mr-5'>
          <div
            className='flex items-center h-5 cursor-pointer'
            onClick={togglePaneHeight}
          >
            <button
              className='bg-fg-black-25 rounded'
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
