precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;

const float distortionStrength = 0.3;
const float fadeStart = 0.95;  // Controls where the fade starts

void main(void) {
  // Move UV range from [0,1] to [-1,1], centering the distortion
  vec2 uv = vUV * 2.0 - 1.0;
    
  // Calculate the distance from the center of the screen
  float dist = length(uv);
    
  // Apply fisheye distortion only within the circular region (dist < 1.0)
  if (dist < 1.0) 
    // Fisheye distortion: expand distances non-linearly
    float radius = 1.0 - pow(1.0 - dist, distortionStrength); // Distort radius outward
        
    // Keep the angle unchanged
    vec2 direction = normalize(uv);
        
    // Apply the distorted radius
    uv = direction * radius;
        
    // Remap UV back to [0, 1]
    uv = uv * 0.5 + 0.5;
        
    // Sample the texture using the distorted UV coordinates
    vec4 color = texture2D(textureSampler, uv);
        
    // Apply fading only near the edge, between fadeStart and the edge (dist >= fadeStart)
    if (dist >= fadeStart) {
      // Smooth fade as dist approaches 1.0 (outer boundary)
      float fade = smoothstep(fadeStart, 1.0, dist);  // Gradually fade from texture to black
      // Blend the texture color with black based on the fade value
      gl_FragColor = mix(color, vec4(0.0, 0.0, 0.0, 1.0), fade);
    } else {
      // No fading, just apply fisheye distortion
      gl_FragColor = color;
    }
  else {
    // Outside the fisheye circle, render black
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}
