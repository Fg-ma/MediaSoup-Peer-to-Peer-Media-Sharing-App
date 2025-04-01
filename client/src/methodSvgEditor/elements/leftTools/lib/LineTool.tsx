import React from "react";

export default function LineTool() {
  return (
    <div
      className='tool_button'
      id='tool_line'
      data-mode='line'
      data-tip='Line tool (l)'
    >
      <svg
        viewBox='0 0 27 27'
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
      >
        <path d='M 3 1 L 26 24 L 24 26 L 1 3 L 3 1 Z'></path>
      </svg>
    </div>
  );
}
