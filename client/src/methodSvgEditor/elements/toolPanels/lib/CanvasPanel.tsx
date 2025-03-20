import React from "react";

export default function CanvasPanel() {
  return (
    <div id='canvas_panel' className='context_panel'>
      <h4 className='!font-Josefin'>Canvas</h4>

      <div className='draginputs'>
        <label
          className='draginput twocol textcontent'
          data-title='Change Content'
        >
          <input
            id='canvas_title'
            className='attr_changer !font-K2D'
            type='text'
          />
          <span className='!font-Josefin'>Title</span>
        </label>

        <label data-title='Change canvas width' className='draginput'>
          <input
            id='canvas_width'
            className='attr_changer !font-K2D'
            type='text'
            pattern='[0-9]*'
            defaultValue={800}
          />
          <span className='icon_label !font-Josefin'>Width</span>
        </label>

        <label data-title='Change canvas height' className='draginput'>
          <input
            id='canvas_height'
            className='attr_changer !font-K2D'
            type='text'
            pattern='[0-9]*'
            defaultValue={600}
          />
          <span className='icon_label !font-Josefin'>Height</span>
        </label>

        <label data-title='Change canvas color' className='draginput'>
          <span className='!font-Josefin'>Color</span>
          <div id='color_canvas_tools'>
            <div className='color_tool active' id='tool_canvas'>
              <div className='color_block'>
                <div id='canvas_bg'></div>
                <div id='canvas_color'></div>
              </div>
            </div>
          </div>
        </label>

        <div className='draginput'>
          <span className='!font-Josefin'>Sizes</span>
          <select id='resolution' defaultValue='custom'>
            <option id='selectedPredefined' value='custom'>
              Custom
            </option>
            <option id='fitToContent' value='content'>
              Fit to Content
            </option>

            <optgroup label='Paper'>
              <option value='595x842'>A4 (595 × 842)</option>
              <option value='420x595'>A5 (420 × 595)</option>
              <option value='297x420'>A6 (297 × 420)</option>
              <option value='612x792'>Letter (612 × 792) </option>
              <option value='792x1224'>Tabloid (792 × 1224)</option>
            </optgroup>

            <optgroup label='Presentation'>
              <option value='1920x1080'>16:9 (1920 × 1080)</option>
              <option value='1024x768'>4:3 (1024 × 768)</option>
            </optgroup>

            <optgroup label='Social Media'>
              <option value='1012x506'>X post (1012 × 506)</option>
              <option value='1500x500'>X header (1500 × 500)</option>
              <option value='1200x630'>Facebook post (1200 × 630)</option>
              <option value='820x312'>Facebook cover (820 × 312)</option>
              <option value='1080x1080'>Instagram post (1080 × 1080)</option>
              <option value='1080x1920'>Instagram story (1080 × 1920)</option>
              <option value='300'>Dribble shot (400 × 300)</option>
              <option value='800x600'>Dribble shot HD (800 × 600)</option>
              <option value='1584x396'>LinkedIn cover (1584 × 396)</option>
            </optgroup>

            <optgroup label='Desktop'>
              <option value='1140x1024'>Desktop (1140 × 1024)</option>
              <option value='375x700'>MacBook (834 × 1194)</option>
              <option value='1440x900'>MacBook Pro (1024 × 1366)</option>
              <option value='1500x1000'>Surface Book (1440 × 990)</option>
              <option value='1280x720'>iMac (1368 × 912)</option>
            </optgroup>

            <optgroup label='Tablet'>
              <option value='414x896'>iPad Mini (768 × 1024)</option>
              <option value='375x812'>iPad Pro 11" (834 × 1194)</option>
              <option value='375x812'>iPad Pro 12.9" (1024 × 1366)</option>
              <option value='414x736'>Surface Pro 3 (1440 × 990)</option>
              <option value='414x736'>Surface Pro 4 (1368 × 912)</option>
            </optgroup>

            <optgroup label='Phone'>
              <option value='414x896'>iPhone 11 ProMax (414 × 896)</option>
              <option value='375x812'>iPhone 11 Pro / X (375 × 812)</option>
              <option value='414x736'>iPhone 8 Plus (414 × 736)</option>
              <option value='375x667'>iPhone 8 (375 × 667)</option>
              <option value='411x731'>Google Pixel 2 (411 × 731)</option>
              <option value='411x823'>Google Pixel XL (411 × 823)</option>
              <option value='360x640'>Android (360 × 640)</option>
            </optgroup>
          </select>
          <div className='caret'></div>
          <label id='resolution_label'>Custom</label>
        </div>
      </div>
    </div>
  );
}
