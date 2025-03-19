import React from "react";

export default function GPanel() {
  return (
    <div id='g_panel' className='context_panel clearfix'>
      <h4>Group</h4>
      <div className='draginputs'>
        <label>
          <input
            id='g_x'
            className='attr_changer'
            data-title="Change groups's x coordinate"
            data-attr='x'
            pattern='[0-9]*'
          />
          <span>X</span>
        </label>
        <label>
          <input
            id='g_y'
            className='attr_changer'
            data-title="Change groups's y coordinate"
            data-attr='y'
            pattern='[0-9]*'
          />
          <span>Y</span>
        </label>
      </div>
      <div className='button full' title='Ungroup Elements' id='button_ungroup'>
        Ungroup
      </div>
    </div>
  );
}
