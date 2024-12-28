precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform vec2 resolution; // Resolution of the screen
uniform float pixelSize; // Size of the pixelation effect

void main(void) {
  // Calculate the number of pixels in the x and y direction
  vec2 pixelatedUV = floor(vUV * resolution / pixelSize) * pixelSize / resolution;

  // Get the color from the texture using the pixelated UV coordinates
  vec4 color = texture2D(textureSampler, pixelatedUV);
    
  // Output the final color
  gl_FragColor = color;
}
