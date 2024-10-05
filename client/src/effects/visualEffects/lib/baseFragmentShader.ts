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

  #define VIDEO_BLUR_RADIUS 12
  #define EFFECT_BLUR_RADIUS 8
  #define MESH_BLUR_RADIUS 8

  #define AMBIENT_COLOR vec3(1.0, 1.0, 1.0)
  #define AMBIENT_INTENSITY 0.125

  const float M_PI = 3.14159265358979323846;
  
  const vec3 cameraViewDir = vec3(0.0, 0.0, -1.0);

  const vec3 lightDirection = vec3(-0.1736, 0.0, -0.9848);

  varying vec2 v_texCoord;
  varying vec2 v_materialTexCoord;
  varying vec3 v_normal;
  
  uniform vec2 u_texSize;

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

  // Material color computation (metallic, roughness, specular, etc.)
  vec3 computeMaterialColor(vec3 baseColor, float metallic, float roughness, vec3 lightDir, vec3 finalNormal, vec3 specularColor, float transmission) {
    vec3 F0 = mix(vec3(0.04), baseColor, metallic);

    vec3 reflectedLight = reflect(-cameraViewDir, finalNormal);
    float cosTheta = max(dot(finalNormal, cameraViewDir), 0.0);
    vec3 F = fresnelSchlick(cosTheta, F0);

    float roughnessSquared = roughness * roughness;
    float alpha = roughnessSquared * roughnessSquared;
    float D = max(0.0, dot(finalNormal, lightDir));
    D = alpha / (M_PI * pow((D * D * (alpha - 1.0) + 1.0), 2.0));

    float G = min(1.0, min(2.0 * dot(finalNormal, lightDir) * dot(finalNormal, cameraViewDir) / dot(cameraViewDir, lightDir), 1.0));

    vec3 specular = (D * F * G) / (4.0 * dot(finalNormal, cameraViewDir) * dot(finalNormal, lightDir));

    vec3 metallicColor = mix(baseColor, specularColor * specular, metallic);
    vec3 finalColor = metallicColor + AMBIENT_COLOR * AMBIENT_INTENSITY;

    finalColor = mix(finalColor, vec3(1.0), transmission);

    return finalColor;
  }

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

    // If MESH_BIT is active, calculate additional material properties
    if (mod(float(u_effectFlags / int(pow(2.0, float(MESH_BIT)))), 2.0) >= 1.0) {
      float materialAtlasTexCoordOffset = 0.0;

      // Normal map (only if present)
      vec3 finalNormal = v_normal; // Default to vertex normal
      if (mod(float(u_effectFlags / int(pow(2.0, float(NORMAL_MAP_BIT)))), 2.0) >= 1.0) {
        vec2 normalMapTexCoord = v_materialTexCoord;
        vec3 normalMap = texture2D(u_materialAtlasTexture, normalMapTexCoord).rgb * 2.0 - 1.0;
        finalNormal = normalize(v_normal + normalMap * vec3(1.0, 1.0, -1.0)); // Only add if normal map is present
        materialAtlasTexCoordOffset += 1.0;
      }

      // Transmission, roughness, and metallic (if available)
      float transmission = 0.0;
      float roughness = 1.0;
      float metallic = 0.0;
      if (mod(float(u_effectFlags / int(pow(2.0, float(TRANSMISSION_ROUGHNESS_METALLIC_MAP_BIT)))), 2.0) >= 1.0) {
        vec2 texCoord = vec2(v_materialTexCoord.x + (materialAtlasTexCoordOffset * 0.25), v_materialTexCoord.y);
        vec3 trmMap = texture2D(u_materialAtlasTexture, texCoord).rgb;
        transmission = trmMap.r;
        roughness = trmMap.g;
        metallic = trmMap.b;
        materialAtlasTexCoordOffset += 1.0;
      }

      // Specular map (if present)
      vec3 specularColor = vec3(0.0);
      bool hasSpecular = false;
      if (mod(float(u_effectFlags / int(pow(2.0, float(SPECULAR_MAP_BIT)))), 2.0) >= 1.0) {
        vec2 texCoord = vec2(v_materialTexCoord.x + (materialAtlasTexCoordOffset * 0.25), v_materialTexCoord.y);
        specularColor = texture2D(u_materialAtlasTexture, texCoord).rgb;
        hasSpecular = true;
        materialAtlasTexCoordOffset += 1.0;
      }

      // Emission map (if present)
      vec3 emissionColor = vec3(0.0);
      bool hasEmission = false;
      if (mod(float(u_effectFlags / int(pow(2.0, float(EMISSION_MAP_BIT)))), 2.0) >= 1.0) {
        vec2 texCoord = vec2(v_materialTexCoord.x + (materialAtlasTexCoordOffset * 0.25), v_materialTexCoord.y);
        emissionColor = texture2D(u_materialAtlasTexture, texCoord).rgb;
        hasEmission = true;
        materialAtlasTexCoordOffset += 1.0;
      }

      // Lighting calculations
      vec3 lightDir = lightDirection;
      float lightIntensity = max(dot(finalNormal, lightDir), 0.0) * 1.5;

      // Compute material color if metallic/roughness maps exist
      if (mod(float(u_effectFlags / int(pow(2.0, float(TRANSMISSION_ROUGHNESS_METALLIC_MAP_BIT)))), 2.0) >= 1.0) {
        color.rgb *= computeMaterialColor(color.rgb, metallic, roughness, lightDir, finalNormal, hasSpecular ? specularColor : vec3(0.0), transmission) * lightIntensity;
      } else {
        color.rgb *= lightIntensity; // Basic lighting when no maps exist
      }

      // Apply emission if present
      if (hasEmission) {
        color.rgb += emissionColor;
      }
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
