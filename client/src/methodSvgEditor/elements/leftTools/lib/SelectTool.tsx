import React from "react";

export default function SelectTool() {
  return (
    <div
      className='tool_button'
      id='tool_select'
      data-mode='select'
      title='Select tool (v)'
    >
      <svg viewBox='0 0 24 24' width='24' height='24'>
        <path d='M17.15 20.76l-2.94 1.5-3.68-6-4.41 3V1.24l12.5 12.01-4.41 1.5 2.94 6z' />
      </svg>
    </div>
  );
}
