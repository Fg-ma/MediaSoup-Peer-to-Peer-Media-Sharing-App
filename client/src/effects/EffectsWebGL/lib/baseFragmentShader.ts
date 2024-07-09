const baseFragmentShaderSource = `
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
    float rowIndex = floor(float(textureIndex) / float(numTexturesPerRow));
    float colIndex = float(textureIndex) - (rowIndex * float(numTexturesPerRow));

    // Calculate UV coordinates for the texture in the atlas
    return vec2(
      colIndex * textureSize.x / atlasSize.x,
      rowIndex * textureSize.y / atlasSize.y
    );
  }

  // Function to apply an effect
  void applyEffect(inout vec4 color, vec2 texCoord, vec2 positionOffsetTexCoord, vec2 widthTexCoord, vec2 headRotationAngleTexCoord, float aspectRatio) {
    vec2 atlasSize = calculateAtlasSize();
    vec2 effectImageUVs = getAltasTextureUVs(0, atlasSize);
  
    float width = texture2D(u_widthsHeadRotationAnglesTexture, widthTexCoord).r;
    float height = width / aspectRatio;
    vec2 size = vec2(width, height);
  
    float headRotationAngle = texture2D(u_widthsHeadRotationAnglesTexture, headRotationAngleTexCoord).g;
    mat2 rotationMatrix = getRotationMatrix(headRotationAngle);

    vec2 position = texture2D(u_positionsOffsetsTexture, positionOffsetTexCoord).rg;
    vec2 offset = texture2D(u_positionsOffsetsTexture, positionOffsetTexCoord).ba;


    vec2 effectTexCoord = texCoord - position - offset;
    effectTexCoord = rotationMatrix * (effectTexCoord * u_textureSize / size) + 0.5;

    vec4 effectColor = texture2D(u_effectTextureAtlas, effectTexCoord);

    if (effectColor.a > 0.0) {
      color = mix(color, effectColor, effectColor.a);
    }
  }

  void main() {
    vec4 color = texture2D(u_liveVideoImage, v_texCoord);
    float total = 0.0;

    for (int i = 0; i < MAX_FACES; i++) {
      if (i < u_faceCount) {
        // Ears
        if (mod(float(u_effectFlags / int(pow(2.0, float(LEFT_EAR)))), 2.0) >= 1.0) {
          applyEffect(color, v_texCoord, getDataTexCoord(LEFT_EYE_POS, MAX_POSITIONS, i, MAX_FACES), getDataTexCoord(LEFT_EAR_WIDTH, MAX_WIDTHS, i, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, i, MAX_FACES), u_effectAspectRatios[LEFT_EAR]);
          applyEffect(color, v_texCoord, getDataTexCoord(RIGHT_EYE_POS, MAX_POSITIONS, i, MAX_FACES), getDataTexCoord(RIGHT_EAR_WIDTH, MAX_WIDTHS, i, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, i, MAX_FACES), u_effectAspectRatios[RIGHT_EAR]);
        }

        // Glasses
        if (mod(float(u_effectFlags / int(pow(2.0, float(GLASSES)))), 2.0) >= 1.0) {
          applyEffect(color, v_texCoord, getDataTexCoord(EYES_CENTER_POS, MAX_POSITIONS, i, MAX_FACES), getDataTexCoord(EYES_WIDTH, MAX_WIDTHS, i, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, i, MAX_FACES), u_effectAspectRatios[GLASSES]);
        }

        // Beards
        if (mod(float(u_effectFlags / int(pow(2.0, float(BEARDS)))), 2.0) >= 1.0) {
          applyEffect(color, v_texCoord, getDataTexCoord(CHIN_POS, MAX_POSITIONS, i, MAX_FACES), getDataTexCoord(CHIN_WIDTH, MAX_WIDTHS, i, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, i, MAX_FACES), u_effectAspectRatios[BEARDS]);
        }

        // Mustaches
        if (mod(float(u_effectFlags / int(pow(2.0, float(MUSTACHES)))), 2.0) >= 1.0) {
          applyEffect(color, v_texCoord, getDataTexCoord(NOSE_POS, MAX_POSITIONS, i, MAX_FACES), getDataTexCoord(EYES_WIDTH, MAX_WIDTHS, i, MAX_FACES), getDataTexCoord(0, MAX_WIDTHS, i, MAX_FACES), u_effectAspectRatios[MUSTACHES]);
        }
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

const baseFragmentShaderSource2 = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying vec2 v_texCoord;
  uniform sampler2D u_twoDimensionalEffectAtlasTexture;
  uniform sampler2D u_videoTexture;
  uniform bool u_useVideoTexture;

  void main() {
    if (u_useVideoTexture) {
      gl_FragColor = texture2D(u_videoTexture, v_texCoord);
    } else {
      gl_FragColor = texture2D(u_twoDimensionalEffectAtlasTexture, v_texCoord);
    }
  }
`;

export { baseFragmentShaderSource, baseFragmentShaderSource2 };
