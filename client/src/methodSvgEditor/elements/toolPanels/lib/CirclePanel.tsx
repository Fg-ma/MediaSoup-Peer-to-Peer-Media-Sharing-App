import React from "react";

export default function CirclePanel() {
  return (
    <div id='circle_panel' className='context_panel'>
      <h4 className='!font-Josefin'>Circle</h4>
      <div className='draginputs'>
        <label id='tool_circle_cx' className='draginput'>
          <span className='!font-Josefin'>Center X</span>
          <input
            id='circle_cx'
            className='attr_changer !font-K2D'
            title="Change circle's cx coordinate"
            data-attr='cx'
          />
        </label>
        <label id='tool_circle_cy' className='draginput'>
          <span className='!font-Josefin'>Center Y</span>
          <input
            id='circle_cy'
            className='attr_changer !font-K2D'
            title="Change circle's cy coordinate"
            data-attr='cy'
          />
        </label>
        <label id='tool_circle_r' className='draginput'>
          <span className='!font-Josefin'>Radius</span>
          <input
            id='circle_r'
            className='attr_changer !font-K2D'
            title="Change circle's radius"
            data-attr='r'
          />
        </label>
      </div>
    </div>
  );
}
