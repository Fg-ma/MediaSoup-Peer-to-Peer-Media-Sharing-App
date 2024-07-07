const baseFragmentShaderSource = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define MAX_FACES 8

  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  // Universal face data
  uniform int u_faceCount;
  uniform float u_headRotationAngles[MAX_FACES]; 

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
  uniform vec2 u_earsImageOffset[MAX_FACES];
  uniform sampler2D u_glassesImage;
  uniform float u_glassesAspectRatio;
  uniform sampler2D u_beardImage;
  uniform float u_beardAspectRatio;
  uniform vec2 u_beardImageOffset[MAX_FACES];
  uniform sampler2D u_mustacheImage;
  uniform float u_mustacheAspectRatio;
  uniform vec2 u_mustacheImageOffset[MAX_FACES];

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

  void applyEarEffect(inout vec4 color, vec2 texCoord, sampler2D earImage, vec2 earPosition, vec2 earsImageOffset, float earWidth, float earAspectRatio, float headRotationAngle) {
    float earHeight = earWidth / earAspectRatio;
    vec2 earSize = vec2(earWidth, earHeight);  
  
    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 earTexCoord = (rotationMatrix * (texCoord - earPosition + earsImageOffset) * u_textureSize / earSize) + 0.5;
    vec4 earColor = texture2D(earImage, earTexCoord);
    if (earColor.a > 0.0) {
      color = mix(color, earColor, earColor.a);
    }
  }

  void applyGlassesEffect(inout vec4 color, vec2 texCoord, sampler2D glassesImage, vec2 eyesCenterPosition, float eyesWidth, float glassesAspectRatio, float headRotationAngle) {
    float glassesHeight = eyesWidth / glassesAspectRatio;
    vec2 glassesSize = vec2(eyesWidth, glassesHeight);  
  
    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 glassesTexCoord = (rotationMatrix * (texCoord - eyesCenterPosition) * u_textureSize / glassesSize) + 0.5;
    vec4 glassesColor = texture2D(glassesImage, glassesTexCoord);
    if (glassesColor.a > 0.0) {
      color = mix(color, glassesColor, glassesColor.a);
    }
  }

  void applyBeardEffect(inout vec4 color, vec2 texCoord, sampler2D beardImage, vec2 chinPosition, vec2 beardImageOffset, float chinWidth, float beardAspectRatio, float headRotationAngle) {
    float beardHeight = chinWidth / beardAspectRatio;
    vec2 beardSize = vec2(chinWidth, beardHeight);

    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 beardTexCoord = (rotationMatrix * (texCoord - chinPosition - beardImageOffset) * u_textureSize / beardSize) + 0.5;
    vec4 beardColor = texture2D(beardImage, beardTexCoord);
    if (beardColor.a > 0.0) {
      color = mix(color, beardColor, beardColor.a);
    }
  }

  void applyMustacheEffect(inout vec4 color, vec2 texCoord, sampler2D mustacheImage, vec2 nosePosition, vec2 mustacheImageOffset, float eyesWidth, float mustacheAspectRatio, float headRotationAngle) {
    float mustacheHeight = eyesWidth / mustacheAspectRatio;
    vec2 mustacheSize = vec2(eyesWidth, mustacheHeight);

    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 mustacheTexCoord = (rotationMatrix * (texCoord - nosePosition - mustacheImageOffset) * u_textureSize / mustacheSize) + 0.5;
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
          applyEarEffect(color, v_texCoord, u_leftEarImage, u_leftEarPositions[i], u_earsImageOffset[i], u_leftEarWidths[i], u_leftEarAspectRatio, u_headRotationAngles[i]);
          applyEarEffect(color, v_texCoord, u_rightEarImage, u_rightEarPositions[i], u_earsImageOffset[i], u_rightEarWidths[i], u_rightEarAspectRatio, u_headRotationAngles[i]);
        }
      }
    }

    // Apply glasses effect
    if (u_glassesEffect) {
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyGlassesEffect(color, v_texCoord, u_glassesImage, u_eyesCenters[i], u_eyesWidths[i], u_glassesAspectRatio, u_headRotationAngles[i]);
        }
      }
    }

    // Apply beard effect
    if (u_beardEffect) {
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyBeardEffect(color, v_texCoord, u_beardImage, u_chinPositions[i], u_beardImageOffset[i], u_chinWidths[i], u_beardAspectRatio, u_headRotationAngles[i]);
        }
      }
    }

    // Apply mustache effect
    if (u_mustacheEffect) {
      for (int i = 0; i < MAX_FACES; i++) {
        if (i < u_faceCount) {
          applyMustacheEffect(color, v_texCoord, u_mustacheImage, u_nosePositions[i], u_mustacheImageOffset[i], u_eyesWidths[i], u_mustacheAspectRatio, u_headRotationAngles[i]);
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

const baseFragmentShaderSource2 = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define MAX_FACES 8
  #define MAX_EFFECTS 5
  #define MAX_POSITIONS 5
  #define MAX_WIDTHS 4

  // Effect indices
  #define LEFT_EAR 0
  #define RIGHT_EAR 1
  #define GLASSES 2
  #define BEARDS 3
  #define MUSTACHES 4
  #define BLUR 5
  #define TINT 6

  // Position indices
  #define LEFT_EYE_POS 0
  #define RIGHT_EYE_POS 1
  #define EYES_CENTER_POS 2
  #define CHIN_POS 3
  #define NOSE_POS 4

  // Width indices
  #define LEFT_EAR_WIDTH 0
  #define RIGHT_EAR_WIDTH 1
  #define EYES_WIDTH 2
  #define CHIN_WIDTH 3

  // Universal data
  varying vec2 v_texCoord;
  uniform sampler2D u_liveVideoImage;
  uniform vec2 u_textureSize;
  uniform int u_faceCount;

  // Effect flags
  uniform int u_effectFlags;

  // Tint
  uniform vec3 u_tintColor;

  // Effect images and their aspect ratios packed into arrays
  uniform sampler2D u_effectTextureAtlas;
  uniform float u_effectAspectRatios[MAX_EFFECTS];

  // Effect positions, offsets, widths, and headRotationAngles
  uniform sampler2D u_positionsOffsetsTexture;
  uniform sampler2D u_widthsHeadRotationAnglesTexture;

  // Function to get the rotation matrix
  mat2 getRotationMatrix(float angle) {
    float cosA = cos(angle);
    float sinA = sin(angle);
    return mat2(cosA, -sinA, sinA, cosA);
  }

  vec2 getDataTexCoord(int dataIndex1, int maxDataIndexSize1, int dataIndex2, int maxDataIndexSize2) {
    return vec2(float(dataIndex2) / float(maxDataIndexSize2), float(dataIndex1) / float(maxDataIndexSize1));
  }

  vec2 calculateAtlasSize() {
    int activeTextureCount = 0;
    vec2 textureSize = vec2(512.0, 512.0);

    // Ears
    if (mod(float(u_effectFlags / int(pow(2.0, float(LEFT_EAR)))), 2.0) >= 1.0) {
      activeTextureCount += 2;
    }

    // Glasses
    if (mod(float(u_effectFlags / int(pow(2.0, float(GLASSES)))), 2.0) >= 1.0) {
      activeTextureCount += 1;
    }

    // Beards
    if (mod(float(u_effectFlags / int(pow(2.0, float(BEARDS)))), 2.0) >= 1.0) {
      activeTextureCount += 1;
    }

    // Mustaches
    if (mod(float(u_effectFlags / int(pow(2.0, float(MUSTACHES)))), 2.0) >= 1.0) {
      activeTextureCount += 1;
    }

    float sqrtActiveTextures = sqrt(float(activeTextureCount));
    int atlasWidth = int(ceil(sqrtActiveTextures));
    int atlasHeight = int(ceil(float(activeTextureCount) / float(atlasWidth)));

    return vec2(float(atlasWidth) * textureSize.x, float(atlasHeight) * textureSize.y);
  }

  vec2 getAltasTextureUVs(int textureIndex, vec2 atlasSize) {
    vec2 textureSize = vec2(512.0, 512.0);

    // Calculate row and column indices
    int numTexturesPerRow = int(atlasSize.x / textureSize.x);
    int rowIndex = textureIndex / numTexturesPerRow;
    int colIndex = textureIndex - rowIndex * numTexturesPerRow;

    // Calculate UV coordinates for the texture in the atlas
    return vec2(
      float(colIndex) * textureSize.x / atlasSize.x,
      float(rowIndex) * textureSize.y / atlasSize.y
    );
  }

  // Function to apply an effect
  void applyEffect(inout vec4 color, vec2 texCoord, vec2 positionOffsetTexCoord, vec2 widthTexCoord, vec2 headRotationAngleTexCoord, float aspectRatio) {
    vec2 atlasSize = calculateAtlasSize();
    vec2 effectImageUVs = getAltasTextureUVs(1, atlasSize);
  
    float width = texture2D(u_widthsHeadRotationAnglesTexture, widthTexCoord).r;
    float height = width / aspectRatio;
    vec2 size = vec2(width, height);
  
    float headRotationAngle = texture2D(u_widthsHeadRotationAnglesTexture, headRotationAngleTexCoord).g;
    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 position = texture2D(u_positionsOffsetsTexture, positionOffsetTexCoord).rg;
    vec2 offset = texture2D(u_positionsOffsetsTexture, positionOffsetTexCoord).ba;
    vec2 effectTexCoord = effectImageUVs + (rotationMatrix * (texCoord - position - offset) * u_textureSize / size) + 0.5;
    vec4 effectColor = texture2D(u_effectTextureAtlas, effectTexCoord);
    if (effectColor.a > 0.0) {
      color = mix(color, effectColor, effectColor.a);
    }
  }
  
  void main() {
    vec4 color = texture2D(u_liveVideoImage, v_texCoord);
    float total = 0.0;

    if (u_faceCount > 0) {
      // Ears
      if (mod(float(u_effectFlags / int(pow(2.0, float(LEFT_EAR)))), 2.0) >= 1.0) {
        applyEffect(color, v_texCoord, getDataTexCoord(LEFT_EYE_POS, MAX_POSITIONS, 0, MAX_FACES), getDataTexCoord(LEFT_EAR_WIDTH, MAX_WIDTHS, 0, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 0, MAX_FACES), u_effectAspectRatios[LEFT_EAR]);
        applyEffect(color, v_texCoord, getDataTexCoord(RIGHT_EYE_POS, MAX_POSITIONS, 0, MAX_FACES), getDataTexCoord(RIGHT_EAR_WIDTH, MAX_WIDTHS, 0, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 0, MAX_FACES), u_effectAspectRatios[RIGHT_EAR]);
      }

      // Glasses
      if (mod(float(u_effectFlags / int(pow(2.0, float(GLASSES)))), 2.0) >= 1.0) {
        applyEffect(color, v_texCoord, getDataTexCoord(EYES_CENTER_POS, MAX_POSITIONS, 0, MAX_FACES), getDataTexCoord(EYES_WIDTH, MAX_WIDTHS, 0, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 0, MAX_FACES), u_effectAspectRatios[GLASSES]);
      }

      // Beards
      if (mod(float(u_effectFlags / int(pow(2.0, float(BEARDS)))), 2.0) >= 1.0) {
        applyEffect(color, v_texCoord, getDataTexCoord(CHIN_POS, MAX_POSITIONS, 0, MAX_FACES), getDataTexCoord(CHIN_WIDTH, MAX_WIDTHS, 0, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 0, MAX_FACES), u_effectAspectRatios[BEARDS]);
      }

      // Mustaches
      if (mod(float(u_effectFlags / int(pow(2.0, float(MUSTACHES)))), 2.0) >= 1.0) {
        applyEffect(color, v_texCoord, getDataTexCoord(NOSE_POS, MAX_POSITIONS, 0, MAX_FACES), getDataTexCoord(EYES_WIDTH, MAX_WIDTHS, 0, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 0, MAX_FACES), u_effectAspectRatios[MUSTACHES]);
      }
    }

    if (u_faceCount > 1) {  
      // Ears
      if (mod(float(u_effectFlags / int(pow(2.0, float(LEFT_EAR)))), 2.0) >= 1.0) {
        applyEffect(color, v_texCoord, getDataTexCoord(LEFT_EYE_POS, MAX_POSITIONS, 1, MAX_FACES), getDataTexCoord(LEFT_EAR_WIDTH, MAX_WIDTHS, 1, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 1, MAX_FACES), u_effectAspectRatios[LEFT_EAR]);
        applyEffect(color, v_texCoord, getDataTexCoord(RIGHT_EYE_POS, MAX_POSITIONS, 1, MAX_FACES), getDataTexCoord(RIGHT_EAR_WIDTH, MAX_WIDTHS, 1, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 1, MAX_FACES), u_effectAspectRatios[RIGHT_EAR]);
      }
  
      // Glasses
      if (mod(float(u_effectFlags / int(pow(2.0, float(GLASSES)))), 2.0) >= 1.0) {
        applyEffect(color, v_texCoord, getDataTexCoord(EYES_CENTER_POS, MAX_POSITIONS, 1, MAX_FACES), getDataTexCoord(EYES_WIDTH, MAX_WIDTHS, 1, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 1, MAX_FACES), u_effectAspectRatios[GLASSES]);
      }
  
      // Beards
      if (mod(float(u_effectFlags / int(pow(2.0, float(BEARDS)))), 2.0) >= 1.0) {
        applyEffect(color, v_texCoord, getDataTexCoord(CHIN_POS, MAX_POSITIONS, 1, MAX_FACES), getDataTexCoord(CHIN_WIDTH, MAX_WIDTHS, 1, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 1, MAX_FACES), u_effectAspectRatios[BEARDS]);
      }
  
      // Mustaches
      if (mod(float(u_effectFlags / int(pow(2.0, float(MUSTACHES)))), 2.0) >= 1.0) {
        applyEffect(color, v_texCoord, getDataTexCoord(NOSE_POS, MAX_POSITIONS, 1, MAX_FACES), getDataTexCoord(EYES_WIDTH, MAX_WIDTHS, 1, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, 1, MAX_FACES), u_effectAspectRatios[MUSTACHES]);
      }
    }

    // Apply blur effect
    if (mod(float(u_effectFlags / int(pow(2.0, float(BLUR)))), 2.0) >= 1.0) {
      for (int x = -8; x <= 8; x++) {
        for (int y = -8; y <= 8; y++) {
          vec2 offset = vec2(float(x), float(y)) / u_textureSize;
          color += texture2D(u_liveVideoImage, v_texCoord + offset);
          total += 1.0;
        }
      }
      color /= total;
    }

    // Apply tint effect
    if (mod(float(u_effectFlags / int(pow(2.0, float(TINT)))), 2.0) >= 1.0) {
      vec4 texColor = color;
      float luminance = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 tintedColor = mix(texColor.rgb, u_tintColor, 0.75);
      vec3 finalColor = mix(texColor.rgb, tintedColor, luminance);
      color = vec4(finalColor, texColor.a);
    }

    gl_FragColor = color;
  }
`;

export { baseFragmentShaderSource, baseFragmentShaderSource2 };
