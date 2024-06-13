const updateTexture = (
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  video: HTMLVideoElement
) => {
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
};

export default updateTexture;
