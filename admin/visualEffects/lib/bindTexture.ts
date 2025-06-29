import { getNextTexturePosition } from "./handleTexturePosition";

const bindTexture = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  texture: WebGLTexture | null | undefined,
  texturePosition?: number
) => {
  if (texture) {
    let position: number | Error;
    if (!texturePosition) {
      position = getNextTexturePosition();
    } else {
      position = texturePosition;
    }

    if (position instanceof Error) {
      return position;
    }

    gl.activeTexture(gl.TEXTURE0 + position);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    return position;
  } else {
    // Return 17 for unused textures
    return 17;
  }
};

export default bindTexture;
