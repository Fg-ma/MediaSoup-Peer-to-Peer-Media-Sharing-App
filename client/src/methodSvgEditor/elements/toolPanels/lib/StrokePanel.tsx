import React from "react";

export default function StrokePanel() {
  return (
    <div id='stroke_panel' className='context_panel'>
      <h4 className='!font-Josefin'>Stroke</h4>
      <div className='draginputs'>
        <label className='draginput' data-title='Change stroke'>
          <input
            id='stroke_width'
            className='attr_changer !font-K2D'
            size={2}
            defaultValue='1'
            data-attr='stroke-width'
            min='0'
            max='99'
            step='1'
          />
          <span className='icon_label !font-Josefin'>Width</span>
        </label>
        <div className='stroke_tool draginput'>
          <span className='!font-Josefin'>Dash</span>
          <select
            id='stroke_style'
            data-title='Stroke dash style'
            defaultValue='none'
          >
            <option value='none'>—</option>
            <option value='2,2'>···</option>
            <option value='5,5'>- -</option>
            <option value='5,2,2,2'>-·-</option>
            <option value='5,2,2,2,2,2'>-··-</option>
          </select>
          <div className='caret'></div>
          <label id='stroke_style_label'>—</label>
        </div>

        <div className='stroke_tool draginput'>
          <span className='icon_label !font-Josefin'>Stroke Join</span>
          <select
            id='stroke_join'
            data-title='Stroke dash style'
            defaultValue='miter'
            className='text-center'
          >
            <option value='miter'>Miter</option>
            <option value='round'>Round</option>
            <option value='bevel'>Bevel</option>
          </select>
          <div className='caret'></div>
          <label id='stroke_join_label' className='!text-sm !mt-[34%]'>
            Miter
          </label>
        </div>

        <div className='stroke_tool draginput'>
          <span className='icon_label !font-Josefin'>Stroke Cap</span>
          <select
            id='stroke_cap'
            data-title='Stroke dash style'
            defaultValue='butt'
            className='text-center'
          >
            <option value='butt'>Butt</option>
            <option value='round'>Round</option>
            <option value='square'>Square</option>
          </select>
          <div className='caret'></div>
          <label id='stroke_cap_label' className='!text-sm !mt-[34%]'>
            Butt
          </label>
        </div>

        <div id='paint_order_tools'>
          <h4 className='!font-Josefin'>Paint order</h4>
          <div className='toolset paint_order_buttons' id='tool_position'>
            <label>
              <div className='col last clear' id='position_opts'>
                <div
                  className='paint_order_button'
                  id='tool_fill_stroke_markers'
                  title='Fill, stroke, markers'
                  data-paint-order='fill stroke markers'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 100 100'
                    width='27'
                    height='27'
                  >
                    <rect
                      x='41.666668'
                      y='41.666668'
                      width='58.333332'
                      height='58.333332'
                      style={{ fill: "#d40213", strokeWidth: "4.16667" }}
                    />
                    <path
                      d='M 22.916667,100 V 22.916667 H 100 v 37.5 H 60.416667 V 100 Z'
                      style={{ fill: "#f2f2f2", strokeWidth: "4.16667" }}
                    />
                    <circle
                      cx='41.666668'
                      cy='41.666668'
                      r='39.583332'
                      style={{
                        fill: "#88c3e7",
                        stroke: "#88c3e7",
                        strokeWidth: "4.16667",
                      }}
                    />
                  </svg>
                </div>
                <div
                  className='paint_order_button'
                  id='tool_stroke_fill_markers'
                  title='Stroke, fill, markers'
                  data-paint-order='stroke fill markers'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 100 100'
                    width='27'
                    height='27'
                  >
                    <path
                      d='M 22.916667,100 V 22.916667 H 100 v 37.5 H 60.416667 V 100 Z'
                      style={{ fill: "#f2f2f2", strokeWidth: "4.16667" }}
                    />
                    <rect
                      x='41.666668'
                      y='41.666668'
                      width='58.333332'
                      height='58.333332'
                      style={{ fill: "#d40213", strokeWidth: "4.16667" }}
                    />
                    <circle
                      cx='41.666668'
                      cy='41.666668'
                      r='39.583332'
                      style={{
                        fill: "#88c3e7",
                        stroke: "#88c3e7",
                        strokeWidth: "4.16667",
                      }}
                    />
                  </svg>
                </div>
                <div
                  className='paint_order_button'
                  id='tool_fill_stroke_markers'
                  title='Fill, stroke, markers'
                  data-paint-order='fill stroke markers'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 100 100'
                    width='27'
                    height='27'
                  >
                    <rect
                      x='41.666668'
                      y='41.666668'
                      width='58.333332'
                      height='58.333332'
                      style={{ fill: "#d40213", strokeWidth: "4.16667" }}
                    />
                    <circle
                      cx='41.666668'
                      cy='41.666668'
                      r='39.583332'
                      style={{
                        fill: "#88c3e7",
                        stroke: "#88c3e7",
                        strokeWidth: "4.16667",
                      }}
                    />
                    <path
                      d='M 22.916667,100 V 22.916667 H 100 v 37.5 H 60.416667 V 100 Z'
                      style={{ fill: "#f2f2f2", strokeWidth: "4.16667" }}
                    />
                  </svg>
                </div>
                <div
                  className='paint_order_button'
                  id='tool_markers_fill_stroke'
                  title='Markers, fill, stroke'
                  data-paint-order='markers fill stroke'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 100 100'
                    width='27'
                    height='27'
                  >
                    <circle
                      cx='41.666668'
                      cy='41.666668'
                      r='39.583332'
                      style={{
                        fill: "#88c3e7",
                        stroke: "#88c3e7",
                        strokeWidth: "4.16667",
                      }}
                    />
                    <rect
                      x='41.666668'
                      y='41.666668'
                      width='58.333332'
                      height='58.333332'
                      style={{ fill: "#d40213", strokeWidth: "4.16667" }}
                    />
                    <path
                      d='M 22.916667,100 V 22.916667 H 100 v 37.5 H 60.416667 V 100 Z'
                      style={{ fill: "#f2f2f2", strokeWidth: "4.16667" }}
                    />
                  </svg>
                </div>
                <div
                  className='paint_order_button'
                  id='tool_stroke_markers_fill'
                  title='Stroke, markers, fill'
                  data-paint-order='stroke markers fill'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 100 100'
                    width='27'
                    height='27'
                  >
                    <path
                      d='M 22.852377,100 V 22.852377 H 100 V 60.383653 H 60.383653 V 100 Z'
                      style={{ fill: "#f2f2f2", strokeWidth: "4.17014" }}
                    />
                    <circle
                      cx='41.618015'
                      cy='41.618015'
                      r='39.616348'
                      style={{
                        fill: "#88c3e7",
                        stroke: "#88c3e7",
                        strokeWidth: "4.00334",
                      }}
                    />
                    <rect
                      x='41.618015'
                      y='41.618015'
                      width='58.381985'
                      height='58.381985'
                      style={{ fill: "#d40213", strokeWidth: "4.17014" }}
                    />
                  </svg>
                </div>
                <div
                  className='paint_order_button'
                  id='tool_markers_stroke_fill'
                  title='Markers, stroke, fill'
                  data-paint-order='markers stroke fill'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 100 100'
                    width='27'
                    height='27'
                  >
                    <circle
                      cx='41.666668'
                      cy='41.666668'
                      r='39.583332'
                      style={{
                        fill: "#88c3e7",
                        stroke: "#88c3e7",
                        strokeWidth: "4.16667",
                      }}
                    />
                    <path
                      d='M 22.916667,100 V 22.916667 H 100 v 37.5 H 60.416667 V 100 Z'
                      style={{ fill: "#f2f2f2", strokeWidth: "4.16667" }}
                    />
                    <rect
                      x='41.666668'
                      y='41.666668'
                      width='58.333332'
                      height='58.333332'
                      style={{ fill: "#d40213", strokeWidth: "4.16667" }}
                    />
                  </svg>
                </div>
              </div>
              <div className='clearfix'></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
