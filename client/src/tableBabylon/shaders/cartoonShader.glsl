precision highp float;

// Sampler for the texture of the current screen
uniform sampler2D textureSampler;

// Texture coordinates
varying vec2 vUV;

// Edge detection using Sobel operator (softer edge threshold)
float edgeDetection(vec2 uv, float width, float height) {
  vec2 texelSize = vec2(1.0 / width, 1.0 / height);

  // Sobel kernel for X direction
  mat3 Gx = mat3(
    -1.0,  0.0,  1.0,
    -2.0,  0.0,  2.0,
    -1.0,  0.0,  1.0
  );

  // Sobel kernel for Y direction
  mat3 Gy = mat3(
    -1.0, -2.0, -1.0,
     0.0,  0.0,  0.0,
     1.0,  2.0,  1.0
  );

  // Sample the surrounding pixels
  vec3 sampleTL = texture2D(textureSampler, uv + texelSize * vec2(-1.0, -1.0)).rgb;
  vec3 sampleT  = texture2D(textureSampler, uv + texelSize * vec2( 0.0, -1.0)).rgb;
  vec3 sampleTR = texture2D(textureSampler, uv + texelSize * vec2( 1.0, -1.0)).rgb;

  vec3 sampleL  = texture2D(textureSampler, uv + texelSize * vec2(-1.0,  0.0)).rgb;
  vec3 sampleR  = texture2D(textureSampler, uv + texelSize * vec2( 1.0,  0.0)).rgb;

  vec3 sampleBL = texture2D(textureSampler, uv + texelSize * vec2(-1.0,  1.0)).rgb;
  vec3 sampleB  = texture2D(textureSampler, uv + texelSize * vec2( 0.0,  1.0)).rgb;
  vec3 sampleBR = texture2D(textureSampler, uv + texelSize * vec2( 1.0,  1.0)).rgb;

  // Apply Sobel operator
  vec3 GxSum = Gx[0][0] * sampleTL + Gx[0][1] * sampleT + Gx[0][2] * sampleTR +
               Gx[1][0] * sampleL  + Gx[1][2] * sampleR  +
               Gx[2][0] * sampleBL + Gx[2][1] * sampleB + Gx[2][2] * sampleBR;

  vec3 GySum = Gy[0][0] * sampleTL + Gy[0][1] * sampleT + Gy[0][2] * sampleTR +
               Gy[1][0] * sampleL  + Gy[1][2] * sampleR  +
               Gy[2][0] * sampleBL + Gy[2][1] * sampleB + Gy[2][2] * sampleBR;

  // Compute the gradient magnitude (edge strength)
  vec3 edge = sqrt(GxSum * GxSum + GySum * GySum);

  // Return edge intensity as a float (lower threshold for softer edges)
  return length(edge) > 0.3 ? 1.0 : 0.0;  // Softened threshold
}

// Smooth Posterize function with brightness adjustment
vec3 posterize(vec3 color, float numColors, float brightnessFactor) {
  // Apply posterization by reducing color levels and boosting brightness
  return pow(floor(color * numColors) / numColors, vec3(brightnessFactor));
}

void main(void) {
  // Fetch the original color from the texture
  vec3 color = texture2D(textureSampler, vUV).rgb;

  // Edge detection (softer for cartoon look)
  float edge = edgeDetection(vUV, 800.0, 600.0);  // Screen resolution can be passed or adjusted

  // Posterize the color to reduce detail (with brightness boost)
  vec3 posterizedColor = posterize(color, 8.0, 0.4);  // 8 levels

  // Soften the posterization effect by blending the original with the posterized result
  posterizedColor = mix(posterizedColor, color, 0.2);  // Blends 20% of the original color back

  // Make edges less dominant (light edges rather than pure black)
  vec3 edgeColor = vec3(0.1);  // Lighter edge color to avoid overpowering the image

  // If an edge is detected, render it as a light edge, otherwise show the posterized color
  gl_FragColor = vec4(mix(posterizedColor, edgeColor, edge), 1.0);
}
