import React from "react";

export default function RectangleTool() {
  return (
    <div
      className='tool_button'
      id='tool_rect'
      data-mode='rect'
      title='Rectangle tool (r)'
    >
      <svg
        viewBox='0 0 27 27'
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
      >
        <path d='M 0 8 L 0 24 L 24 24 L 25 8 L 0 8 Z' />
      </svg>
    </div>
  );
}
