import React from "react";

export default function EllipseTool() {
  return (
    <div
      className='tool_button'
      id='tool_ellipse'
      data-mode='ellipse'
      title='Ellipse tool (c)'
    >
      <svg
        viewBox='0 0 27 27'
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
      >
        <ellipse cx='13' cy='13' rx='13' ry='9'></ellipse>
      </svg>
    </div>
  );
}
