import React from "react";

export default function FileMenu() {
  return (
    <div className='menu'>
      <div className='menu_title'>File</div>
      <div className='menu_list inverted-undo' id='file_menu'>
        <div data-action='clear' id='tool_clear' className='menu_item'>
          New Document
        </div>

        <div id='tool_open' className='menu_item'>
          <input type='file' accept='image/svg+xml' id='tool_open_input' />
          Open SVG...{" "}
          <span className='shortcut' style={{ display: "none" }}>
            ⌘O
          </span>
        </div>

        <div id='tool_import' className='menu_item'>
          <input type='file' accept='image/*' id='tool_import_input' />
          Place Image...{" "}
          <span className='shortcut' style={{ display: "none" }}>
            ⌘K
          </span>
        </div>
        <div data-action='save' id='tool_save' className='menu_item'>
          Save Image... <span className='shortcut'>⌘S</span>
        </div>
        <div data-action='export' id='tool_export' className='menu_item'>
          Export as PNG
        </div>
      </div>
    </div>
  );
}
