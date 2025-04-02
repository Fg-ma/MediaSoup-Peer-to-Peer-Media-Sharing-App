import React from "react";

export default function FileMenu() {
  return (
    <div className='menu'>
      <div className='menu_title font-Josefin'>File</div>
      <div className='menu_list inverted-undo' id='file_menu'>
        <div data-action='clear' id='tool_clear' className='menu_item'>
          New document
        </div>

        <div id='tool_open' className='menu_item'>
          <input type='file' accept='image/svg+xml' id='tool_open_input' />
          Open svg...{" "}
          <span className='shortcut' style={{ display: "none" }}>
            ⌘O
          </span>
        </div>

        <div id='tool_import' className='menu_item'>
          <input type='file' accept='image/*' id='tool_import_input' />
          Place image...{" "}
          <span className='shortcut' style={{ display: "none" }}>
            ⌘K
          </span>
        </div>

        <div data-action='save' id='tool_save' className='menu_item'>
          Save image... <span className='shortcut'>⌘S</span>
        </div>

        <div data-action='export' id='tool_export' className='menu_item'>
          Export as png
        </div>

        <div
          id='tool_clear'
          className='menu_item hover:!bg-fg-red-light'
          data-action='configure'
        >
          Clear all
        </div>
      </div>
    </div>
  );
}
