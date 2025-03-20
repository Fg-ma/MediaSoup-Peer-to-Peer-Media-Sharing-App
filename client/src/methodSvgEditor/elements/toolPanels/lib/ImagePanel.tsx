import React from "react";

export default function ImagePanel() {
  return (
    <div id='image_panel' className='context_panel clearfix'>
      <h4 className='!font-Josefin'>Image</h4>
      <div className='draginputs'>
        <label className='draginput'>
          <input
            id='image_x'
            className='attr_changer !font-K2D'
            data-title='Change X coordinate'
            data-attr='x'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>X</span>
        </label>
        <label className='draginput'>
          <input
            id='image_y'
            className='attr_changer !font-K2D'
            data-title='Change Y coordinate'
            data-attr='y'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Y</span>
        </label>
        <label className='draginput'>
          <input
            id='image_width'
            className='attr_changer !font-K2D'
            data-title='Change image width'
            data-attr='width'
            pattern='[0-9]*'
          />
          <span className='icon_label !font-Josefin'>Width</span>
        </label>
        <label className='draginput'>
          <input
            id='image_height'
            className='attr_changer !font-K2D'
            data-title='Change image height'
            data-attr='height'
            pattern='[0-9]*'
          />
          <span className='icon_label !font-Josefin'>Height</span>
        </label>
      </div>
    </div>
  );
}
