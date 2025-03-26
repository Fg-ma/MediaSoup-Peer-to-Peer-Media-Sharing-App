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
            title='Change x position'
            data-attr='cx'
          />
        </label>
        <label id='tool_circle_cy' className='draginput'>
          <span className='!font-Josefin'>Center Y</span>
          <input
            id='circle_cy'
            className='attr_changer !font-K2D'
            title='Change y position'
            data-attr='cy'
          />
        </label>
        <label
          className='draginput'
          id='ellipse_width_tool attr_changer'
          data-title='Change width'
        >
          <input
            id='ellipse_width'
            className='attr_changer !font-K2D'
            data-attr='width'
            type='text'
            pattern='[0-9]*'
          />
          <span className='icon_label !font-Josefin'>Width</span>
        </label>
        <label
          className='draginput'
          id='ellipse_height_tool'
          data-title='Change height'
        >
          <input
            id='ellipse_height'
            className='attr_changer !font-K2D'
            data-attr='height'
            type='text'
            pattern='[0-9]*'
          />
          <span className='icon_label !font-Josefin'>Height</span>
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
