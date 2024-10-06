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
  const vec3 lightDirection = vec3(-0.1736, 0.0, -0.9848);
  const float lightMultiplicity = 1.5;

  varying vec2 v_texCoord;
  varying vec2 v_materialTexCoord;
  varying vec3 v_normal;
  
  uniform sampler2D u_videoTexture;
  uniform sampler2D u_twoDimEffectAtlasTexture;
  uniform sampler2D u_threeDimEffectAtlasTexture;
  uniform sampler2D u_materialAtlasTexture;
  uniform sampler2D u_hdriTexture;

  uniform int u_effectFlags;
  uniform vec3 u_tintColor;

  // Fresnel Schlick approximation function
  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
  }
    
  int decodeMaterialAtlasSize() {
    // Calculate the multiplier for the starting position
    int shiftMultiplier = 512; // This is 2^9, to shift bits to position 9

    // Shift down by dividing by shiftMultiplier
    int temp = u_effectFlags / shiftMultiplier; 

    // Isolate the 14 bits
    return temp - (temp / 4096) * 4096; // 4096 is 2^12 to isolate the 14 bits
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
      float materialAtlasTexCoordOffsetIncrement = 256.0 / pow(2.0, float(decodeMaterialAtlasSize()));
      vec3 finalNormal = v_normal;

      // Normal map (if available)
      if (mod(float(u_effectFlags / int(pow(2.0, float(NORMAL_MAP_BIT)))), 2.0) >= 1.0) {
        vec3 normalMap = texture2D(u_materialAtlasTexture, v_materialTexCoord).rgb * 2.0 - 1.0;
        finalNormal = normalize(v_normal + normalMap * vec3(1.0, 1.0, -1.0)); 
        materialAtlasTexCoordOffset += 1.0;
      }

      // Transmission, roughness, and metallic (if available)
      float transmission = 0.0, roughness = 1.0, metallic = 0.0;
      if (mod(float(u_effectFlags / int(pow(2.0, float(TRANSMISSION_ROUGHNESS_METALLIC_MAP_BIT)))), 2.0) >= 1.0) {
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

      // HDRI Texture
      vec3 hdriColor = texture2D(u_hdriTexture, finalNormal.xy * 0.5 + 0.5).rgb;

      // Lighting calculations
      float lightIntensity = max(dot(finalNormal, lightDirection), 0.0) * lightMultiplicity;

      // Compute material color if metallic/roughness maps exist
      if (mod(float(u_effectFlags / int(pow(2.0, float(TRANSMISSION_ROUGHNESS_METALLIC_MAP_BIT)))), 2.0) >= 1.0) {
        vec3 F0 = mix(vec3(0.04), color.rgb, metallic);

        vec3 reflectedLight = reflect(-cameraViewDir, finalNormal);
        float cosTheta = max(dot(finalNormal, cameraViewDir), 0.0);
        vec3 F = fresnelSchlick(cosTheta, F0);

        float alpha = roughness * roughness * roughness * roughness;
        float D = max(0.0, dot(finalNormal, lightDirection));
        D = alpha / (M_PI * pow((D * D * (alpha - 1.0) + 1.0), 2.0));

        float G = min(1.0, min(2.0 * dot(finalNormal, lightDirection) * dot(finalNormal, cameraViewDir) / dot(cameraViewDir, lightDirection), 1.0));

        vec3 specular = (D * F * G) / (4.0 * dot(finalNormal, cameraViewDir) * dot(finalNormal, lightDirection));

        vec3 metallicColor = mix(color.rgb, hasSpecular ? specularColor * specular : vec3(0.0), metallic);
        
        vec3 finalColor = mix(metallicColor, vec3(1.0), transmission);
        color.rgb *= finalColor;
      }
        
      // Combine HDRI lighting with the light intensity
      color.rgb = mix(color.rgb, hdriColor, 0.5);
      color.rgb *= lightIntensity;

      // Apply emission if present
      if (hasEmission) {
        color.rgb += emissionColor;
      }
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
