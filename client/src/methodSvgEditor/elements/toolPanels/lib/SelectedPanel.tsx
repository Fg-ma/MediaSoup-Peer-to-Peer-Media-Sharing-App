import React from "react";

export default function SelectedPanel() {
  return (
    <div id='selected_panel' className='context_panel'>
      <div className='draginputs'>
        <label
          id='tool_angle'
          data-title='Change rotation angle'
          className='draginput'
        >
          <input
            id='angle'
            className='attr_changer !font-K2D'
            size={2}
            defaultValue='0'
            data-attr='transform'
            data-min='-180'
            data-max='180'
            type='text'
          />
          <span className='icon_label !font-Josefin'>Rotation</span>
          <div id='tool_angle_indicator' className='angle'>
            <div
              id='tool_angle_indicator_cursor'
              className='angle-cursor'
            ></div>
          </div>
        </label>

        <label id='tool_opacity' data-title='Change selected item opacity'>
          <input
            id='group_opacity'
            className='attr_changer !font-K2D'
            data-attr='opacity'
            defaultValue='100'
            step='5'
            min='0'
            max='100'
          />
          <span id='group_opacityLabel' className='icon_label !font-Josefin'>
            Opacity
          </span>
        </label>

        <label id='tool_blur' data-title='Change gaussian blur value'>
          <input
            id='blur'
            className='attr_changer !font-K2D'
            size={2}
            defaultValue='0'
            step='.1'
            min='0'
            max='10'
          />
          <span className='icon_label !font-Josefin'>Blur</span>
        </label>

        <label
          id='cornerRadiusLabel'
          data-title='Change Rectangle Corner Radius'
        >
          <input
            id='rect_rx'
            defaultValue='0'
            data-attr='rx'
            className='attr_changer !font-K2D'
            type='text'
            pattern='[0-9]*'
          />
          <span className='icon_label !font-Josefin'>Roundness</span>
        </label>
      </div>

      <div id='align_tools'>
        <h4 className='!font-Josefin'>Align to canvas</h4>
        <div className='toolset align_buttons' id='tool_position'>
          <label>
            <div className='col last clear' id='position_opts'>
              <div
                className='align_button'
                id='tool_posleft'
                title='Align left'
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
                id='tool_poscenter'
                title='Align center'
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
                id='tool_posright'
                title='Align right'
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
                id='tool_postop'
                title='Align top'
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
                id='tool_posmiddle'
                title='Align middle'
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
                id='tool_posbottom'
                title='Align bottom'
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
            <div className='clearfix'></div>
          </label>
        </div>
      </div>
    </div>
  );
}
