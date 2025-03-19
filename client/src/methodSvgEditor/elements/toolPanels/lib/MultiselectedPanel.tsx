import React from "react";

export default function MultiselectedPanel() {
  return (
    <div id='multiselected_panel' className='context_panel clearfix'>
      <h4 className='hidable'>Multiple Elements</h4>

      <div className='toolset align_buttons'>
        <label id='tool_align_relative'>
          <div className='select-input'>
            <select
              id='align_relative_to'
              title='Align relative to ...'
              className='select_tool'
            >
              <option id='selected_objects' value='selected'>
                Align to objects
              </option>
              <option id='page' value='page'>
                Align to page
              </option>
            </select>
          </div>
        </label>
        <div className='col last clear'>
          <div
            className='align_button'
            id='tool_alignleft'
            title='Align Left'
            data-align='left'
          >
            <svg
              viewBox='0 0 27 27'
              xmlns='http://www.w3.org/2000/svg'
              width='27'
              height='27'
            >
              <path d='M 2 1 L 2 5 L 14 5 L 14 11 L 2 11 L 2 16 L 20 16 L 20 22 L 2 22 L 2 26 L 1 26 L 1 1 L 2 1 Z' />
            </svg>
          </div>
          <div
            className='align_button'
            id='tool_aligncenter'
            title='Align Center'
            data-align='center'
          >
            <svg
              viewBox='0 0 27 27'
              xmlns='http://www.w3.org/2000/svg'
              width='27'
              height='27'
            >
              <path d='M 13 1 L 14 1 L 14 6 L 22 6 L 22 12 L 14 12 L 14 15 L 19 15 L 19 21 L 14 21 L 14 26 L 13 26 L 13 21 L 8 21 L 8 15 L 13 15 L 13 12 L 5 12 L 5 6 L 13 6 L 13 1 Z' />
            </svg>
          </div>
          <div
            className='align_button'
            id='tool_alignright'
            title='Align Right'
            data-align='right'
          >
            <svg
              viewBox='0 0 27 27'
              xmlns='http://www.w3.org/2000/svg'
              width='27'
              height='27'
            >
              <path d='M 25 1 L 25 5 L 13 5 L 13 11 L 25 11 L 25 16 L 7 16 L 7 22 L 25 22 L 25 26 L 26 26 L 26 1 L 25 1 Z' />
            </svg>
          </div>
          <div
            className='align_button'
            id='tool_aligntop'
            title='Align Top'
            data-align='top'
          >
            <svg
              viewBox='0 0 27 27'
              xmlns='http://www.w3.org/2000/svg'
              width='27'
              height='27'
            >
              <path d='M 1 2 L 5 2 L 5 14 L 11 14 L 11 2 L 16 2 L 16 20 L 22 20 L 22 2 L 26 2 L 26 1 L 1 1 L 1 2 Z' />
            </svg>
          </div>
          <div
            className='align_button'
            id='tool_alignmiddle'
            title='Align Middle'
            data-align='middle'
          >
            <svg
              viewBox='0 0 27 27'
              xmlns='http://www.w3.org/2000/svg'
              width='27'
              height='27'
            >
              <path d='M 26 13 L 26 14 L 21 14 L 21 22 L 15 22 L 15 14 L 12 14 L 12 19 L 6 19 L 6 14 L 1 14 L 1 13 L 6 13 L 6 8 L 12 8 L 12 13 L 15 13 L 15 5 L 21 5 L 21 13 L 26 13 Z' />
            </svg>
          </div>
          <div
            className='align_button'
            id='tool_alignbottom'
            title='Align Bottom'
            data-align='bottom'
          >
            <svg
              viewBox='0 0 27 27'
              xmlns='http://www.w3.org/2000/svg'
              width='27'
              height='27'
            >
              <path d='M 1 25 L 5 25 L 5 13 L 11 13 L 11 25 L 16 25 L 16 7 L 22 7 L 22 25 L 26 25 L 26 26 L 1 26 L 1 25' />
            </svg>
          </div>
        </div>
      </div>
      <div className='clearfix'></div>
      <div className='button full' id='button_group'>
        Group Elements
      </div>
      <div
        className='button full'
        id='tool_text_on_path'
        title='Place text on path'
      >
        Place text on path
      </div>
    </div>
  );
}
