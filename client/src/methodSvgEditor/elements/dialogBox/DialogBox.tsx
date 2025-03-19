import React from "react";

export default function DialogBox() {
  return (
    <div id='dialog_box'>
      <div id='dialog_box_overlay'></div>
      <div id='dialog_container'>
        <div id='dialog_content'></div>
        <div id='dialog_buttons'></div>
      </div>
    </div>
  );
}
