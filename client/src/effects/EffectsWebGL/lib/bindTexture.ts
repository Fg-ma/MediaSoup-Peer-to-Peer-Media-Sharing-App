import { getNextTexturePosition } from "./handleTexturePosition";

const bindTexture = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  texture: WebGLTexture,
  uLocation: WebGLUniformLocation
) => {
  const texturePosition = getNextTexturePosition();

  if (texturePosition instanceof Error) {
    return texturePosition;
  }

  gl.activeTexture(gl.TEXTURE0 + texturePosition);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(uLocation, texturePosition);
};

export default bindTexture;
