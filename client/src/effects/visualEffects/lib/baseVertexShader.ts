const baseVertexShaderSource = `
  attribute vec3 a_position;
  attribute vec2 a_texCoord;
  attribute vec3 a_normal;
  attribute vec2 a_materialTexCoord;

  varying vec2 v_texCoord;
  varying vec2 v_materialTexCoord; 
  varying vec3 v_normal;

  uniform mat4 u_modelMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;

  void main() {
    // Apply view, projection, and model transformations
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);

    // Pass to fragment shader
    v_texCoord = a_texCoord;
    v_materialTexCoord = a_materialTexCoord;
    v_normal = a_normal;
  }
`;

export default baseVertexShaderSource;
