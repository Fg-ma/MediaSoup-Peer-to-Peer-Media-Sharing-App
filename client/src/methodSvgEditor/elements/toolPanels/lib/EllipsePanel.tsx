import React from "react";

export default function EllipsePanel() {
  return (
    <div id='ellipse_panel' className='context_panel'>
      <h4>Ellipse</h4>
      <div className='draginputs'>
        <label id='tool_ellipse_cx'>
          <input
            id='ellipse_cx'
            className='attr_changer'
            data-title="Change ellipse's cx coordinate"
            data-attr='cx'
            pattern='[0-9]*'
          />
          <span>X</span>
        </label>
        <label id='tool_ellipse_cy'>
          <input
            id='ellipse_cy'
            className='attr_changer'
            data-title="Change ellipse's cy coordinate"
            data-attr='cy'
            pattern='[0-9]*'
          />
          <span>Y</span>
        </label>
        <label id='tool_ellipse_rx'>
          <input
            id='ellipse_rx'
            className='attr_changer'
            data-title="Change ellipse's x radius"
            data-attr='rx'
            pattern='[0-9]*'
          />
          <span>Radius X</span>
        </label>
        <label id='tool_ellipse_ry'>
          <input
            id='ellipse_ry'
            className='attr_changer'
            data-title="Change ellipse's y radius"
            data-attr='ry'
            pattern='[0-9]*'
          />
          <span>Radius Y</span>
        </label>
      </div>
    </div>
  );
}
