const baseVertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.99, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const baseVertexShaderSource2 = `
  attribute vec3 a_position;
  attribute vec2 a_texCoord;

  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 1.0);
    v_texCoord = a_texCoord;
  }
`;

export { baseVertexShaderSource, baseVertexShaderSource2 };
