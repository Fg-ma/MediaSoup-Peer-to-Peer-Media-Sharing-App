const updateVideoTexture = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  updateVideoTexture: WebGLTexture,
  video: HTMLVideoElement,
  videoProgram: WebGLProgram,
  videoPositionBuffer: WebGLBuffer,
  videoTexCoordBuffer: WebGLBuffer
) => {
  gl.useProgram(videoProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, videoPositionBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, videoTexCoordBuffer);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, updateVideoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
};

export default updateVideoTexture;
