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

        <filter id='digitalGlitch'>
          <feColorMatrix
            values='0 0 0 0 0  0 0 0 0 0  0 0 1.5 0 0  0 0 0 1 0'
            result='glitchMatrixBlue'
            in='SourceGraphic'
            type='matrix'
          >
            <animate
              keySplines='.42,0,.58,1; .25,1,.75,0; .42,0,.58,1'
              calcMode='spline'
              keyTimes='0; 0.25; 1'
              values='0 0 0 0 0  0 0 0 0 0  0 0 1.5 0 0  0 0 0 1 0;                                                0 0 0 0 0  0 0 0 0 0  0 0 3 0 -0.5  0 0 0 1 0;                                                0 0 0 0 0  0 0 0 0 0  0 0 1.5 0 0  0 0 0 1 0'
              repeatCount='indefinite'
              dur='1.5s'
              attributeName='values'
            />
          </feColorMatrix>
          <feColorMatrix
            values='1.5 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'
            result='glitchMatrixRed'
            in='SourceGraphic'
            type='matrix'
          >
            <animate
              keySplines='.42,0,.58,1; .25,1,.75,0; .42,0,.58,1'
              calcMode='spline'
              keyTimes='0; 0.25; 1'
              values='1.5 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0;                                                3 0 0 0 -0.5  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0;                                                1.5 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'
              repeatCount='indefinite'
              dur='1.5s'
              attributeName='values'
            />
          </feColorMatrix>
          <feOffset dy='1.5' dx='5' result='offsetBlue' in='glitchMatrixBlue'>
            <animate
              keySplines='.42,0,.58,1; .42,0,.58,1'
              calcMode='spline'
              keyTimes='0; 0.25; 1'
              values='5; 0; 0'
              repeatCount='indefinite'
              dur='1.5s'
              attributeName='dx'
            />
            <animate
              keySplines='.42,0,.58,1; .42,0,.58,1'
              calcMode='spline'
              keyTimes='0; 0.25; 1'
              values='0.5; 0; 0'
              repeatCount='indefinite'
              dur='1.5s'
              attributeName='dy'
            />
          </feOffset>
          <feOffset dy='-1.5' dx='-3' result='offsetRed' in='glitchMatrixRed'>
            <animate
              begin='0.03s'
              keySplines='.42,0,.58,1; .42,0,.58,1'
              calcMode='spline'
              keyTimes='0; 0.25; 1'
              values='-4; 0; 0'
              repeatCount='indefinite'
              dur='1.5s'
              attributeName='dx'
            />
            <animate
              begin='0.03s'
              keySplines='.42,0,.58,1; .42,0,.58,1'
              calcMode='spline'
              keyTimes='0; 0.25; 1'
              values='-3; 0; 0'
              repeatCount='indefinite'
              dur='1.5s'
              attributeName='dy'
            />
          </feOffset>
          <feGaussianBlur
            result='blurredBlue'
            stdDeviation='1.5'
            in='offsetBlue'
          >
            <animate
              keySplines='.42,0,.58,1; .42,0,.58,1; .42,0,.58,1'
              calcMode='spline'
              attributeName='stdDeviation'
              dur='1.5s'
              repeatCount='indefinite'
              values='1.5; 0; 0; 0'
              keyTimes='0; 0.25; 0.75; 1'
            />
          </feGaussianBlur>
          <feGaussianBlur result='blurredRed' stdDeviation='1.5' in='offsetRed'>
            <animate
              keySplines='.42,0,.58,1; .42,0,.58,1; .42,0,.58,1'
              calcMode='spline'
              attributeName='stdDeviation'
              dur='1.5s'
              repeatCount='indefinite'
              values='1.5; 0; 0; 0'
              keyTimes='0; 0.25; 0.75; 1'
            />
          </feGaussianBlur>
          <feMerge>
            <feMergeNode in='blurredBlue' />
            <feMergeNode in='blurredRed' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
        <filter id='electricPulse'>
          <feGaussianBlur result='blurred' stdDeviation='3' in='SourceAlpha' />
          <feFlood result='neonColor' flood-opacity='1' flood-color='#ffcc00'>
            <animate
              attributeName='flood-opacity'
              values='1;0.2;1;0.5;1'
              dur='0.3s'
              repeatCount='indefinite'
            />
          </feFlood>
          <feComposite
            result='glow'
            operator='in'
            in2='blurred'
            in='neonColor'
          />
          <feMerge>
            <feMergeNode in='glow' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
        <filter id='wavyDistortion'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency='0.02'
            numOctaves='3'
            result='noise'
          >
            <animate
              attributeName='baseFrequency'
              values='0.02;0.05;0.02'
              dur='1s'
              repeatCount='indefinite'
            />
          </feTurbulence>
          <feDisplacementMap in='SourceGraphic' in2='noise' scale='10' />
        </filter>
        <filter id='scanlineGlitch'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency='0.2 0.01'
            numOctaves='3'
            result='noise'
          />
          <feDisplacementMap
            in='SourceGraphic'
            in2='noise'
            scale='15'
            xChannelSelector='R'
            yChannelSelector='G'
          >
            <animate
              attributeName='scale'
              values='5;15;5'
              dur='0.2s'
              repeatCount='indefinite'
            />
          </feDisplacementMap>
        </filter>
        <filter id='heartbeat'>
          <feMorphology
            result='expanded'
            in='SourceGraphic'
            radius='0'
            operator='dilate'
          >
            <animate
              repeatCount='indefinite'
              dur='0.8s'
              values='0;3;0'
              attributeName='radius'
            />
          </feMorphology>
          <feMerge>
            <feMergeNode in='expanded' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
        <filter id='glitchFragment'>
          <feMorphology
            operator='erode'
            radius='1'
            in='SourceGraphic'
            result='fragment'
          >
            <animate
              attributeName='radius'
              values='1;4;1'
              dur='0.2s'
              repeatCount='indefinite'
            />
          </feMorphology>
          <feTurbulence
            type='fractalNoise'
            baseFrequency='0.1 0.5'
            numOctaves='2'
            result='turbulence'
          >
            <animate
              attributeName='baseFrequency'
              values='0.1 0.5; 0.2 0.7; 0.1 0.5'
              dur='0.3s'
              repeatCount='indefinite'
            />
          </feTurbulence>
          <feDisplacementMap in='fragment' in2='turbulence' scale='8' />
        </filter>
        <filter id='electricSparks'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency='0.1 0.3'
            numOctaves='2'
            seed='2'
            result='static'
          />
          <feDisplacementMap
            in='SourceGraphic'
            in2='static'
            scale='10'
            result='distorted'
          >
            <animate
              attributeName='scale'
              values='10; 30; 10'
              dur='0.2s'
              repeatCount='indefinite'
            />
          </feDisplacementMap>
          <feColorMatrix
            type='matrix'
            in='distorted'
            result='colorShift'
            values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'
          >
            <animate
              attributeName='values'
              values='1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 1 0;
                                            1 0.2 0 0 0   0 1 0.2 0 0   0.2 0 1 0 0   0 0 0 1 0;
                                            1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 1 0'
              dur='0.2s'
              repeatCount='indefinite'
            />
          </feColorMatrix>
          <feMerge>
            <feMergeNode in='colorShift' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
        <filter id='neuralPulse'>
          <feTurbulence
            type='fractalNoise'
            baseFrequency='0.05 0.1'
            numOctaves='5'
            result='warp'
          >
            <animate
              attributeName='baseFrequency'
              values='0.05 0.1; 0.08 0.15; 0.05 0.1'
              dur='2s'
              repeatCount='indefinite'
            />
          </feTurbulence>
          <feDisplacementMap in='SourceGraphic' in2='warp' scale='20'>
            <animate
              attributeName='scale'
              values='20; 35; 20'
              dur='2s'
              repeatCount='indefinite'
            />
          </feDisplacementMap>
          <feColorMatrix
            type='matrix'
            result='colorShift'
            values='1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 1 0'
          >
            <animate
              attributeName='values'
              values='
      1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 1 0;
      1 0.2 0 0 0   0.2 1 0 0 0   0 0.2 1 0 0   0 0 0 1 0;
      1 0 0 0 0   0 1 0 0 0   0 0 1 0 0   0 0 0 1 0'
              dur='1.5s'
              repeatCount='indefinite'
            />
          </feColorMatrix>
        </filter>
        <filter id='chaoticRipples'>
          <feTurbulence
            result='noise'
            numOctaves='4'
            baseFrequency='0.03 0.07'
            type='turbulence'
          >
            <animate
              repeatCount='indefinite'
              dur='1s'
              values='0.03 0.07; 0.08 0.15; 0.03 0.07'
              attributeName='baseFrequency'
            />
          </feTurbulence>
          <feDisplacementMap scale='25' in2='noise' in='SourceGraphic'>
            <animate
              repeatCount='indefinite'
              dur='1s'
              values='25; 50; 25'
              attributeName='scale'
            />
          </feDisplacementMap>
          <feMorphology radius='1' operator='dilate'>
            <animate
              repeatCount='indefinite'
              dur='1s'
              values='1; 4; 1'
              attributeName='radius'
            />
          </feMorphology>
        </filter>
        <filter id='phantomShatter'>
          <feOffset result='redShift' dy='0' dx='-5' in='SourceGraphic'>
            <animate
              repeatCount='indefinite'
              dur='0.7s'
              values='-5; -15; -5'
              attributeName='dx'
            />
          </feOffset>
          <feColorMatrix
            values='1 0 0 0 0               0 0 0 0 0               0 0 0 0 0               0 0 0 0.5 0'
            result='redTint'
            type='matrix'
            in='redShift'
          />
          <feOffset result='blueShift' dy='0' dx='5' in='SourceGraphic'>
            <animate
              repeatCount='indefinite'
              dur='0.7s'
              values='5; 15; 5'
              attributeName='dx'
            />
          </feOffset>
          <feColorMatrix
            values='0 0 0 0 0               0 0 1 0 0               0 0 1 0 0               0 0 0 0.5 0'
            result='blueTint'
            type='matrix'
            in='blueShift'
          />
          <feMerge>
            <feMergeNode in='redTint' />
            <feMergeNode in='blueTint' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </div>
    </div>
  );
}
