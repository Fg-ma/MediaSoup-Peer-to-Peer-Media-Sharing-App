precision highp float;

// Input resolution
uniform vec2 resolution; // Resolution of the screen
uniform sampler2D textureSampler; // Texture sampler for the scene

// Parameters for tilt-shift
uniform float focusHeight; // Height of the focused area
uniform float focusWidth; // Width of the focused area
uniform float blurStrength; // Strength of the blur

// Varying variable for screen position
in vec2 vUV;

layout(location = 0) out vec4 glFragColor; // Output color

void main(void) {
  vec2 uv = vUV;

  // Calculate the distance from the focus area
  float distanceToFocus = abs(uv.y - focusHeight);
  float blurFactor = smoothstep(focusWidth, focusWidth + blurStrength, distanceToFocus);

  // Initialize the final color
  vec4 finalColor = vec4(0.0);
  int blurSamples = 10; // Number of samples for blurring

  // Sample the surrounding pixels for blur effect
  for (int i = -blurSamples; i <= blurSamples; i++) {
    for (int j = -blurSamples; j <= blurSamples; j++) {
      vec2 offset = vec2(float(i), float(j)) * blurFactor * (1.0 / resolution);
      // Sample color from texture using the offset
      finalColor += texture(textureSampler, uv + offset);
    }
  }

  // Average the color samples
  finalColor /= float((blurSamples * 2 + 1) * (blurSamples * 2 + 1));

  // Mix original color with the blurred color based on the blur factor
  vec4 originalColor = texture(textureSampler, uv);
  finalColor = mix(originalColor, finalColor, blurFactor);

  glFragColor = finalColor; // Output final color
}
