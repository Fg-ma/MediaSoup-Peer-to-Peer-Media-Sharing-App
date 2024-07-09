import { EffectTypes } from "src/context/StreamsContext";
import bindTexture from "./bindTexture";
import { BaseShader, BaseShader2 } from "./createBaseShader";

const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, "");

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b];
};

const createAtlasTexture = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  urls: string[]
): Promise<WebGLTexture | null> => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const textureSize = 512;
  const textureCount = urls.length;
  let atlasSide = Math.ceil(Math.sqrt(textureCount));
  const atlasSize = Math.pow(2, Math.ceil(Math.log2(atlasSide * textureSize)));
  atlasSide = atlasSize / 512;

  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = atlasSize;
  atlasCanvas.height = atlasSize;
  const atlasContext = atlasCanvas.getContext("2d");

  if (!atlasContext) {
    throw new Error("Unable to create canvas 2D context.");
  }

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  const images = await Promise.all(urls.map(loadImage));

  images.forEach((image, index) => {
    const row = Math.floor(index / atlasSide);
    const col = index % atlasSide;
    atlasContext.drawImage(
      image,
      col * textureSize,
      row * textureSize,
      textureSize,
      textureSize
    );
  });

  const atlasImage = atlasContext.getImageData(0, 0, atlasSize, atlasSize);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    atlasSize,
    atlasSize,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    atlasImage.data
  );

  return texture;
};

export const LEFT_EAR_EFFECT = 0;
export const RIGHT_EAR_EFFECT = 1;
export const GLASSES_EFFECT = 2;
export const BEARD_EFFECT = 3;
export const MUSTACHE_EFFECT = 4;
export const BLUR_EFFECT = 5;
export const TINT_EFFECT = 6;

const initializeBaseUniforms = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader,
  canvas: HTMLCanvasElement,
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  tintColor: React.MutableRefObject<string>,
  leftEarImageAspectRatio: number | undefined,
  rightEarImageAspectRatio: number | undefined,
  glassesImageAspectRatio: number | undefined,
  beardImageAspectRatio: number | undefined,
  mustacheImageAspectRatio: number | undefined,
  urls: string[]
) => {
  baseShader.use();

  gl.uniform2f(baseShader.textureSizeLocation, canvas.width, canvas.height);

  // blur tint
  if (effects.tint) {
    const tintColorVector = hexToRgb(tintColor.current);
    gl.uniform3fv(baseShader.tintColorLocation, tintColorVector);
  }

  let atlasTexturePosition = bindTexture(
    gl,
    await createAtlasTexture(gl, urls)
  );
  if (atlasTexturePosition instanceof Error) {
    return atlasTexturePosition;
  }

  gl.uniform1i(baseShader.effectTextureAtlasLocation, atlasTexturePosition);

  gl.uniform1fv(baseShader.effectAspectRatiosLocation, [
    leftEarImageAspectRatio ?? 0,
    rightEarImageAspectRatio ?? 0,
    glassesImageAspectRatio ?? 0,
    beardImageAspectRatio ?? 0,
    mustacheImageAspectRatio ?? 0,
  ]);

  let effectFlags = 0;

  // Set the corresponding bits based on the active effects
  if (effects.ears) effectFlags |= 1 << LEFT_EAR_EFFECT;
  if (effects.ears) effectFlags |= 1 << RIGHT_EAR_EFFECT;
  if (effects.glasses) effectFlags |= 1 << GLASSES_EFFECT;
  if (effects.beards) effectFlags |= 1 << BEARD_EFFECT;
  if (effects.mustaches) effectFlags |= 1 << MUSTACHE_EFFECT;
  if (effects.blur) effectFlags |= 1 << BLUR_EFFECT;
  if (effects.tint) effectFlags |= 1 << TINT_EFFECT;

  // Set the uniform value
  gl.uniform1i(baseShader.effectFlagsLocation, effectFlags);
};

export default initializeBaseUniforms;
