import React from "react";

export default function TextPanel() {
  return (
    <div id='text_panel' className='context_panel'>
      <h4 className='!font-Josefin'>Text</h4>
      <div className='draginputs'>
        <label
          className='draginput twocol textcontent hidden'
          data-title='Change Content'
        >
          <input id='text' type='text' autoComplete='off' />
          <span className='!font-Josefin'>Content</span>
        </label>
        <label>
          <input
            id='text_x'
            className='attr_changer'
            data-title='Change text x coordinate'
            data-attr='x'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>X</span>
        </label>
        <label>
          <input
            id='text_y'
            className='attr_changer'
            data-title='Change text y coordinate'
            data-attr='y'
            pattern='[0-9]*'
          />
          <span className='!font-Josefin'>Y</span>
        </label>
        <div className='toolset draginput twocol' id='tool_font_family'>
          <span className='!font-Josefin'>Font</span>
          <div id='preview_font' style={{ fontFamily: "sans-serif" }}>
            sans-serif
          </div>
          <div className='caret'></div>
          <input
            id='font_family'
            data-title='Change Font Family'
            size={12}
            type='hidden'
          />
          <select id='font_family_dropdown' className='p-2'></select>
        </div>
        <div className='draginput font_style'>
          <span className='!font-Josefin'>Font Style</span>
          <div id='tool_bold' data-title='Bold Text [B]'>
            B
          </div>
          <div id='tool_italic' data-title='Italic Text [I]'>
            i
          </div>
        </div>
        <label data-title='Change text color' className='draginput'>
          <span className='!font-Josefin'>Color</span>
          <div id='color_text_tools'>
            <div className='color_tool active' id='tool_text_color'>
              <div className='color_block'>
                <div id='text_bg'></div>
                <div id='text_color'></div>
              </div>
            </div>
          </div>
        </label>
        <label id='tool_font_size' data-title='Change Font Size'>
          <input id='font_size' className='attr_changer' defaultValue={24} />
          <span id='font_sizeLabel' className='icon_label !font-Josefin'>
            Font Size
          </span>
        </label>
      </div>
    </div>
  );
}
