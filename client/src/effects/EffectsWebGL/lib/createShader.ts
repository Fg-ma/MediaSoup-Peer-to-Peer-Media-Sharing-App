const createShader = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string
) => {
  const shader = gl.createShader(type);
  if (!shader) {
    return new Error("No shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const infoLog = gl.getShaderInfoLog(shader);
    console.error("An error occurred compiling the shaders:", infoLog);
    gl.deleteShader(shader);
    return new Error("Shader compile failed with: " + infoLog);
  }
  return shader;
};

export default createShader;
