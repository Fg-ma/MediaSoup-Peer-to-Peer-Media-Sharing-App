import React from "react";

export default function ObjectMenu() {
  return (
    <div className='menu'>
      <div className='menu_title font-Josefin'>Object</div>
      <div className='menu_list inverted-undo' id='object_menu'>
        <div className='menu_item action_selected disabled' id='tool_move_top'>
          Bring to Front <span className='shortcut'>⌘⇧↑</span>
        </div>
        <div className='menu_item action_selected disabled' id='tool_move_up'>
          Bring Forward <span className='shortcut'>⌘↑</span>
        </div>
        <div className='menu_item action_selected disabled' id='tool_move_down'>
          Send Backward <span className='shortcut'>⌘↓</span>
        </div>
        <div
          className='menu_item action_selected disabled'
          id='tool_move_bottom'
        >
          Send to Back <span className='shortcut'>⌘⇧↓</span>
        </div>
        <div className='separator'></div>
        <div
          className='menu_item action_multi_selected disabled'
          id='tool_group'
        >
          Group <span className='shortcut'>⌘G</span>
        </div>
        <div
          className='menu_item action_group_selected disabled'
          id='tool_ungroup'
        >
          Ungroup <span className='shortcut'>⌘⇧G</span>
        </div>
        <div className='separator'></div>
        <div
          className='menu_item action_path_convert_selected disabled'
          id='tool_topath'
        >
          Convert to Path
        </div>
        <div
          className='menu_item action_path_selected disabled'
          id='tool_reorient'
        >
          Reorient path
        </div>
      </div>
    </div>
  );
}
