import React from "react";

export default function UsePanel() {
  return (
    <div id='use_panel' className='context_panel clearfix'>
      <h4 className='!font-Josefin'>Use</h4>
      <div
        className='button full !font-K2D'
        id='tool_unlink_use'
        data-title='Break link'
      >
        Break use ref
      </div>
    </div>
  );
}
