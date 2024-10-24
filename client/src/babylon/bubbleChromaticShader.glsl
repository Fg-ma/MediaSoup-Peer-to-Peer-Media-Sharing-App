precision highp float;

varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float time;

// Simple hash function to generate pseudo-random values
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

// Pseudo-random 2D generator based on a seed
vec2 random2(float seed) {
  return vec2(hash(seed), hash(seed + 1.0));
}

// Function to create bubble distortion
vec2 bubbleDistortion(vec2 uv, vec2 center, float radius) {
  vec2 fromCenter = uv - center;
  float dist = length(fromCenter);
  if (dist < radius) {
    float distortion = sqrt(radius * radius - dist * dist) / radius;
    uv = center + fromCenter * distortion;
  }
  return uv;
}

// Generate a pastel color for each bubble based on its index
vec3 pastelColor(float index) {
  // Generate random base color
  vec3 randomColor = vec3(hash(index * 2.0), hash(index * 2.1), hash(index * 2.2));
    
  // Mix random color with white to create a pastel tone
  return mix(randomColor, vec3(1.0), 0.7); // 70% white for pastel effect
}

// Function for chromatic aberration (splitting colors)
vec4 chromaticAberration(vec2 uv, float offset) {
  float r = texture2D(textureSampler, uv + vec2(offset, 0.0)).r;
  float g = texture2D(textureSampler, uv).g;
  float b = texture2D(textureSampler, uv + vec2(-offset, 0.0)).b;
  return vec4(r, g, b, 1.0);
}

void main(void) {
  vec2 uv = vUV;
  vec4 baseColor = texture2D(textureSampler, uv);
  vec4 finalColor = baseColor;

  // Slow down the bubble movement by reducing the time factor
  float slowTime = time * 0.3;

  // Loop over NUM_BUBBLES to generate and move them
  for (int i = 0; i < 10; i++) {
    float seed = float(i) * 100.0;
    vec2 randomOffset = random2(seed);

    // Make bubbles move slowly
    vec2 bubbleCenter = vec2(
      fract(sin(slowTime + seed * 0.1) * 0.5 + randomOffset.x),
      fract(cos(slowTime + seed * 0.1) * 0.5 + randomOffset.y)
    );
            
    // Bubble radius that fluctuates over time
    float bubbleRadius = 0.1 + 0.05 * sin(slowTime + float(i));

    // Check if the current pixel is inside the bubble
    vec2 distortedUV = bubbleDistortion(uv, bubbleCenter, bubbleRadius);
    if (distortedUV != uv) {
      // Generate a pastel color for this bubble
      vec3 color = pastelColor(float(i));

      // Apply chromatic aberration only inside the bubble
      float aberrationOffset = 0.01 * sin(slowTime); // Animate over time
      finalColor = chromaticAberration(distortedUV, aberrationOffset);
      finalColor.rgb *= color; // Tint the chromatic aberration with pastel color
    }

    uv = distortedUV;
  }

  gl_FragColor = finalColor;
}