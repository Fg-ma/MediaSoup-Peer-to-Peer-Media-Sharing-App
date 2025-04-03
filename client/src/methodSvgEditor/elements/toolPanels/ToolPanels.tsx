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
import EffectsPanel from "./lib/EffectsPanel";

export default function ToolPanels({
  finishCallback,
}: {
  finishCallback?: (svg: string) => void;
}) {
  return (
    <div id='panels' className='tools_panel'>
      <div
        className='flex items-center justify-between w-full h-12 px-2 fixed bottom-0 right-2 bg-fg-tone-black-6 z-[100] rounded-t'
        style={{
          width: "calc(var(--panel-width) + 0.25rem)",
        }}
      >
        <div
          id='finish_button'
          onClick={() => {
            if (finishCallback)
              finishCallback(window.methodEditor.svgCanvas.getSvgString());
          }}
          className='!font-Josefin hover:bg-fg-red text-fg-white text-xl pt-1 rounded-l w-1/2 active text-center'
        >
          Finish
        </div>
        <div
          id='cancel_button'
          onClick={window.methodEditor?.cancel}
          className='!font-Josefin hover:bg-fg-tone-black-7 text-fg-white text-xl pt-1 rounded-r w-1/2 text-center'
        >
          Cancel
        </div>
      </div>

      <div className='flex items-center justify-between w-full h-12 pr-2'>
        <div
          id='objects_panel_button'
          className='!font-Josefin hover:bg-fg-tone-black-7 text-fg-white text-lg rounded-l w-1/2 active text-center'
        >
          Objects
        </div>
        <div
          id='editing_panel_button'
          className='!font-Josefin hover:bg-fg-tone-black-7 text-fg-white text-lg rounded-r w-1/2 text-center'
        >
          Editing
        </div>
      </div>

      <ObjectsPanel />

      <div className='editing_panels'>
        <div className='context_panel text_panel'>
          <h4 className='!font-Josefin'>Text</h4>
        </div>
      </div>

      <label
        id='text_input_label'
        className='draginput textcontent hide_text_input !h-max max-h-96 overflow-y-auto pt-5'
        style={{ width: "calc(100% - 0.5rem" }}
        data-title='Change Content'
      >
        <textarea
          id='text'
          className='text-fg-white selection:bg-fg-red-light selection:text-fg-white px-2 text-wrap overflow-y-auto h-full w-full whitespace-pre-wrap bg-transparent resize-none focus:outline-none'
          placeholder='Type here...'
        ></textarea>
        <span className='!font-Josefin'>Content</span>
      </label>

      <div className='editing_panels'>
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

        <EffectsPanel />
      </div>
    </div>
  );
}
