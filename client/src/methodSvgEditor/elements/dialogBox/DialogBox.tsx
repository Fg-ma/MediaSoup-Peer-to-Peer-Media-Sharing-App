import React from "react";
import ReactDOM from "react-dom";

export default function DialogBox() {
  return ReactDOM.createPortal(
    <div id='dialog_box'>
      <div id='dialog_box_overlay'></div>
      <div id='dialog_container'>
        <div id='dialog_content'></div>
        <div id='dialog_buttons'></div>
      </div>
    </div>,
    document.body
  );
}
