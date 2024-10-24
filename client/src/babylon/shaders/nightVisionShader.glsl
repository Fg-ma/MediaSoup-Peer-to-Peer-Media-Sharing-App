precision highp float;
varying vec2 vUV;

uniform sampler2D textureSampler; // Main scene texture
uniform float time;

const vec2 screenSize = vec2(1280, 720);

// Improved hash function for better randomness
float hash(vec2 p) { 
  p += time * 0.1;
  p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
  return fract(p.x * p.y * (p.x + p.y));
}

// 2D noise generation function with smoother transitions and more randomness
float noise(vec2 uv) {
  vec2 i = floor(uv);  // Integer part of UV
  vec2 f = fract(uv);  // Fractional part of UV

  // Hash corners of the square
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  // Smoothstep to fade between the corners
  vec2 fade_f = smoothstep(vec2(0.0), vec2(1.0), f);

  // Interpolation between the hashed corners
  return mix(mix(a, b, fade_f.x), mix(c, d, fade_f.x), fade_f.y);
}

void main(void) {
  // Get the color from the scene texture
  vec4 color = texture2D(textureSampler, vUV);

  // Convert color to grayscale for night vision
  float gray = dot(color.rgb, vec3(0.3, 0.59, 0.11));

  // Apply a green tint for night vision
  vec4 nightVisionColor = vec4(0.1, gray * 1.5, 0.1, 1.0);

  // Time-varying random offset based on a less predictable function
  vec2 timeOffset = vec2(sin(time * 0.35 + sin(time * 0.1)), cos(time * 0.35 + cos(time * 0.1))) * 10.0;

  // Evolve the UV coordinates over time with a more complex pattern
  vec2 noiseUV = vUV * screenSize * 0.5 + timeOffset;

  // Generate noise
  float n = noise(noiseUV);  // Procedural noise generation

  // Add subtle noise to the color (adjust intensity as necessary)
  nightVisionColor.rgb += vec3(n * 0.2);

  // Output the final color
  gl_FragColor = nightVisionColor;
}
