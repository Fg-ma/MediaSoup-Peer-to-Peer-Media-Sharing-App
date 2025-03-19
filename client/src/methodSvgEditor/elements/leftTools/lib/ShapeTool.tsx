import React from "react";

export default function ShapeTool() {
  return (
    <div
      className='tool_button'
      id='tool_shapelib'
      data-mode='shapelib'
      title='Shape tool (s)'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        height='27'
        width='27'
        viewBox='0 0 24 24'
      >
        <polygon points='14.43,10 12,2 9.57,10 2,10 8.18,14.41 5.83,22 12,17.31 18.18,22 15.83,14.41 22,10' />
      </svg>
      <div className='tool_menu'></div>
    </div>
  );
}
