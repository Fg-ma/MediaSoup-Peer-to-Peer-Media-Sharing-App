import React from "react";

export default function EllipsePanel() {
  return (
    <div id='ellipse_panel' className='context_panel'>
      <h4 className='!font-Josefin'>Ellipse</h4>
      <div className='draginputs'>
        <label id='tool_ellipse_cx'>
          <input
            id='ellipse_cx'
            className='attr_changer !font-K2D'
            data-title='Change x position'
            data-attr='cx'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>X</span>
        </label>
        <label id='tool_ellipse_cy'>
          <input
            id='ellipse_cy'
            className='attr_changer !font-K2D'
            data-title='Change y position'
            data-attr='cy'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Y</span>
        </label>
        <label id='tool_ellipse_rx'>
          <input
            id='ellipse_rx'
            className='attr_changer !font-K2D'
            data-title='Change x radius'
            data-attr='rx'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Radius X</span>
        </label>
        <label id='tool_ellipse_ry'>
          <input
            id='ellipse_ry'
            className='attr_changer !font-K2D'
            data-title='Change y radius'
            data-attr='ry'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Radius Y</span>
        </label>
      </div>
    </div>
  );
}
