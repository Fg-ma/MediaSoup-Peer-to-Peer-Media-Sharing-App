import React from "react";

export default function LinePanel() {
  return (
    <div id='line_panel' className='context_panel clearfix'>
      <h4 className='!font-Josefin'>Line</h4>
      <div className='draginputs'>
        <label id='tool_line_x1'>
          <input
            id='line_x1'
            className='attr_changer !font-K2D'
            data-title="Change line's starting x coordinate"
            data-attr='x1'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Start X</span>
        </label>
        <label id='tool_line_y1'>
          <input
            id='line_y1'
            className='attr_changer !font-K2D'
            data-title="Change line's starting y coordinate"
            data-attr='y1'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Start Y</span>
        </label>
        <label id='tool_line_x2'>
          <input
            id='line_x2'
            className='attr_changer !font-K2D'
            data-title="Change line's ending x coordinate"
            data-attr='x2'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>End X</span>
        </label>
        <label id='tool_line_y2'>
          <input
            id='line_y2'
            className='attr_changer !font-K2D'
            data-title="Change line's ending y coordinate"
            data-attr='y2'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>End Y</span>
        </label>
      </div>
    </div>
  );
}
