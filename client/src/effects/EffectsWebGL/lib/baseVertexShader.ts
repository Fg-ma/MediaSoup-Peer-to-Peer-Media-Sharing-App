const baseVertexShaderSource = `
  attribute vec3 a_position;
  attribute vec2 a_texCoord;
  attribute vec3 a_normal;

  varying vec2 v_texCoord;
  varying vec3 v_normal;

  uniform mat4 u_modelMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;
  uniform mat3 u_normalMatrix;

  void main() {
    // Apply model transformation to the vertex position
    vec4 worldPosition = u_modelMatrix * vec4(a_position, 1.0);

    // Apply view and projection transformations
    gl_Position = u_projectionMatrix * u_viewMatrix * worldPosition;

    // Pass the texture coordinate to the fragment shader
    v_texCoord = a_texCoord;

    // Transform the normal vector to world space
    v_normal = normalize(u_normalMatrix * a_normal);
  }
`;

export default baseVertexShaderSource;
