const baseVertexShaderSource = `
  attribute vec3 a_position;
  attribute vec2 a_texCoord;
  attribute vec3 a_normal;
  attribute vec3 a_materialTexCoord;

  varying vec2 v_texCoord;
  varying vec3 v_normal;
  varying vec3 v_materialTexCoord;

  attribute vec2 a_normalTexCoord;
  attribute vec2 a_transmissionRoughnessMetallicTexCoord;
  attribute vec2 a_specularTexCoord;
  attribute vec2 a_emissionTexCoord;

  varying vec2 v_normalTexCoord;
  varying vec2 v_transmissionRoughnessMetallicTexCoord;
  varying vec2 v_specularTexCoord;
  varying vec2 v_emissionTexCoord;

  uniform mat4 u_modelMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;

  void main() {
    // Apply view, projection, and model transformations
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);

    // Pass to fragment shader
    v_texCoord = a_texCoord;
    v_normal = a_normal;
    v_materialTexCoord = a_materialTexCoord;

    v_normalTexCoord = a_normalTexCoord;
    v_transmissionRoughnessMetallicTexCoord = a_transmissionRoughnessMetallicTexCoord; 
    v_specularTexCoord = a_specularTexCoord;
    v_emissionTexCoord = a_emissionTexCoord;
  }
`;

export default baseVertexShaderSource;
