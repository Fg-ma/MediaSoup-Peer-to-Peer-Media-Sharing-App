import React from "react";

export default function ViewMenu() {
  return (
    <div className='menu'>
      <div className='menu_title'>View</div>
      <div className='menu_list inverted-undo' id='view_menu'>
        <div className='menu_item push_button_pressed' id='tool_rulers'>
          View Rulers <span className='shortcut'>⇧R</span>
        </div>
        <div className='menu_item' id='tool_wireframe'>
          View Wireframe
        </div>
        <div className='separator'></div>
        <div className='menu_item' id='tool_source' data-action='source'>
          Source... <span className='shortcut'>⌘U</span>
        </div>
      </div>
    </div>
  );
}
