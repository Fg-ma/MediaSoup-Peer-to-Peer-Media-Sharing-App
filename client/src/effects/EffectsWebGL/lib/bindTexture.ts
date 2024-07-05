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

const bindTexture2 = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  texture: WebGLTexture | null | undefined
) => {
  if (texture) {
    const position = getNextTexturePosition();
    if (position instanceof Error) {
      return position;
    }
    gl.activeTexture(gl.TEXTURE0 + position);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    return position;
  } else {
    // Return -1 for unused textures
    return 16;
  }
};

export { bindTexture, bindTexture2 };
