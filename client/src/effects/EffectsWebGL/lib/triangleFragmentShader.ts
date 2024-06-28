const triangleFragmentShaderSource = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying vec2 v_texCoord;
  uniform sampler2D u_triangleTexture;

  void main() {
    gl_FragColor = texture2D(u_triangleTexture, v_texCoord);
  }
`;

export default triangleFragmentShaderSource;
