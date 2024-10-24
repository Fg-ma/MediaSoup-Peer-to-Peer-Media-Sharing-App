precision highp float;

varying vec2 vUV;

uniform float time;
uniform sampler2D textureSampler; 

void main(void) {
  // Sample the original color from the camera's rendered output
  vec4 originalColor = texture2D(textureSampler, vUV);

  // Generate prism color effect
  vec4 colorR = vec4(sin(vUV.x + time) * 0.5 + 0.5, 0.0, 0.0, 1.0);
  vec4 colorG = vec4(0.0, cos(vUV.y + time) * 0.5 + 0.5, 0.0, 1.0);
  vec4 colorB = vec4(0.0, 0.0, sin(vUV.x + vUV.y + time) * 0.5 + 0.5, 1.0);

  // Combine the separated prism colors
  vec4 prismColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);

  // Blend the original scene color with the prism tint effect based on tintStrength
  gl_FragColor = mix(originalColor, prismColor, 0.4);
}
