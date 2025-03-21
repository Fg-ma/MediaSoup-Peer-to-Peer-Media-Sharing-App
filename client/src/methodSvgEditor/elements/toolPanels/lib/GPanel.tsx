import React from "react";

export default function GPanel() {
  return (
    <div id='g_panel' className='context_panel clearfix'>
      <h4 className='!font-Josefin'>Group</h4>
      <div className='draginputs'>
        <label>
          <input
            id='g_x'
            className='attr_changer !font-K2D'
            data-title="Change groups's x coordinate"
            data-attr='x'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>X</span>
        </label>
        <label>
          <input
            id='g_y'
            className='attr_changer !font-K2D'
            data-title="Change groups's y coordinate"
            data-attr='y'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Y</span>
        </label>
      </div>
      <div
        className='button !font-K2D border-none hover:bg-fg-tone-black-6 w-full flex items-center justify-center'
        title='Ungroup Elements'
        id='button_ungroup'
      >
        Ungroup
      </div>
    </div>
  );
}
