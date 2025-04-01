import React from "react";

export default function ColorTools() {
  return (
    <div id='color_tools'>
      <div id='tool_switch' title='Switch stroke and fill colors (x)'>
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 11 11'>
          <path d='M3.01 2A6 6 0 019 8h1.83l-2.91 2.91L5 8h2a4 4 0 00-3.99-4v1.93L.1 3.02 3.01.1V2z' />
        </svg>
      </div>
      <div
        className='color_tool active'
        id='tool_fill'
        title='Change fill color'
      >
        <label className='icon_label'></label>
        <div className='color_block'>
          <div id='fill_bg'></div>
          <div id='fill_color' className='color_block'></div>
        </div>
      </div>

      <div className='color_tool' id='tool_stroke' title='Change stroke color'>
        <label className='icon_label'></label>
        <div className='color_block'>
          <div id='stroke_bg'></div>
          <div id='stroke_color' className='color_block'></div>
        </div>
      </div>
    </div>
  );
}
