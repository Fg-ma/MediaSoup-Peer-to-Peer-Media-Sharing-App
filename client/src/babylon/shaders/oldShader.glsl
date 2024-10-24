// Old Film Grain + Scratches Shader
precision mediump float;

uniform sampler2D textureSampler;  // Input texture
uniform vec2 resolution;            // Resolution of the viewport
uniform float time;                 // Time variable for flickering

// Sepia tone function
vec3 applySepia(vec3 color) {
    vec3 sepiaColor;
    sepiaColor.r = dot(color, vec3(0.393, 0.769, 0.189));
    sepiaColor.g = dot(color, vec3(0.349, 0.686, 0.168));
    sepiaColor.b = dot(color, vec3(0.272, 0.534, 0.131));
    return sepiaColor;
}

// Generate film grain
float generateGrain(vec2 uv) {
    float noise = fract(sin(dot(uv.xy + time * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
    return noise * 0.1; // Adjust grain intensity here
}

// Function to create scratches
float generateScratches(vec2 uv) {
    float scratch = step(0.98, fract(uv.y * 100.0 + time * 0.2)) * step(0.5, fract(uv.x * 100.0));
    return scratch * 0.5; // Adjust scratch intensity here
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Sample the texture
    vec3 color = texture2D(textureSampler, uv).rgb;

    // Apply sepia tone
    color = applySepia(color);

    // Add film grain
    float grain = generateGrain(uv);
    color += vec3(grain); // Add grain effect

    // Add scratches
    float scratches = generateScratches(uv);
    color *= (1.0 - scratches); // Darken areas where scratches appear

    // Flickering effect
    float flicker = 0.95 + (sin(time * 10.0) * 0.05); // Flickering
    color *= flicker;

    gl_FragColor = vec4(color, 1.0);
}
