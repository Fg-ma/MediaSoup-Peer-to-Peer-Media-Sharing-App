import React from "react";

export default function EyeDropperTool() {
  return (
    <div
      className='tool_button'
      id='tool_eyedropper'
      data-mode='eyedropper'
      title='Eyedropper tool (e)'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        height='24'
        viewBox='2 2 20 20'
        width='27'
        style={{ transform: "scale(-1, 1)" }}
      >
        <path d='M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z' />
      </svg>
    </div>
  );
}
