const fragmentShaderSource = `
  #define MAX_FACES 8
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
  uniform float u_headRotationAngle;
  uniform vec2 u_leftEarPositions[MAX_FACES]; 
  uniform vec2 u_rightEarPositions[MAX_FACES]; 
  uniform vec2 u_leftEarSizes[MAX_FACES]; 
  uniform vec2 u_rightEarSizes[MAX_FACES];
  uniform float u_headRotationAngles[MAX_FACES]; 
  uniform int u_faceCount;

  mat2 getRotationMatrix(float angle) {
    float cosA = cos(angle);
    float sinA = sin(angle);
    return mat2(cosA, -sinA, sinA, cosA);
  }

  void applyEarEffect(inout vec4 color, vec2 texCoord, sampler2D earImage, vec2 earPosition, vec2 earSize, float headRotationAngle) {
    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);
    vec2 earTexCoord = (rotationMatrix * (texCoord - earPosition) * u_textureSize / earSize) + 0.5;
    vec4 earColor = texture2D(earImage, earTexCoord);
    if (earColor.a > 0.0) {
      color = mix(color, earColor, earColor.a);
    }
  }

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
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyEarEffect(color, v_texCoord, u_earImageLeft, u_leftEarPositions[i], u_leftEarSizes[i], u_headRotationAngles[i]);
          applyEarEffect(color, v_texCoord, u_earImageRight, u_rightEarPositions[i], u_rightEarSizes[i], u_headRotationAngles[i]);
        }
      }
    }

    gl_FragColor = color;
  }
`;

export default fragmentShaderSource;
