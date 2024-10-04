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
  #define METALLIC_ROUGHNESS_MAP_BIT 6
  #define SPECULAR_MAP_BIT 7
  #define EMISSION_MAP_BIT 8

  #define VIDEO_BLUR_RADIUS 12
  #define EFFECT_BLUR_RADIUS 8
  #define MESH_BLUR_RADIUS 8

  #define AMBIENT_COLOR vec3(1.0, 1.0, 1.0)
  #define AMBIENT_INTENSITY 0.125

  const float M_PI = 3.14159265358979323846;
  
  const vec3 cameraViewDir = vec3(0.0, 0.0, -1.0);

  varying vec2 v_texCoord;
  varying vec3 v_normal;
  
  varying vec2 v_normalTexCoord;
  varying vec2 v_transmissionRoughnessMetallicTexCoord;
  varying vec2 v_specularTexCoord;
  varying vec2 v_emissionTexCoord;

  uniform vec2 u_texSize;

  uniform sampler2D u_videoTexture;
  uniform sampler2D u_twoDimEffectAtlasTexture;
  uniform sampler2D u_threeDimEffectAtlasTexture;

  uniform sampler2D u_normalMapTexture;
  uniform sampler2D u_transmissionRoughnessMetallicMapTexture;
  uniform sampler2D u_specularMapTexture;
  uniform sampler2D u_emissionMapTexture;

  uniform int u_effectFlags;
  uniform vec3 u_tintColor;
  uniform vec3 u_lightDirection; 

  // Fresnel Schlick approximation function
  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
  }

 vec3 computeMaterialColor(vec3 baseColor, float metallic, float roughness, vec3 lightDir, vec3 finalNormal, vec3 specularColor, float transmission) {
    vec3 F0 = mix(vec3(0.04), baseColor, metallic); // Base reflection for dielectrics

    // Reflectance
    vec3 reflectedLight = reflect(-cameraViewDir, finalNormal);

    // Calculate the Fresnel term
    float cosTheta = max(dot(finalNormal, cameraViewDir), 0.0);
    vec3 F = fresnelSchlick(cosTheta, F0);

    // Calculate D using a GGX distribution
    float roughnessSquared = roughness * roughness;
    float alpha = roughnessSquared * roughnessSquared;
    float D = max(0.0, dot(finalNormal, lightDir));
    D = alpha / (M_PI * pow((D * D * (alpha - 1.0) + 1.0), 2.0));

    // Calculate the geometry term
    float G = min(1.0, min(2.0 * dot(finalNormal, lightDir) * dot(finalNormal, cameraViewDir) / dot(cameraViewDir, lightDir), 1.0));

    // Combine components to get the final specular color
    vec3 specular = (D * F * G) / (4.0 * dot(finalNormal, cameraViewDir) * dot(finalNormal, lightDir));

    // Blend the base color with the specular contribution more strongly for metallics
    vec3 metallicColor = mix(baseColor, specularColor * specular, metallic); // Blend based on metallic value

    // Add ambient light to soften shadows
    vec3 finalColor = metallicColor + AMBIENT_COLOR * AMBIENT_INTENSITY;

    // Apply transmission (if needed, you can multiply by a factor)
    finalColor = mix(finalColor, vec3(1.0), transmission); // Modify this as per your transmission handling

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

    // Apply additional maps if MESH_BIT is active
    if (mod(float(u_effectFlags / int(pow(2.0, float(MESH_BIT)))), 2.0) >= 1.0) {
      // Sample normal map if available
      vec3 normalMap = vec3(0.0);
      if (mod(float(u_effectFlags / int(pow(2.0, float(NORMAL_MAP_BIT)))), 2.0) >= 1.0) {
        normalMap = texture2D(u_normalMapTexture, v_normalTexCoord).rgb * 2.0 - 1.0;
      }
      vec3 finalNormal = normalize(v_normal + normalMap); // Combine with vertex normal

      // Sample metallic and roughness maps if available
      vec3 transmissionRoughnessMetallic = vec3(0.0);
      float transmission = 0.0; // Default transmission value (0.0 means opaque)
      float roughness = 1.0; // Default roughness value (1.0 means smooth)
      float metallic = 0.0;
      if (mod(float(u_effectFlags / int(pow(2.0, float(METALLIC_ROUGHNESS_MAP_BIT)))), 2.0) >= 1.0) {
        transmissionRoughnessMetallic = texture2D(u_transmissionRoughnessMetallicMapTexture, v_transmissionRoughnessMetallicTexCoord).rgb;
        transmission = transmissionRoughnessMetallic.r; // B channel for metallic
        roughness = transmissionRoughnessMetallic.g; // G channel for roughness
        metallic = transmissionRoughnessMetallic.b; // B channel for metallic
      }

      // Sample specular map if available
      vec3 specularColor = vec3(1.0); // Default specular color (white)
      if (mod(float(u_effectFlags / int(pow(2.0, float(SPECULAR_MAP_BIT)))), 2.0) >= 1.0) {
        specularColor = texture2D(u_specularMapTexture, v_specularTexCoord).rgb;
      }

      // Sample emission map if available
      vec3 emissionColor = vec3(0.0); // Default emission color (black)
      if (mod(float(u_effectFlags / int(pow(2.0, float(EMISSION_MAP_BIT)))), 2.0) >= 1.0) {
        emissionColor = texture2D(u_emissionMapTexture, v_emissionTexCoord).rgb; // Sample emission map
      }

      // Apply lighting using the combined normal and properties
      vec3 lightDir = normalize(u_lightDirection);
      float lightIntensity = max(dot(finalNormal, lightDir), 0.0) * 2.0;

      // Combine color based on metallic, roughness, specular, and transmission
      color.rgb *= computeMaterialColor(color.rgb, metallic, roughness, lightDir, finalNormal, specularColor, transmission) * lightIntensity;
    
      // Add emission color
      color.rgb += emissionColor;
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
