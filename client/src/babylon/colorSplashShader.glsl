precision mediump float;

uniform sampler2D textureSampler;  // Input texture
uniform vec2 resolution;            // Resolution of the viewport
uniform vec3 targetColor;           // Color to keep (in RGB)

const float tolerance = 0.2;            // Tolerance for color matching

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // Sample the texture
    vec3 color = texture2D(textureSampler, uv).rgb;

    // Convert color to grayscale
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    vec3 grayColor = vec3(gray);

    // Calculate the distance to the target color
    float distanceToTarget = length(color - targetColor);

    // Create color splash effect
    if (distanceToTarget < tolerance) {
        gl_FragColor = vec4(color, 1.0); // Keep the color
    } else {
        gl_FragColor = vec4(grayColor, 1.0); // Convert to grayscale
    }
}
