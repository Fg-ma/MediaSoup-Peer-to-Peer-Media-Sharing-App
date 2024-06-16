const fragmentShaderSource = `
  #define MAX_FACES 8
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  // Blur
  uniform float u_blurRadius;
  uniform vec2 u_textureSize;

  // Tint
  uniform vec3 u_tintColor;

  // Effect booleans
  uniform bool u_blurEffect;
  uniform bool u_tintEffect;
  uniform bool u_dogEarsEffect;
  uniform bool u_glassesEffect;

  // Effect images
  uniform sampler2D u_leftDogEarImage;
  uniform float u_leftDogEarAspectRatio;
  uniform sampler2D u_rightDogEarImage;
  uniform float u_rightDogEarAspectRatio;
  uniform sampler2D u_glassesImage;
  uniform float u_glassesAspectRatio;

  // Universal face data
  uniform int u_faceCount;
  uniform float u_headRotationAngles[MAX_FACES]; 

  // Ears
  uniform vec2 u_leftEarPositions[MAX_FACES]; 
  uniform vec2 u_rightEarPositions[MAX_FACES]; 
  uniform vec2 u_leftEarSizes[MAX_FACES]; 
  uniform vec2 u_rightEarSizes[MAX_FACES];

  // Eyes
  uniform vec2 u_leftEyePositions[MAX_FACES];
  uniform vec2 u_rightEyePositions[MAX_FACES];
  uniform vec2 u_eyesCenters[MAX_FACES];
  uniform float u_eyesWidths[MAX_FACES];

  mat2 getRotationMatrix(float angle) {
    float cosA = cos(angle);
    float sinA = sin(angle);
    return mat2(cosA, -sinA, sinA, cosA);
  }

  void applyEarEffect(inout vec4 color, vec2 texCoord, sampler2D earImage, vec2 earPosition, vec2 earSize, float headRotationAngle) {
    float earHeight = earWidth / earAspectRatio;
    vec2 earSize = vec2(earWidth, earHeight);  
  
    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 earTexCoord = (rotationMatrix * (texCoord - earPosition) * u_textureSize / earSize) + 0.5;
    vec4 earColor = texture2D(earImage, earTexCoord);
    if (earColor.a > 0.0) {
      color = mix(color, earColor, earColor.a);
    }
  }

  void applyGlassesEffect(inout vec4 color, vec2 texCoord, sampler2D glassesImage, vec2 eyeCenter, float glassesWidth, float headRotationAngle) {
    float glassesHeight = glassesWidth / u_glassesAspectRatio;
    vec2 glassesSize = vec2(glassesWidth, glassesHeight);

    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 glassesTexCoord = (rotationMatrix * (texCoord - eyeCenter) * u_textureSize / glassesSize) + 0.5;
    vec4 glassesColor = texture2D(glassesImage, glassesTexCoord);
    if (glassesColor.a > 0.0) {
      color = mix(color, glassesColor, glassesColor.a);
    }
  }

  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
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
    if (u_dogEarsEffect) {
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyEarEffect(color, v_texCoord, u_leftDogEarImage, u_leftEarPositions[i], u_leftEarSizes[i], u_headRotationAngles[i]);
          applyEarEffect(color, v_texCoord, u_rightDogEarImage, u_rightEarPositions[i], u_rightEarSizes[i], u_headRotationAngles[i]);
        }
      }
    }

    // Apply glasses effect
    if (u_glassesEffect) {
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyGlassesEffect(color, v_texCoord, u_glassesImage, u_eyesCenters[i], u_eyesWidths[i], u_headRotationAngles[i]);
        }
      }
    }

    gl_FragColor = color;
  }
`;

export default fragmentShaderSource;
