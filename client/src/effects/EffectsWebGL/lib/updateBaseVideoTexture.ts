import BaseShader from "./createBaseShader";

const updateBaseVideoTexture = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseVideoTexture: WebGLTexture,
  video: HTMLVideoElement,
  baseShader: BaseShader
) => {
  if (
    baseShader.positionLocation === null ||
    baseShader.texCoordLocation == null
  ) {
    return;
  }

  baseShader.use();

  gl.bindBuffer(gl.ARRAY_BUFFER, baseShader.getPositionBuffer);
  gl.vertexAttribPointer(baseShader.positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, baseShader.getTexCoordBuffer);
  gl.vertexAttribPointer(baseShader.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, baseVideoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

export default updateBaseVideoTexture;
