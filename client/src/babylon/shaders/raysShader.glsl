// God Rays Shader
precision mediump float;

uniform sampler2D textureSampler;  // Input texture (scene color)
uniform vec2 resolution;           // Screen resolution
uniform vec2 lightPositionOnScreen; // Light source position in normalized coordinates (0 to 1)
uniform float exposure;            // Exposure control for intensity
uniform float decay;               // Light decay factor
uniform float density;             // Density of light shafts
uniform float weight;              // How "thick" the rays are

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Sample the original scene
    vec3 color = texture2D(textureSampler, uv).rgb;

    // Direction from pixel to light source
    vec2 deltaTexCoord = uv - lightPositionOnScreen;
    deltaTexCoord *= 1.0 / float(100);  // Number of samples along the ray

    // Initialize raymarching
    vec3 illuminationDecay = vec3(1.0); // Controls intensity fall-off along the ray
    vec3 result = vec3(0.0);            // Accumulated color from god rays

    // March along the ray towards the light source
    for (int i = 0; i < 100; i++) {
        uv -= deltaTexCoord * density; // Move towards light
        vec3 sampleColor = texture2D(textureSampler, uv).rgb;
        sampleColor *= illuminationDecay * weight;

        result += sampleColor;

        // Decay the illumination as we move along the ray
        illuminationDecay *= decay;
    }

    // Apply exposure to the accumulated god rays
    result *= exposure;

    // Add the god rays effect to the original color
    color += result;

    gl_FragColor = vec4(color, 1.0);
}
