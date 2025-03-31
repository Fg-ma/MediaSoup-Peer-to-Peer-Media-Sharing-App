import React from "react";

export default function EffectsPanel() {
  return (
    <div id='effects_panel' className='context_panel'>
      <h4 className='!font-Josefin'>Effects</h4>
      <div className='draginputs'>
        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Shadow</div>
          <div className='miltidraginput_items'>
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
          data-title='Toggle edge detection'
          className='toggleinput'
        >
          <span className='toggle_input_label !font-Josefin'>
            Edge detection
          </span>
        </label>

        <label
          data-title='Change overlay color'
          className='draginput'
          id='overlay_color_section'
        >
          <span className='!font-Josefin'>Overlay</span>
          <div id='color_overlay_tools'>
            <div
              className='color_tool active'
              id='tool_overlay_color'
              style={{ width: "100%", height: "100%" }}
            >
              <div
                className='color_block'
                style={{ width: "100%", height: "100%" }}
              >
                <div id='overlay_bg'></div>
                <div
                  id='overlay_color'
                  style={{ width: "100%", height: "100%" }}
                ></div>
              </div>
            </div>
          </div>
        </label>

        <label
          data-title='Change neon color'
          className='draginput'
          id='neon_color_section'
        >
          <span className='!font-Josefin'>Neon glow</span>
          <div id='color_neon_tools'>
            <div
              className='color_tool active'
              id='tool_neon_color'
              style={{ width: "100%", height: "100%" }}
            >
              <div
                className='color_block'
                style={{ width: "100%", height: "100%" }}
              >
                <div id='neon_bg'></div>
                <div
                  id='neon_color'
                  style={{ width: "100%", height: "100%" }}
                ></div>
              </div>
            </div>
          </div>
        </label>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Wave distortion</div>
          <div className='miltidraginput_items'>
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

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Cracked glass</div>
          <div className='miltidraginput_items'>
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
          id='tool_invert'
          data-title='Toggle invert'
          className='toggleinput'
        >
          <span className='toggle_input_label !font-Josefin'>Invert</span>
        </label>

        <label
          id='tool_hue_shift'
          data-title='Change hue shift'
          className='draginput'
        >
          <input
            id='hue_shift'
            className='attr_changer !font-K2D'
            step='1'
            min='0'
            max='360'
            defaultValue='0'
          />
          <span className='icon_label !font-Josefin'>Hue shift</span>
        </label>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Color highlights</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_color_highlight_r'
              data-title='Change cracked glass frequency value'
              className='draginput'
            >
              <input
                id='color_highlight_r'
                className='attr_changer !font-K2D'
                step='0.01'
                min='0'
                max='1'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>R</span>
            </label>

            <label
              id='tool_color_highlight_g'
              data-title='Change cracked glass strength value'
              className='draginput'
            >
              <input
                id='color_highlight_g'
                className='attr_changer !font-K2D'
                step='0.01'
                min='0'
                max='1'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>G</span>
            </label>

            <label
              id='tool_color_highlight_b'
              data-title='Change cracked glass detail value'
              className='draginput'
            >
              <input
                id='color_highlight_b'
                className='attr_changer !font-K2D'
                step='0.01'
                min='0'
                max='1'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>B</span>
            </label>
          </div>
        </div>

        <label
          id='tool_gooey'
          data-title='Change gooey strength'
          className='draginput'
        >
          <input
            id='gooey_strength'
            className='attr_changer !font-K2D'
            step='0.1'
            min='0'
            max='50'
            defaultValue='0'
          />
          <span className='icon_label !font-Josefin'>Gooey</span>
        </label>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Cyberpunk</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_cyberpunk_strength'
              data-title='Change cyberpunk strength value'
              className='draginput'
            >
              <input
                id='cyberpunk_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_cyberpunk_speed'
              data-title='Change cyberpunk speed value'
              className='draginput'
            >
              <input
                id='cyberpunk_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Fire</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_fire_strength'
              data-title='Change fire strength value'
              className='draginput'
            >
              <input
                id='fire_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_fire_speed'
              data-title='Change fire speed value'
              className='draginput'
            >
              <input
                id='fire_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Glitch</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_glitch_strength'
              data-title='Change glitch strength value'
              className='draginput'
            >
              <input
                id='glitch_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_glitch_offset'
              data-title='Change glitch offset value'
              className='draginput'
            >
              <input
                id='glitch_offset'
                className='attr_changer !font-K2D'
                step='1'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Offset</span>
            </label>

            <label
              id='tool_glitch_speed'
              data-title='Change glitch speed value'
              className='draginput'
            >
              <input
                id='glitch_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Electricity</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_electricity_strength'
              data-title='Change electricity strength value'
              className='draginput'
            >
              <input
                id='electricity_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_electricity_speed'
              data-title='Change electricity speed value'
              className='draginput'
            >
              <input
                id='electricity_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Wavy</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_wavy_strength'
              data-title='Change wavy strength value'
              className='draginput'
            >
              <input
                id='wavy_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_wavy_frequency'
              data-title='Change wavy frequency value'
              className='draginput'
            >
              <input
                id='wavy_frequency'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Frequency</span>
            </label>

            <label
              id='tool_wavy_detail'
              data-title='Change wavy detail value'
              className='draginput'
            >
              <input
                id='wavy_detail'
                className='attr_changer !font-K2D'
                step='1'
                min='0'
                max='8'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Detail</span>
            </label>

            <label
              id='tool_wavy_speed'
              data-title='Change wavy speed value'
              className='draginput'
            >
              <input
                id='wavy_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Signal corrupt</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_signal_corrupt_strength'
              data-title='Change signal corrupt strength value'
              className='draginput'
            >
              <input
                id='signal_corrupt_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_signal_corrupt_speed'
              data-title='Change signal corrupt speed value'
              className='draginput'
            >
              <input
                id='signal_corrupt_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Heart beat</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_heart_beat_strength'
              data-title='Change heart beat strength value'
              className='draginput'
            >
              <input
                id='heart_beat_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_heart_beat_speed'
              data-title='Change heart beat speed value'
              className='draginput'
            >
              <input
                id='heart_beat_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Fragment</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_fragment_strength'
              data-title='Change fragment strength value'
              className='draginput'
            >
              <input
                id='fragment_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_fragment_speed'
              data-title='Change fragment speed value'
              className='draginput'
            >
              <input
                id='fragment_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Sparks</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_sparks_strength'
              data-title='Change sparks strength value'
              className='draginput'
            >
              <input
                id='sparks_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_sparks_speed'
              data-title='Change sparks speed value'
              className='draginput'
            >
              <input
                id='sparks_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Duo pulse</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_duo_pulse_strength'
              data-title='Change duo pulse strength value'
              className='draginput'
            >
              <input
                id='duo_pulse_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_duo_pulse_offset'
              data-title='Change duo pulse offset value'
              className='draginput'
            >
              <input
                id='duo_pulse_offset'
                className='attr_changer !font-K2D'
                step='1'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Offset</span>
            </label>

            <label
              id='tool_duo_pulse_speed'
              data-title='Change duo pulse speed value'
              className='draginput'
            >
              <input
                id='duo_pulse_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Wiggle</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_wiggle_strength'
              data-title='Change wiggle strength value'
              className='draginput'
            >
              <input
                id='wiggle_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_wiggle_speed'
              data-title='Change wiggle speed value'
              className='draginput'
            >
              <input
                id='wiggle_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>Chaos machine</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_chaos_machine_strength'
              data-title='Change chaos machin strength value'
              className='draginput'
            >
              <input
                id='chaos_machine_strength'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='50'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Strength</span>
            </label>

            <label
              id='tool_chaos_machine_speed'
              data-title='Change chaos machine speed value'
              className='draginput'
            >
              <input
                id='chaos_machine_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>

        <div className='multidraginput_container'>
          <div className='multidraginput_label'>3D</div>
          <div className='miltidraginput_items'>
            <label
              id='tool_three_dim_offset'
              data-title='Change 3D offset value'
              className='draginput'
            >
              <input
                id='three_dim_offset'
                className='attr_changer !font-K2D'
                step='1'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Offset</span>
            </label>

            <label
              id='tool_three_dim_speed'
              data-title='Change 3D speed value'
              className='draginput'
            >
              <input
                id='three_dim_speed'
                className='attr_changer !font-K2D'
                step='0.1'
                min='0'
                max='6'
                defaultValue='0'
              />
              <span className='icon_label !font-Josefin'>Speed</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
