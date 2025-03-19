import React from "react";
import Palette from "./lib/Palette";
import Zoom from "./lib/Zoom";

export default function BottomTools() {
  return (
    <div id='tools_bottom' className='tools_panel'>
      <Zoom />

      <Palette />
    </div>
  );
}
