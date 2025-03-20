import React from "react";

export default function PathPanel() {
  return (
    <div id='path_panel' className='context_panel clearfix'>
      <h4 className='!font-Josefin'>Path</h4>
      <div className='draginputs'>
        <label>
          <input
            id='path_x'
            className='attr_changer !font-K2D'
            data-title="Change ellipse's cx coordinate"
            data-attr='x'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>X</span>
        </label>
        <label>
          <input
            id='path_y'
            className='attr_changer !font-K2D'
            data-title="Change ellipse's cy coordinate"
            data-attr='y'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Y</span>
        </label>
      </div>
    </div>
  );
}
