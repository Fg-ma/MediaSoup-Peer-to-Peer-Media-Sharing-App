import React from "react";

export default function RectanglePanel() {
  return (
    <div id='rect_panel' className='context_panel'>
      <h4 className='!font-Josefin'>Rectangle</h4>
      <div className='draginputs'>
        <label className='draginput'>
          <input
            id='rect_x'
            className='attr_changer !font-K2D'
            data-title='Change X coordinate'
            data-attr='x'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>X</span>
        </label>
        <label className='draginput'>
          <input
            id='rect_y'
            className='attr_changer !font-K2D'
            data-title='Change Y coordinate'
            data-attr='y'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Y</span>
        </label>
        <label
          className='draginput'
          id='rect_width_tool attr_changer'
          data-title='Change rectangle width'
        >
          <input
            id='rect_width'
            className='attr_changer !font-K2D'
            data-attr='width'
            type='text'
            pattern='[0-9]*'
          />
          <span className='icon_label !font-Josefin'>Width</span>
        </label>
        <label
          className='draginput'
          id='rect_height_tool'
          data-title='Change rectangle height'
        >
          <input
            id='rect_height'
            className='attr_changer !font-K2D'
            data-attr='height'
            type='text'
            pattern='[0-9]*'
          />
          <span className='icon_label !font-Josefin'>Height</span>
        </label>
      </div>
    </div>
  );
}
