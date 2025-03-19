import React from "react";

export default function StrokePanel() {
  return (
    <div id='stroke_panel' className='context_panel'>
      <h4>Stroke</h4>
      <div className='draginputs'>
        <label className='draginput' data-title='Change stroke'>
          <input
            id='stroke_width'
            size={2}
            value='1'
            data-attr='stroke-width'
            min='0'
            max='99'
            step='1'
          />
          <span className='icon_label'>Width</span>
        </label>
        <div className='stroke_tool draginput'>
          <span>Dash</span>
          <select id='stroke_style' data-title='Change stroke dash style'>
            <option selected value='none'>
              —
            </option>
            <option value='2,2'>···</option>
            <option value='5,5'>- -</option>
            <option value='5,2,2,2'>-·-</option>
            <option value='5,2,2,2,2,2'>-··-</option>
          </select>
          <div className='caret'></div>
          <label id='stroke_style_label'>—</label>
        </div>

        <label style={{ display: "none" }}>
          <span className='icon_label'>Stroke Join</span>
        </label>

        <label style={{ display: "none" }}>
          <span className='icon_label'>Stroke Cap</span>
        </label>
      </div>
    </div>
  );
}
