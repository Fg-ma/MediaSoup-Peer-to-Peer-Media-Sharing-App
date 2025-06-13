const baseFragmentShaderSource = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define VIDEO_BIT 0
  #define TWO_DIMENSIONAL_EFFECTS_BIT 1
  #define MESH_BIT 2
  #define BLUR_BIT 3
  #define TINT_BIT 4
  #define NORMAL_MAP_BIT 5
  #define TRANSMISSION_ROUGHNESS_METALLIC_MAP_BIT 6
  #define SPECULAR_MAP_BIT 7
  #define EMISSION_MAP_BIT 8

  #define MATERIAL_ATLAS_SIZE_BIT_START 9
  #define MATERIAL_ATLAS_SIZE_BIT_LENGTH 5

  #define VIDEO_BLUR_RADIUS 12
  #define EFFECT_BLUR_RADIUS 8
  #define MESH_BLUR_RADIUS 8

  const float M_PI = 3.14159265358979323846;
  
  const vec3 cameraViewDir = vec3(0.0, 0.0, -1.0);  

  const vec3 frontLightDir = vec3(-0.1736, 0.0, -0.9848);
  const float frontLightMulti = 1.125;
  const vec3 backLightDir1 = vec3(0.8944, 0.0, 0.4472);
  const float backLightMulti1 = 0.2;
  const vec3 backLightDir2 = vec3(-0.8944, 0.0, 0.4472);
  const float backLightMulti2 = 0.2;
  const vec3 backLightDir3 = vec3(0.0, 0.8944, 0.4472);
  const float backLightMulti3 = 0.2;
  const vec3 backLightDir4 = vec3(0.0, -0.8944, 0.4472);
  const float backLightMulti4 = 0.2;

  const vec3 ambientLightDir = vec3(1.0, 0.8, 0.6);
  const float ambientLightMulti = 0.15625;
  const float ambientBlendFac = 0.25;

  varying vec2 v_texCoord;
  varying vec2 v_materialTexCoord;
  varying vec3 v_normal;
  
  uniform sampler2D u_videoTexture;
  uniform sampler2D u_twoDimEffectAtlasTexture;
  uniform sampler2D u_threeDimEffectAtlasTexture;
  uniform sampler2D u_materialAtlasTexture;

  uniform int u_effectFlags;
  uniform vec3 u_tintColor;

  // Fresnel Schlick approximation function
  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
  }
    
  int decodeEffectFlags(int startPosition, int length) {
    // Calculate the multiplier for the starting position
    int shiftMultiplier = int(pow(2.0, float(startPosition))); // Shift bits to startPosition

    // Shift down by dividing by shiftMultiplier
    int temp = u_effectFlags / shiftMultiplier; 

    // Isolate the 14 bits
    int lengthPower = int(pow(2.0, float(length)));
    return temp - (temp / lengthPower) * lengthPower; // Isolate the length bits
  }

  float lightCalculations(vec3 finalNormal) {
    // Lighting calculations
    float frontLightInt = max(dot(finalNormal, frontLightDir), 0.0) * frontLightMulti;
    float backLightInt1 = max(dot(finalNormal, backLightDir1), 0.0) * backLightMulti1;
    float backLightInt2 = max(dot(finalNormal, backLightDir2), 0.0) * backLightMulti2;
    float backLightInt3 = max(dot(finalNormal, backLightDir3), 0.0) * backLightMulti3;
    float backLightInt4 = max(dot(finalNormal, backLightDir4), 0.0) * backLightMulti4;
      
    // Combine the light intensities
    return frontLightInt + backLightInt1 + backLightInt2 + backLightInt3 + backLightInt4;
  }

  vec3 ambientLightCalculations(vec4 color) {
    return mix(color.rgb, color.rgb + ambientLightDir * ambientLightMulti, ambientBlendFac);
  }

  vec3 applyMaterial(bool hasTRM, bool hasSpecular, bool hasEmission, vec3 finalNormal, float transmission, float roughness, float metallic, vec3 specularColor, vec3 emissionColor) {
    vec3 resultColor = vec3(1.0); // Start with white, meaning no modification yet

    if (hasTRM) {
      // Make metallic response more pronounced by modifying F0
      vec3 F0 = mix(vec3(0.02), vec3(1.0), metallic); 

      vec3 reflectedLight = reflect(-cameraViewDir, finalNormal);
      float cosTheta = max(dot(finalNormal, cameraViewDir), 0.0);
      vec3 F = fresnelSchlick(cosTheta, F0);

      // Adjust roughness to create sharper/softer highlights
      float alpha = roughness * roughness;
      float D = max(0.0, dot(finalNormal, frontLightDir));
      D = alpha / (M_PI * pow((D * D * (alpha - 1.0) + 1.0), 2.0));

      // Adjust specular contribution for a sharper appearance when metallic
      float G = min(1.0, min(2.0 * dot(finalNormal, frontLightDir) * dot(finalNormal, cameraViewDir) / dot(cameraViewDir, frontLightDir), 1.0));

      // Calculate specular reflection
      vec3 specular = (D * F * G) / (4.0 * dot(finalNormal, cameraViewDir) * dot(finalNormal, frontLightDir));

      // Amplify the metallic effect by blending based on the metallic factor
      vec3 metallicColor = mix(resultColor, hasSpecular ? specularColor * specular : vec3(0.0), metallic);

      // Adjust transmission to smoothly blend between metallic and non-metallic materials
      resultColor = mix(metallicColor, vec3(1.0), transmission); 
    }

    // Apply lights (same as before)
    resultColor *= lightCalculations(finalNormal);

    // Apply ambient lighting (same as before)
    resultColor = ambientLightCalculations(vec4(resultColor, 1.0));

    // If emission is present, add it to the result color
    if (hasEmission) {
      resultColor += emissionColor;
    }

    return resultColor;
  }

  void main() {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    float total = 0.0;

    // Determine base color based on effect flags
    bool videoActive = mod(float(u_effectFlags / int(pow(2.0, float(VIDEO_BIT)))), 2.0) >= 1.0;
    bool twoDimEffectActive = mod(float(u_effectFlags / int(pow(2.0, float(TWO_DIMENSIONAL_EFFECTS_BIT)))), 2.0) >= 1.0;
    bool meshActive = mod(float(u_effectFlags / int(pow(2.0, float(MESH_BIT)))), 2.0) >= 1.0;
    if (videoActive) {
      color = texture2D(u_videoTexture, v_texCoord);
    } else if (twoDimEffectActive) {
      color = texture2D(u_twoDimEffectAtlasTexture, v_texCoord);
    } else if (meshActive) {
      color = texture2D(u_threeDimEffectAtlasTexture, v_texCoord);
    }

    // If meshActive, calculate additional material properties
    if (meshActive) {
      float materialAtlasTexCoordOffset = 0.0;
      float materialAtlasTexCoordOffsetIncrement = 256.0 / pow(2.0, float(decodeEffectFlags(9, 5)));
      vec3 finalNormal = normalize(v_normal); 

      // Normal map (if available)
      if (mod(float(u_effectFlags / int(pow(2.0, float(NORMAL_MAP_BIT)))), 2.0) >= 1.0) {
        vec3 normalMap = texture2D(u_materialAtlasTexture, v_materialTexCoord).rgb * 2.0 - 1.0;
        finalNormal = normalize(v_normal + normalMap * vec3(1.0, 1.0, -1.0)); 
        materialAtlasTexCoordOffset += 1.0;
      }

      // Transmission, roughness, and metallic (if available)
      float transmission = 0.0, roughness = 1.0, metallic = 0.0;
      bool hasTRM = mod(float(u_effectFlags / int(pow(2.0, float(TRANSMISSION_ROUGHNESS_METALLIC_MAP_BIT)))), 2.0) >= 1.0;
      if (hasTRM) {
        vec2 texCoord = v_materialTexCoord + vec2(materialAtlasTexCoordOffset * materialAtlasTexCoordOffsetIncrement, 0.0);
        vec3 trmMap = texture2D(u_materialAtlasTexture, texCoord).rgb;
        transmission = trmMap.r;
        roughness = trmMap.g;
        metallic = trmMap.b;
        materialAtlasTexCoordOffset += 1.0;
      }

      // Specular map (if available)
      vec3 specularColor = vec3(0.0);
      bool hasSpecular = mod(float(u_effectFlags / int(pow(2.0, float(SPECULAR_MAP_BIT)))), 2.0) >= 1.0;
      if (hasSpecular) {
        vec2 texCoord = v_materialTexCoord + vec2(materialAtlasTexCoordOffset * materialAtlasTexCoordOffsetIncrement, 0.0);
        specularColor = texture2D(u_materialAtlasTexture, texCoord).rgb;
        materialAtlasTexCoordOffset += 1.0;
      }

      // Emission map (if available)
      vec3 emissionColor = vec3(0.0);
      bool hasEmission = mod(float(u_effectFlags / int(pow(2.0, float(EMISSION_MAP_BIT)))), 2.0) >= 1.0;
      if (hasEmission) {
        vec2 texCoord = v_materialTexCoord + vec2(materialAtlasTexCoordOffset * materialAtlasTexCoordOffsetIncrement, 0.0);
        emissionColor = texture2D(u_materialAtlasTexture, texCoord).rgb;
        materialAtlasTexCoordOffset += 1.0;
      }

      color.rgb *= applyMaterial(hasTRM, hasSpecular, hasEmission, finalNormal, transmission, roughness, metallic, specularColor, emissionColor);
    }

    // Apply blur effect
    if (mod(float(u_effectFlags / int(pow(2.0, float(BLUR_BIT)))), 2.0) >= 1.0) {
      if (videoActive) {
        const float blurScale = 0.005; // This value can be adjusted based on the desired blur strength
        const int blurRadius = 8; // The blur radius can be adjusted as needed
  
        for (int x = -blurRadius; x <= blurRadius; x++) {
          for (int y = -blurRadius; y <= blurRadius; y++) {
            vec2 offset = vec2(float(x), float(y)) * blurScale; // Scale by the fixed blur scale
            color += texture2D(u_videoTexture, v_texCoord + offset);
            total += 1.0;
          }
        }
        color /= total; // Average the colors for blur
      }
    }

    // Apply tint effect
    if (mod(float(u_effectFlags / int(pow(2.0, float(TINT_BIT)))), 2.0) >= 1.0) {
      float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 tintedColor = mix(color.rgb, u_tintColor, 0.75);
      vec3 finalColor = mix(color.rgb, tintedColor, luminance);
      color = vec4(finalColor, color.a);
    }

    gl_FragColor = color;
  }
`;

export default baseFragmentShaderSource;
