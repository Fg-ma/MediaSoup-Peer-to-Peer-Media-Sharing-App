const baseVertexShaderSource = `
  attribute vec3 a_position;
  attribute vec2 a_texCoord;
  attribute vec3 a_normal;

  varying vec2 v_texCoord;
  varying vec3 v_normal;

  attribute vec2 a_normalTexCoord;
  attribute vec2 a_metallicRoughnessTexCoord;
  attribute vec2 a_specularTexCoord;
  attribute vec2 a_transmissionTexCoord;

  varying vec2 v_normalTexCoord;
  varying vec2 v_metallicRoughnessTexCoord;
  varying vec2 v_specularTexCoord;
  varying vec2 v_transmissionTexCoord;


  uniform mat4 u_modelMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;

  void main() {
    // Apply view, projection, and model transformations
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);

    // Pass to fragment shader
    v_texCoord = a_texCoord;
    v_normal = a_normal;

    v_normalTexCoord = a_normalTexCoord;
    v_metallicRoughnessTexCoord = a_metallicRoughnessTexCoord; 
    v_specularTexCoord = a_specularTexCoord;
    v_transmissionTexCoord = a_transmissionTexCoord;
  }
`;

export default baseVertexShaderSource;
