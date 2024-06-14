const fragmentShaderSource = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform float u_blurRadius;
  uniform vec2 u_textureSize;
  uniform vec3 u_tintColor;
  uniform bool u_blurEffect;
  uniform bool u_tintEffect;
  uniform bool u_dogEars;
  uniform sampler2D u_earImageLeft;
  uniform sampler2D u_earImageRight;
  uniform vec2 u_leftEarPosition;
  uniform vec2 u_rightEarPosition;
  uniform vec2 u_leftEarSize;
  uniform vec2 u_rightEarSize;

  void main() {
    vec4 color = vec4(0.0);
    float total = 0.0;

    const int MAX_RADIUS = 32;

    // Apply blur effect
    if (u_blurEffect) {
      for (int x = -MAX_RADIUS; x <= MAX_RADIUS; x++) {
        for (int y = -MAX_RADIUS; y <= MAX_RADIUS; y++) {
          if (abs(float(x)) <= u_blurRadius && abs(float(y)) <= u_blurRadius) {
            vec2 offset = vec2(float(x), float(y)) / u_textureSize;
            color += texture2D(u_image, v_texCoord + offset);
            total += 1.0;
          }
        }
      }
      color /= total;
    } else {
      color = texture2D(u_image, v_texCoord);
    }

    // Apply tint effect
    if (u_tintEffect) {
      vec4 texColor = color;
      float luminance = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 tintedColor = mix(texColor.rgb, u_tintColor, 0.75);
      vec3 finalColor = mix(texColor.rgb, tintedColor, luminance);
      color = vec4(finalColor, texColor.a);
    }

    // Apply dog ears effect
    if (u_dogEars) {
      vec2 leftEarTexCoord = (v_texCoord - (u_leftEarPosition / u_textureSize)) / (u_leftEarSize / u_textureSize) + 0.5;
      vec2 rightEarTexCoord = (v_texCoord - (u_rightEarPosition / u_textureSize)) / (u_rightEarSize / u_textureSize) + 0.5;

      vec4 leftEarColor = texture2D(u_earImageLeft, leftEarTexCoord);
      vec4 rightEarColor = texture2D(u_earImageRight, rightEarTexCoord);

      if (leftEarColor.a > 0.0) {
        color = mix(color, leftEarColor, leftEarColor.a);
      }
      if (rightEarColor.a > 0.0) {
        color = mix(color, rightEarColor, rightEarColor.a);
      }
    }

    gl_FragColor = color;
  }
`;

export default fragmentShaderSource;
