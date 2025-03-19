import React from "react";

export default function TextTool() {
  return (
    <div
      className='tool_button'
      id='tool_text'
      data-mode='text'
      title='Text tool (t)'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='2 2 20 20'
        width={27}
        height={27}
      >
        <path d='M5 4v3h5.5v12h3V7H19V4z' />
      </svg>
    </div>
  );
}
