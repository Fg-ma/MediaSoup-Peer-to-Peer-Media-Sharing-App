const baseFragmentShaderSource = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define VIDEO_BIT 0
  #define TWO_DIMENSIONAL_EFFECTS_BIT 1
  #define MESH_BIT 2
  #define BLUR_BIT 3
  #define TINT_BIT 4

  #define VIDEO_BLUR_RADIUS 12
  #define EFFECT_BLUR_RADIUS 8
  #define MESH_BLUR_RADIUS 8

  #define AMBIENT_COLOR vec3(0.8, 0.85, 1.0)
  #define AMBIENT_INTENSITY 0.125

  varying vec2 v_texCoord;
  varying vec3 v_normal;

  uniform vec2 u_texSize;
  uniform sampler2D u_videoTexture;
  uniform sampler2D u_twoDimEffectAtlasTexture;
  uniform sampler2D u_threeDimEffectAtlasTexture;
  uniform int u_effectFlags;
  uniform vec3 u_tintColor;
  uniform vec3 u_lightDirection; 

  void main() {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    float total = 0.0;

    if (mod(float(u_effectFlags / int(pow(2.0, float(VIDEO_BIT)))), 2.0) >= 1.0) {
      color = texture2D(u_videoTexture, v_texCoord);
    } else if (mod(float(u_effectFlags / int(pow(2.0, float(TWO_DIMENSIONAL_EFFECTS_BIT)))), 2.0) >= 1.0) {
      color = texture2D(u_twoDimEffectAtlasTexture, v_texCoord);
    } else if (mod(float(u_effectFlags / int(pow(2.0, float(MESH_BIT)))), 2.0) >= 1.0) {
      color = texture2D(u_threeDimEffectAtlasTexture, v_texCoord);
    }

    // Apply blur effect
    if (mod(float(u_effectFlags / int(pow(2.0, float(BLUR_BIT)))), 2.0) >= 1.0) {
      if (mod(float(u_effectFlags / int(pow(2.0, float(VIDEO_BIT)))), 2.0) >= 1.0) {
        for (int x = -VIDEO_BLUR_RADIUS; x <= VIDEO_BLUR_RADIUS; x++) {
          for (int y = -VIDEO_BLUR_RADIUS; y <= VIDEO_BLUR_RADIUS; y++) {
            vec2 offset = vec2(float(x), float(y)) / u_texSize;
            color += texture2D(u_videoTexture, v_texCoord + offset);
            total += 1.0;
          }
        }
      } else if (mod(float(u_effectFlags / int(pow(2.0, float(TWO_DIMENSIONAL_EFFECTS_BIT)))), 2.0) >= 1.0) {
        for (int x = -EFFECT_BLUR_RADIUS; x <= EFFECT_BLUR_RADIUS; x++) {
          for (int y = -EFFECT_BLUR_RADIUS; y <= EFFECT_BLUR_RADIUS; y++) {
            vec2 offset = vec2(float(x), float(y)) / u_texSize;
            color += texture2D(u_twoDimEffectAtlasTexture, v_texCoord + offset);
            total += 1.0;
          }
        }
      } else if (mod(float(u_effectFlags / int(pow(2.0, float(MESH_BIT)))), 2.0) >= 1.0) {
        for (int x = -MESH_BLUR_RADIUS; x <= MESH_BLUR_RADIUS; x++) {
          for (int y = -MESH_BLUR_RADIUS; y <= MESH_BLUR_RADIUS; y++) {
            vec2 offset = vec2(float(x), float(y)) / u_texSize;
            color += texture2D(u_threeDimEffectAtlasTexture, v_texCoord + offset);
            total += 1.0;
          }
        }
      }
      color /= total;
    }

    // Apply lighting effect using normals only for three dim objects
    if (mod(float(u_effectFlags / int(pow(2.0, float(MESH_BIT)))), 2.0) >= 1.0) {
      vec3 lightDir = normalize(u_lightDirection);
      vec3 norm = normalize(v_normal);
      float lightIntensity = max(dot(norm, lightDir), 0.0); // * -1.0;
      color.rgb *= lightIntensity;

      // Apply ambient lighting
      color.rgb += AMBIENT_COLOR * AMBIENT_INTENSITY; 
    }


    // Apply tint effect
    if (mod(float(u_effectFlags / int(pow(2.0, float(TINT_BIT)))), 2.0) >= 1.0) {
      vec4 texColor = color;
      float luminance = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 tintedColor = mix(texColor.rgb, u_tintColor, 0.75);
      vec3 finalColor = mix(texColor.rgb, tintedColor, luminance);
      color = vec4(finalColor, texColor.a);
    }

    gl_FragColor = color;
  }
`;

export default baseFragmentShaderSource;
