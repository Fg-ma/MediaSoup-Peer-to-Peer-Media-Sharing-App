import React from "react";

export default function Zoom() {
  return (
    <>
      <select id='zoom_select' defaultValue='100'>
        <option value='6'>6%</option>
        <option value='12'>12%</option>
        <option value='16'>16%</option>
        <option value='25'>25%</option>
        <option value='50'>50%</option>
        <option value='75'>75%</option>
        <option value='100'>100%</option>
        <option value='150'>150%</option>
        <option value='200'>200%</option>
        <option value='300'>300%</option>
        <option value='400'>400%</option>
        <option value='600'>600%</option>
        <option value='800'>800%</option>
        <option value='1600'>1600%</option>
      </select>
      <div id='zoom_panel' className='toolset'>
        <div className='select-input' id='zoom_label'>
          <span id='zoomLabel' className='zoom_tool icon_label'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='24'
              viewBox='2 2 20 20'
              width='27'
            >
              <path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' />
            </svg>
          </span>
          <input id='zoom' value='100%' type='text' readOnly />
        </div>
      </div>
    </>
  );
}
