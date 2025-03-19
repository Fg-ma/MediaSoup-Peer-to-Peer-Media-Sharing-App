import React from "react";
import ColorTools from "./lib/ColorTools";
import EyeDropperTool from "./lib/EyeDropperTool";
import ZoomTool from "./lib/ZoomTool";
import TextTool from "./lib/TextTool";
import PathTool from "./lib/PathTool";
import ShapeTool from "./lib/ShapeTool";
import EllipseTool from "./lib/EllipseTool";
import RectangleTool from "./lib/RectangleTool";
import LineTool from "./lib/LineTool";
import PencilTool from "./lib/PencilTool";
import SelectTool from "./lib/SelectTool";

export default function LeftTools() {
  return (
    <div id='tools_left' className='tools_panel'>
      <SelectTool />

      <PencilTool />

      <LineTool />

      <RectangleTool />

      <EllipseTool />

      <ShapeTool />

      <PathTool />

      <TextTool />

      <ZoomTool />

      <EyeDropperTool />

      <ColorTools />
    </div>
  );
}
