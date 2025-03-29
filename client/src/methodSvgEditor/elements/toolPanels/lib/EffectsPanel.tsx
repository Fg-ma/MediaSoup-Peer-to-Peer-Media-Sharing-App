import React from "react";

export default function EffectsPanel() {
  return (
    <div id='effects_panel' className='context_panel'>
      <h4 className='!font-Josefin'>Effects</h4>
      <div className='draginputs'>
        <div className='flex multidraginput_container flex-col items-center justify-center h-max'>
          <div
            className='multidraginput_label !font-Josefin text-fg-white w-full text-start'
            style={{ font: "14px / 130% sans-serif" }}
          >
            Shadow
          </div>
          <div
            className='flex grow miltidraginput_items justify-between items-center'
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <label
              id='tool_shadow_x'
              data-title='Change shadow x offset value'
              className='draginput'
            >
              <input
                id='shadow_x'
                className='attr_changer !font-K2D'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>X</span>
            </label>

            <label
              id='tool_shadow_y'
              data-title='Change shadow y value'
              className='draginput'
            >
              <input
                id='shadow_y'
                className='attr_changer !font-K2D'
                defaultValue='5'
              />
              <span className='icon_label !font-Josefin'>Y</span>
            </label>

            <label
              id='tool_shadow_strength'
              data-title='Change shadow value'
              className='draginput'
            >
              <input
                id='shadow_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='10'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              data-title='Change shadow color'
              className='draginput'
              id='shadow_color_section'
            >
              <span className='!font-Josefin'>Color</span>
              <div id='color_shadow_tools'>
                <div
                  className='color_tool active'
                  id='tool_shadow_color'
                  style={{ width: "100%", height: "100%" }}
                >
                  <div
                    className='color_block'
                    style={{ width: "100%", height: "100%" }}
                  >
                    <div id='shadow_bg'></div>
                    <div
                      id='shadow_color'
                      style={{ width: "100%", height: "100%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

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

        <div className='flex multidraginput_container flex-col items-center justify-center h-max'>
          <div
            className='multidraginput_label !font-Josefin text-fg-white w-full text-start'
            style={{ font: "14px / 130% sans-serif" }}
          >
            Wave distortion
          </div>
          <div className='flex grow miltidraginput_items justify-between items-center'>
            <label
              id='tool_wave_distortion_strength'
              data-title='Change wave distortion strength value'
              className='draginput'
            >
              <input
                id='wave_distortion_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_wave_distortion_frequency'
              data-title='Change wave distortion frequency value'
              className='draginput'
            >
              <input
                id='wave_distortion_frequency'
                className='attr_changer !font-K2D'
                step='0.01'
                min='0'
                max='1'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Frequency</span>
            </label>
          </div>
        </div>

        <div className='flex multidraginput_container flex-col items-center justify-center h-max'>
          <div
            className='multidraginput_label !font-Josefin text-fg-white w-full text-start'
            style={{ font: "14px / 130% sans-serif" }}
          >
            Cracked glass
          </div>
          <div
            className='flex grow miltidraginput_items justify-between items-center'
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <label
              id='tool_cracked_glass_frequency'
              data-title='Change cracked glass frequency value'
              className='draginput'
            >
              <input
                id='cracked_glass_frequency'
                className='attr_changer !font-K2D'
                step='0.01'
                min='0'
                max='1'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Frequency</span>
            </label>

            <label
              id='tool_cracked_glass_strength'
              data-title='Change cracked glass strength value'
              className='draginput'
            >
              <input
                id='cracked_glass_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_cracked_glass_detail'
              data-title='Change cracked glass detail value'
              className='draginput'
            >
              <input
                id='cracked_glass_detail'
                className='attr_changer !font-K2D'
                step='1'
                min='0'
                max='5'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Detail</span>
            </label>
          </div>
        </div>

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
