import React from "react";

export default function PathTool() {
  return (
    <div
      className='tool_button'
      id='tool_path'
      data-mode='path'
      title='Path tool (p)'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 27 27'
        width='27'
        height='27'
      >
        <path d='M12.2 1.9c0-.36.86 0 .86 0V14a1.3 1.3 0 10.88 0V1.9s.87-.36.87 0c0 6.81 5.22 11.68 5.22 11.68l-3.25 8.2h-6.55l-3.26-8.2s5.22-4.87 5.22-11.68zM7.83 25.26v-2.61h11.32v2.6H7.84z' />
      </svg>
    </div>
  );
}
