precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float time;
uniform bool glitchActive; // New uniform to control glitch effect

// Random noise function for static effect
float random(vec2 coords) {
  return fract(sin(dot(coords.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// Function to create horizontal glitch effect
vec2 glitchEffect(vec2 uv, float time) {
  if (glitchActive) { // Only apply glitch effect if active
    float glitchOffset = (random(vec2(uv.y * 10.0, time * 5.0)) - 0.5) * 0.02; // Adjust the multiplier for glitch intensity
    return vec2(uv.x + glitchOffset, uv.y);
  }
  return uv; // Return original UV if no glitch
}

void main(void) {
  // 1. Apply scanlines
  float scanline = sin(vUV.y * 800.0) * 0.05; // Adjust the frequency and strength of the scanlines
  vec2 uv = vUV;

  // 2. Create horizontal glitch effect
  uv = glitchEffect(uv, time);
    
  // 3. Simulate chromatic aberration by slightly offsetting the RGB channels
  float r = texture2D(textureSampler, uv + vec2(0.001, 0.0)).r;  // Red channel
  float g = texture2D(textureSampler, uv).g;                      // Green channel
  float b = texture2D(textureSampler, uv - vec2(0.001, 0.0)).b;   // Blue channel

  // 4. Combine the channels with scanline effect
  vec3 color = vec3(r, g, b) - vec3(scanline);

  // 5. Add vignette effect (darken the edges)
  float vignette = smoothstep(0.7, 1.0, length(vUV - 0.5) * 1.5);
  color *= 1.0 - vignette;

  // 6. Add random noise for static
  float noise = random(vUV * time * 5.0) * 0.1; // Increase noise variability with time
  color += vec3(noise);

  // Output the final color
  gl_FragColor = vec4(color, 1.0);
}
