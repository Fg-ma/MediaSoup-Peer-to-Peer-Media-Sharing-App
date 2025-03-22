import React from "react";
import StrokePanel from "./lib/StrokePanel";
import MultiselectedPanel from "./lib/MultiselectedPanel";
import SelectedPanel from "./lib/SelectedPanel";
import PathNodePanel from "./lib/PathNodePanel";
import GPanel from "./lib/GPanel";
import UsePanel from "./lib/UsePanel";
import SvgPanel from "./lib/SvgPanel";
import TextPanel from "./lib/TextPanel";
import LinePanel from "./lib/LinePanel";
import EllipsePanel from "./lib/EllipsePanel";
import CirclePanel from "./lib/CirclePanel";
import ImagePanel from "./lib/ImagePanel";
import PathPanel from "./lib/PathPanel";
import RectanglePanel from "./lib/RectanglePanel";
import CanvasPanel from "./lib/CanvasPanel";
import ObjectsPanel from "./lib/ObjectsPanel";

export default function ToolPanels() {
  return (
    <div id='panels' className='tools_panel'>
      <div className='flex items-center justify-between w-full h-12'>
        <div
          id='objects_panel_button'
          className='!font-Josefin hover:bg-fg-tone-black-7 text-fg-white text-lg px-2 rounded active'
        >
          Objects
        </div>
        <div
          id='editing_panel_button'
          className='!font-Josefin hover:bg-fg-tone-black-7 text-fg-white text-lg px-2 rounded'
        >
          Editing
        </div>
      </div>

      <ObjectsPanel />

      <div id='editing_panels'>
        <CanvasPanel />

        <RectanglePanel />

        <PathPanel />

        <ImagePanel />

        <CirclePanel />

        <EllipsePanel />

        <LinePanel />

        <TextPanel />

        <SvgPanel />

        <UsePanel />

        <GPanel />

        <PathNodePanel />

        <SelectedPanel />

        <MultiselectedPanel />

        <StrokePanel />
      </div>
    </div>
  );
}
