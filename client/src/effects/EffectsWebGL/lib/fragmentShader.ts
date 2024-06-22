const fragmentShaderSource = `
  #define MAX_FACES 8
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  // Universal face data
  uniform int u_faceCount;
  uniform float u_headRotationAngles[MAX_FACES]; 
  uniform float u_headPitchAngles[MAX_FACES]; 
  uniform float u_headYawAngles[MAX_FACES];

  // Blur
  uniform float u_blurRadius;
  uniform vec2 u_textureSize;

  // Tint
  uniform vec3 u_tintColor;

  // Effect booleans
  uniform bool u_blurEffect;
  uniform bool u_tintEffect;
  uniform bool u_earsEffect;
  uniform bool u_glassesEffect;
  uniform bool u_beardEffect;
  uniform bool u_mustacheEffect;

  // Effect images
  uniform sampler2D u_leftEarImage;
  uniform float u_leftEarAspectRatio;
  uniform sampler2D u_rightEarImage;
  uniform float u_rightEarAspectRatio;
  uniform vec2 u_earsImageOffset;
  uniform sampler2D u_glassesImage;
  uniform float u_glassesAspectRatio;
  uniform sampler2D u_beardImage;
  uniform float u_beardAspectRatio;
  uniform vec2 u_beardImageOffset;
  uniform sampler2D u_mustacheImage;
  uniform float u_mustacheAspectRatio;
  uniform vec2 u_mustacheImageOffset;

  // Ears
  uniform vec2 u_leftEarPositions[MAX_FACES]; 
  uniform vec2 u_rightEarPositions[MAX_FACES]; 
  uniform float u_leftEarWidths[MAX_FACES]; 
  uniform float u_rightEarWidths[MAX_FACES];

  // Eyes
  uniform vec2 u_leftEyePositions[MAX_FACES];
  uniform vec2 u_rightEyePositions[MAX_FACES];
  uniform vec2 u_eyesCenters[MAX_FACES];
  uniform float u_eyesWidths[MAX_FACES];

  // Chin
  uniform vec2 u_chinPositions[MAX_FACES];
  uniform float u_chinWidths[MAX_FACES];

  // Nose
  uniform vec2 u_nosePositions[MAX_FACES];

  mat2 getRotationMatrix(float angle) {
    float cosA = cos(angle);
    float sinA = sin(angle);
    return mat2(cosA, -sinA, sinA, cosA);
  }

  void applyEarEffect(inout vec4 color, vec2 texCoord, sampler2D earImage, vec2 earPosition, float earWidth, float earAspectRatio, float headRotationAngle) {
    float earHeight = earWidth / earAspectRatio;
    vec2 earSize = vec2(earWidth, earHeight);  
  
    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 earTexCoord = (rotationMatrix * (texCoord - earPosition + u_earsImageOffset) * u_textureSize / earSize) + 0.5;
    vec4 earColor = texture2D(earImage, earTexCoord);
    if (earColor.a > 0.0) {
      color = mix(color, earColor, earColor.a);
    }
  }

  void applyGlassesEffect(inout vec4 color, vec2 texCoord, sampler2D glassesImage, vec2 eyeCenter, float glassesWidth, float headRotationAngle, float headPitchAngle, float headYawAngle) {
    // Calculate the aspect ratio of the glasses
    float glassesHeight = glassesWidth / u_glassesAspectRatio;
    vec2 glassesSize = vec2(glassesWidth, glassesHeight);

    // Calculate the rotation matrix
    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    // Calculate scaling factors for pitch and yaw
    float pitchStretch = tan(headPitchAngle);
    float yawStretch = tan(headYawAngle);

    // Calculate the half-size of the glasses
    vec2 halfGlassesSize = glassesSize / 2.0;

    // Calculate offsets from eyeCenter
    vec2 topLeftOffset = -halfGlassesSize;
    vec2 topRightOffset = vec2(halfGlassesSize.x, -halfGlassesSize.y);
    vec2 bottomLeftOffset = vec2(-halfGlassesSize.x, halfGlassesSize.y);
    vec2 bottomRightOffset = halfGlassesSize;

    // Apply pitch distortion to offsets
    if (pitchStretch > 0.0) {
      topLeftOffset.x += pitchStretch * halfGlassesSize.x;
      topRightOffset.x -= pitchStretch * halfGlassesSize.x;
    } else if (pitchStretch < 0.0) {
      bottomLeftOffset.x -= pitchStretch * halfGlassesSize.x;
      bottomRightOffset.x += pitchStretch * halfGlassesSize.x;
    }

    // Apply yaw distortion to offsets
    if (yawStretch > 0.0) {
      topLeftOffset.y += yawStretch * halfGlassesSize.y;
      bottomLeftOffset.y -= yawStretch * halfGlassesSize.y;
    } else if (yawStretch < 0.0) {
      topRightOffset.y -= yawStretch * halfGlassesSize.y;
      bottomRightOffset.y += yawStretch * halfGlassesSize.y;
    }
      
    // Calculate final texture coordinates for each corner
    vec2 rotatedTopLeft = rotationMatrix * (texCoord - eyeCenter + (topLeftOffset * 1.0 / u_textureSize)) * u_textureSize / glassesSize + 0.5;
    vec2 rotatedTopRight = rotationMatrix * (texCoord - eyeCenter + (topRightOffset * 1.0 / u_textureSize)) * u_textureSize / glassesSize + 0.5;
    vec2 rotatedBottomLeft = rotationMatrix * (texCoord - eyeCenter + (bottomLeftOffset * 1.0 / u_textureSize)) * u_textureSize / glassesSize + 0.5;
    vec2 rotatedBottomRight = rotationMatrix * (texCoord - eyeCenter + (bottomRightOffset * 1.0 / u_textureSize)) * u_textureSize / glassesSize + 0.5;

    // Compute interpolation weights
    vec2 topInterp = mix(rotatedTopLeft, rotatedTopRight, texCoord.x);
    vec2 bottomInterp = mix(rotatedBottomLeft, rotatedBottomRight, texCoord.x);
    vec2 finalCoord = mix(topInterp, bottomInterp, texCoord.y);

    // Sample texture and apply alpha blending
    vec4 glassesColor = texture2D(glassesImage, finalCoord);
    if (glassesColor.a > 0.0) {
      color = mix(color, glassesColor, glassesColor.a);
    }
  }

  void applyBeardEffect(inout vec4 color, vec2 texCoord, sampler2D beardImage, vec2 chinPosition, float chinWidth, float beardAspectRatio, float headRotationAngle) {
    float beardHeight = chinWidth / beardAspectRatio;
    vec2 beardSize = vec2(chinWidth, beardHeight);

    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 beardTexCoord = (rotationMatrix * (texCoord - chinPosition + u_beardImageOffset) * u_textureSize / beardSize) + 0.5;
    vec4 beardColor = texture2D(beardImage, beardTexCoord);
    if (beardColor.a > 0.0) {
      color = mix(color, beardColor, beardColor.a);
    }
  }

  void applyMustacheEffect(inout vec4 color, vec2 texCoord, sampler2D mustacheImage, vec2 nosePosition, float eyesWidth, float mustacheAspectRatio, float headRotationAngle) {
    float mustacheHeight = eyesWidth / mustacheAspectRatio;
    vec2 mustacheSize = vec2(eyesWidth, mustacheHeight);

    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 mustacheTexCoord = (rotationMatrix * (texCoord - nosePosition - u_mustacheImageOffset) * u_textureSize / mustacheSize) + 0.5;
    vec4 mustacheColor = texture2D(mustacheImage, mustacheTexCoord);
    if (mustacheColor.a > 0.0) {
      color = mix(color, mustacheColor, mustacheColor.a);
    }
  }

  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    float total = 0.0;

    // Apply ears effect
    if (u_earsEffect) {
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyEarEffect(color, v_texCoord, u_leftEarImage, u_leftEarPositions[i], u_leftEarWidths[i], u_leftEarAspectRatio, u_headRotationAngles[i]);
          applyEarEffect(color, v_texCoord, u_rightEarImage, u_rightEarPositions[i], u_rightEarWidths[i], u_rightEarAspectRatio, u_headRotationAngles[i]);
        }
      }
    }

    // Apply glasses effect
    if (u_glassesEffect) {
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyGlassesEffect(color, v_texCoord, u_glassesImage, u_eyesCenters[i], u_eyesWidths[i], u_headRotationAngles[i], u_headPitchAngles[i], u_headYawAngles[i]);
        }
      }
    }

    // Apply beard effect
    if (u_beardEffect) {
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyBeardEffect(color, v_texCoord, u_beardImage, u_chinPositions[i], u_chinWidths[i], u_beardAspectRatio, u_headRotationAngles[i]);
        }
      }
    }

    // Apply mustache effect
    if (u_mustacheEffect) {
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyMustacheEffect(color, v_texCoord, u_mustacheImage, u_nosePositions[i], u_eyesWidths[i], u_mustacheAspectRatio, u_headRotationAngles[i]);
        }
      }
    }

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

    gl_FragColor = color;
  }
`;

export default fragmentShaderSource;
