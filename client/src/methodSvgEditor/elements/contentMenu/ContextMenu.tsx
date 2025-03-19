import React from "react";

export default function ContextMenu() {
  return (
    <ul id='cmenu_canvas' className='contextMenu'>
      <li>
        <a href='#cut'>
          Cut <span className='shortcut'>⌘X;</span>
        </a>
      </li>
      <li>
        <a href='#copy'>
          Copy<span className='shortcut'>⌘C</span>
        </a>
      </li>
      <li>
        <a href='#paste'>
          Paste<span className='shortcut'>⌘V</span>
        </a>
      </li>
      <li className='separator'>
        <a href='#delete'>
          Delete<span className='shortcut'>⌫</span>
        </a>
      </li>
      <li className='separator'>
        <a href='#group'>
          Group<span className='shortcut'>⌘G</span>
        </a>
      </li>
      <li>
        <a href='#ungroup'>
          Ungroup<span className='shortcut'>⌘⇧G</span>
        </a>
      </li>
      <li className='separator'>
        <a href='#move_front'>
          Bring to Front<span className='shortcut'>⌘⇧↑</span>
        </a>
      </li>
      <li>
        <a href='#move_up'>
          Bring Forward<span className='shortcut'>⌘↑</span>
        </a>
      </li>
      <li>
        <a href='#move_down'>
          Send Backward<span className='shortcut'>⌘↓</span>
        </a>
      </li>
      <li>
        <a href='#move_back'>
          Send to Back<span className='shortcut'>⌘⇧↓</span>
        </a>
      </li>
    </ul>
  );
}
