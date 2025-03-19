import React from "react";

export default function LogoMenu() {
  return (
    <a className='menu'>
      <div className='menu_title' id='logo'>
        <svg
          viewBox='0 0 16 16'
          width='16'
          height='16'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M-.1 16.1L16 .04V16.1H-.1z'></path>
          <path d='M0 16.1V.1l16 16H0z' fill='var(--z7)'></path>
        </svg>
      </div>
      <div className='menu_list inverted-undo'>
        <div id='modal_about' className='menu_item' data-action='about'>
          About this app...
        </div>
        <div className='separator'></div>
        <div
          id='modal_preferences'
          className='menu_item'
          data-action='configure'
        >
          Configure...
        </div>
        <div id='modal_shortcuts' className='menu_item' data-action='shortcuts'>
          Keyboard Shortcuts...
        </div>
        <div id='modal_donate' className='menu_item' data-action='donate'>
          Donate or sponsor...
        </div>
      </div>
    </a>
  );
}
