import React from "react";

export default function EffectsPanel() {
  return (
    <div id='effects_panel' className='context_panel'>
      <h4 className='!font-Josefin'>Effects</h4>
      <div className='draginputs'>
        <label
          id='tool_shadow'
          data-title='Change shadow value'
          className='draginput'
        >
          <input
            id='shadow'
            className='attr_changer !font-K2D'
            step='0.1'
            min='0'
            max='1'
            defaultValue='1'
          />
          <span className='icon_label !font-Josefin'>Shadow</span>
        </label>

        <label id='tool_blur' data-title='Change gaussian blur value'>
          <input
            id='blur'
            className='attr_changer !font-K2D'
            size={2}
            defaultValue='0'
            step='.1'
            min='0'
            max='20'
          />
          <span className='icon_label !font-Josefin'>Blur</span>
        </label>

        <label
          id='tool_grayscale'
          data-title='Change grayscale value'
          className='draginput'
        >
          <input
            id='grayscale'
            className='attr_changer !font-K2D'
            step='0.01'
            min='0'
            max='1'
            defaultValue='1'
          />
          <span className='icon_label !font-Josefin'>Grayscale</span>
        </label>

        <label
          id='tool_saturation'
          data-title='Change saturation value'
          className='draginput'
        >
          <input
            id='saturation'
            className='attr_changer !font-K2D'
            step='0.1'
            min='0'
            max='5'
            defaultValue='1'
          />
          <span className='icon_label !font-Josefin'>Saturation</span>
        </label>

        <label
          id='tool_edge_detection'
          data-title='Change edge detection value'
          className='toggleinput'
        >
          <span className='toggle_input_label !font-Josefin'>
            Edge detection
          </span>
        </label>

        <label
          id='tool_color_overlay'
          data-title='Change color overlay value'
          className='draginput'
        >
          <input
            id='color_overlay'
            className='attr_changer !font-K2D'
            step='0.1'
            min='0'
            max='1'
            defaultValue='1'
          />
          <span className='icon_label !font-Josefin'>Color overlay</span>
        </label>

        <label
          id='tool_wave_distortion'
          data-title='Change wave distortion value'
          className='draginput'
        >
          <input
            id='wave_distortion'
            className='attr_changer !font-K2D'
            step='0.1'
            min='0'
            max='1'
            defaultValue='1'
          />
          <span className='icon_label !font-Josefin'>Wave distortion</span>
        </label>

        <label
          id='tool_cracked_glass'
          data-title='Change cracked glass value'
          className='draginput'
        >
          <input
            id='cracked_glass'
            className='attr_changer !font-K2D'
            step='0.1'
            min='0'
            max='1'
            defaultValue='1'
          />
          <span className='icon_label !font-Josefin'>Cracked glass</span>
        </label>

        <label
          id='tool_neon_glow'
          data-title='Change neon glow value'
          className='draginput'
        >
          <input
            id='neon_glow'
            className='attr_changer !font-K2D'
            step='0.1'
            min='0'
            max='1'
            defaultValue='1'
          />
          <span className='icon_label !font-Josefin'>Neon glow</span>
        </label>
      </div>
    </div>
  );
}
