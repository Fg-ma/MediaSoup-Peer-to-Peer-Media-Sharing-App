import React from "react";

export default function EditMenu() {
  return (
    <div className='menu'>
      <div className='menu_title'>Edit</div>
      <div className='menu_list inverted-undo' id='edit_menu'>
        <div data-action='undo' className='menu_item' id='tool_undo'>
          Undo <span className='shortcut'>⌘Z</span>
        </div>
        <div data-action='redo' className='menu_item' id='tool_redo'>
          Redo <span className='shortcut'>⌘Y</span>
        </div>
        <div className='separator'></div>
        <div
          data-action='cutSelected'
          className='menu_item action_selected disabled'
          id='tool_cut'
        >
          Cut <span className='shortcut'>⌘X</span>
        </div>
        <div
          data-action='copySelected'
          className='menu_item action_selected disabled'
          id='tool_copy'
        >
          Copy <span className='shortcut'>⌘C</span>
        </div>
        <div
          data-action='pasteSelected'
          className='menu_item action_selected disabled'
          id='tool_paste'
        >
          Paste <span className='shortcut'>⌘V</span>
        </div>
        <div
          data-action='duplicateSelected'
          className='menu_item action_selected disabled'
          id='tool_clone'
        >
          Duplicate <span className='shortcut'>⌘D</span>
        </div>
        <div
          data-action='deleteSelected'
          className='menu_item action_selected disabled'
          id='tool_delete'
        >
          Delete <span>⌫</span>
        </div>
      </div>
    </div>
  );
}
