const baseVertexShaderSource = `
  attribute vec3 a_position;
  attribute vec2 a_texCoord;
  attribute vec3 a_normal;

  varying vec2 v_texCoord;
  varying vec3 v_normal;

  void main() {
    gl_Position = vec4(a_position, 1.0);
    v_texCoord = a_texCoord;
    v_normal = a_normal;
  }
`;

export default baseVertexShaderSource;
