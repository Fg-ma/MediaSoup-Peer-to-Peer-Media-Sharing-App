precision highp float;

varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float time;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec2 random2(float seed) {
  return vec2(hash(seed), hash(seed + 1.0));
}

vec2 bubbleDistortion(vec2 uv, vec2 center, float radius) {
  vec2 fromCenter = uv - center;
  float dist = length(fromCenter);
  if (dist < radius) {
    float distortion = sqrt(radius * radius - dist * dist) / radius;
    uv = center + fromCenter * distortion;
  }
  return uv;
}

vec3 pastelColor(float index) {
  vec3 randomColor = vec3(hash(index * 2.0), hash(index * 2.1), hash(index * 2.2));
  return mix(randomColor, vec3(1.0), 0.7);
}

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
  float slowTime = time * 0.3;

  for (int i = 0; i < 10; i++) {
    float seed = float(i) * 100.0;
    vec2 randomOffset = random2(seed);

    // Calculate bubble position, allowing full off-screen removal based on radius
    vec2 bubbleCenter = vec2(
      mod(sin(slowTime + seed * 0.1) * 0.5 + randomOffset.x, 1.0 + 0.2) - 0.1,
      mod(cos(slowTime + seed * 0.1) * 0.5 + randomOffset.y, 1.0 + 0.2) - 0.1
    );
            
    float bubbleRadius = 0.1 + 0.05 * sin(slowTime + float(i));

    vec2 distortedUV = bubbleDistortion(uv, bubbleCenter, bubbleRadius);
    if (distortedUV != uv) {
      vec3 color = pastelColor(float(i));
      float aberrationOffset = 0.01 * sin(slowTime);
      finalColor = chromaticAberration(distortedUV, aberrationOffset);
      finalColor.rgb *= color;
    }

    uv = distortedUV;
  }

  gl_FragColor = finalColor;
}
