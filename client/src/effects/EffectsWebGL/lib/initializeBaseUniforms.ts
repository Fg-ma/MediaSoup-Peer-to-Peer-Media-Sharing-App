import { EffectTypes } from "src/context/StreamsContext";
import { bindTexture, bindTexture2 } from "./bindTexture";
import { getNextTexturePosition } from "./handleTexturePosition";

export type BaseUniformsLocations =
  | "uImageLocation"
  | "uFaceCountLocation"
  | "uTextureSizeLocation"
  | "uHeadRotationAnglesLocation"
  | "uBlurRadiusLocation"
  | "uTintColorLocation"
  | "uBlurEffectLocation"
  | "uTintEffectLocation"
  | "uEarsEffectLocation"
  | "uGlassesEffectLocation"
  | "uBeardEffectLocation"
  | "uMustacheEffectLocation"
  | "uLeftEarImageLocation"
  | "uLeftEarAspectRatioLocation"
  | "uRightEarImageLocation"
  | "uRightEarAspectRatioLocation"
  | "uEarsImageOffset"
  | "uGlassesImageLocation"
  | "uGlassesAspectRatioLocation"
  | "uBeardImageLocation"
  | "uBeardAspectRatioLocation"
  | "uBeardImageOffset"
  | "uMustacheImageLocation"
  | "uMustacheAspectRatioLocation"
  | "uMustacheImageOffset"
  | "uLeftEarPositionsLocation"
  | "uRightEarPositionsLocation"
  | "uLeftEyePositionsLocation"
  | "uRightEyePositionsLocation"
  | "uEyesCentersLocation"
  | "uChinPositionsLocation"
  | "uNosePositionsLocation"
  | "uRightEarWidthsLocation"
  | "uLeftEarWidthsLocation"
  | "uEyesWidthsLocation"
  | "uChinWidthsLocation";

const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, "");

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b];
};

const initializeBaseUniforms = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseProgram: WebGLProgram,
  canvas: HTMLCanvasElement,
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  tintColor: React.MutableRefObject<string>,
  leftEarImageTexture: WebGLTexture | null | undefined,
  leftEarImageAspectRatio: number | undefined,
  rightEarImageTexture: WebGLTexture | null | undefined,
  rightEarImageAspectRatio: number | undefined,
  glassesImageTexture: WebGLTexture | null | undefined,
  glassesImageAspectRatio: number | undefined,
  beardImageTexture: WebGLTexture | null | undefined,
  beardImageAspectRatio: number | undefined,
  mustacheImageTexture: WebGLTexture | null | undefined,
  mustacheImageAspectRatio: number | undefined
) => {
  gl.useProgram(baseProgram);

  const uImageLocation = gl.getUniformLocation(baseProgram, "u_image");

  const uTextureSizeLocation = gl.getUniformLocation(
    baseProgram,
    "u_textureSize"
  );

  if (!uTextureSizeLocation) {
    return new Error("No uTextureSizeLocation");
  }

  gl.uniform2f(uTextureSizeLocation, canvas.width, canvas.height);

  // blur uniforms
  let uBlurRadiusLocation: WebGLUniformLocation | null | undefined;
  if (effects.blur) {
    uBlurRadiusLocation = gl.getUniformLocation(baseProgram, "u_blurRadius");

    if (!uBlurRadiusLocation) {
      return new Error("No uBlurRadiusLocation");
    }

    gl.uniform1f(uBlurRadiusLocation, 8.0);
  }

  // blur tint
  let uTintColorLocation: WebGLUniformLocation | null | undefined;
  if (effects.tint) {
    uTintColorLocation = gl.getUniformLocation(baseProgram, "u_tintColor");
    const tintColorVector = hexToRgb(tintColor.current);

    if (!uTintColorLocation) {
      return new Error("No uTintColorLocation");
    }

    gl.uniform3fv(uTintColorLocation, tintColorVector);
  }

  // ears
  let uLeftEarImageLocation: WebGLUniformLocation | null | undefined;
  let uLeftEarAspectRatioLocation: WebGLUniformLocation | null | undefined;
  let uRightEarImageLocation: WebGLUniformLocation | null | undefined;
  let uRightEarAspectRatioLocation: WebGLUniformLocation | null | undefined;
  if (effects.ears) {
    uLeftEarImageLocation = gl.getUniformLocation(
      baseProgram,
      "u_leftEarImage"
    );
    uLeftEarAspectRatioLocation = gl.getUniformLocation(
      baseProgram,
      "u_leftEarAspectRatio"
    );
    uRightEarImageLocation = gl.getUniformLocation(
      baseProgram,
      "u_rightEarImage"
    );
    uRightEarAspectRatioLocation = gl.getUniformLocation(
      baseProgram,
      "u_rightEarAspectRatio"
    );

    if (
      !leftEarImageTexture ||
      !leftEarImageAspectRatio ||
      !uLeftEarImageLocation ||
      !uLeftEarAspectRatioLocation ||
      !rightEarImageTexture ||
      !rightEarImageAspectRatio ||
      !uRightEarImageLocation ||
      !uRightEarAspectRatioLocation
    ) {
      return new Error(
        "No leftEarImageTexture or leftEarImageAspectRatio or uLeftEarImageLocation or uLeftEarAspectRatioLocation or rightEarImageTexture or rightEarImageAspectRatio or uRightEarImageLocation or uRightEarAspectRatioLocation"
      );
    }

    bindTexture(gl, leftEarImageTexture, uLeftEarImageLocation);

    gl.uniform1f(uLeftEarAspectRatioLocation, leftEarImageAspectRatio);

    bindTexture(gl, rightEarImageTexture, uRightEarImageLocation);

    gl.uniform1f(uRightEarAspectRatioLocation, rightEarImageAspectRatio);
  }

  // glasses
  let uGlassesImageLocation: WebGLUniformLocation | null | undefined;
  let uGlassesAspectRatioLocation: WebGLUniformLocation | null | undefined;
  if (effects.glasses) {
    uGlassesImageLocation = gl.getUniformLocation(
      baseProgram,
      "u_glassesImage"
    );
    uGlassesAspectRatioLocation = gl.getUniformLocation(
      baseProgram,
      "u_glassesAspectRatio"
    );

    if (
      !glassesImageTexture ||
      !glassesImageAspectRatio ||
      !uGlassesImageLocation ||
      !uGlassesAspectRatioLocation
    ) {
      return new Error(
        "No glassesImageTexture or glassesImageAspectRatio or uGlassesImageLocation or uGlassesAspectRatioLocation"
      );
    }

    bindTexture(gl, glassesImageTexture, uGlassesImageLocation);

    gl.uniform1f(uGlassesAspectRatioLocation, glassesImageAspectRatio);
  }

  // beard
  let uBeardImageLocation: WebGLUniformLocation | null | undefined;
  let uBeardAspectRatioLocation: WebGLUniformLocation | null | undefined;
  if (effects.beards) {
    uBeardImageLocation = gl.getUniformLocation(baseProgram, "u_beardImage");
    uBeardAspectRatioLocation = gl.getUniformLocation(
      baseProgram,
      "u_beardAspectRatio"
    );

    if (
      !beardImageTexture ||
      !beardImageAspectRatio ||
      !uBeardImageLocation ||
      !uBeardAspectRatioLocation
    ) {
      return new Error(
        "No beardImageTexture or beardImageAspectRatio or uBeardImageLocation or uBeardAspectRatioLocation"
      );
    }

    bindTexture(gl, beardImageTexture, uBeardImageLocation);

    gl.uniform1f(uBeardAspectRatioLocation, beardImageAspectRatio);
  }

  // mustache
  let uMustacheImageLocation: WebGLUniformLocation | null | undefined;
  let uMustacheAspectRatioLocation: WebGLUniformLocation | null | undefined;
  if (effects.mustaches) {
    uMustacheImageLocation = gl.getUniformLocation(
      baseProgram,
      "u_mustacheImage"
    );
    uMustacheAspectRatioLocation = gl.getUniformLocation(
      baseProgram,
      "u_mustacheAspectRatio"
    );

    if (
      !mustacheImageTexture ||
      !mustacheImageAspectRatio ||
      !uMustacheImageLocation ||
      !uMustacheAspectRatioLocation
    ) {
      return new Error(
        "No mustacheImageTexture or mustacheImageAspectRatio or uMustacheImageLocation or uMustacheAspectRatioLocation"
      );
    }

    bindTexture(gl, mustacheImageTexture, uMustacheImageLocation);

    gl.uniform1f(uMustacheAspectRatioLocation, mustacheImageAspectRatio);
  }

  const uBlurEffectLocation = gl.getUniformLocation(
    baseProgram,
    "u_blurEffect"
  );
  const uTintEffectLocation = gl.getUniformLocation(
    baseProgram,
    "u_tintEffect"
  );
  const uEarsEffectLocation = gl.getUniformLocation(
    baseProgram,
    "u_earsEffect"
  );
  const uGlassesEffectLocation = gl.getUniformLocation(
    baseProgram,
    "u_glassesEffect"
  );
  const uBeardEffectLocation = gl.getUniformLocation(
    baseProgram,
    "u_beardEffect"
  );
  const uMustacheEffectLocation = gl.getUniformLocation(
    baseProgram,
    "u_mustacheEffect"
  );

  gl.uniform1i(uBlurEffectLocation, effects.blur ? 1 : 0);
  gl.uniform1i(uTintEffectLocation, effects.tint ? 1 : 0);
  gl.uniform1i(uEarsEffectLocation, effects.ears ? 1 : 0);
  gl.uniform1i(uGlassesEffectLocation, effects.glasses ? 1 : 0);
  gl.uniform1i(uBeardEffectLocation, effects.beards ? 1 : 0);
  gl.uniform1i(uMustacheEffectLocation, effects.mustaches ? 1 : 0);

  const uFaceCountLocation = gl.getUniformLocation(baseProgram, "u_faceCount");
  const uHeadRotationAnglesLocation = gl.getUniformLocation(
    baseProgram,
    "u_headRotationAngles"
  );
  const uEarsImageOffset = gl.getUniformLocation(
    baseProgram,
    "u_earsImageOffset"
  );
  const uBeardImageOffset = gl.getUniformLocation(
    baseProgram,
    "u_beardImageOffset"
  );
  const uMustacheImageOffset = gl.getUniformLocation(
    baseProgram,
    "u_mustacheImageOffset"
  );
  const uLeftEarPositionsLocation = gl.getUniformLocation(
    baseProgram,
    "u_leftEarPositions"
  );
  const uRightEarPositionsLocation = gl.getUniformLocation(
    baseProgram,
    "u_rightEarPositions"
  );
  const uLeftEyePositionsLocation = gl.getUniformLocation(
    baseProgram,
    "u_leftEyePositions"
  );
  const uRightEyePositionsLocation = gl.getUniformLocation(
    baseProgram,
    "u_rightEyePositions"
  );
  const uEyesCentersLocation = gl.getUniformLocation(
    baseProgram,
    "u_eyesCenters"
  );
  const uChinPositionsLocation = gl.getUniformLocation(
    baseProgram,
    "u_chinPositions"
  );
  const uNosePositionsLocation = gl.getUniformLocation(
    baseProgram,
    "u_nosePositions"
  );
  const uRightEarWidthsLocation = gl.getUniformLocation(
    baseProgram,
    "u_rightEarWidths"
  );
  const uLeftEarWidthsLocation = gl.getUniformLocation(
    baseProgram,
    "u_leftEarWidths"
  );
  const uEyesWidthsLocation = gl.getUniformLocation(
    baseProgram,
    "u_eyesWidths"
  );
  const uChinWidthsLocation = gl.getUniformLocation(
    baseProgram,
    "u_chinWidths"
  );

  const baseUniformLocations: {
    [uniform in BaseUniformsLocations]: WebGLUniformLocation | null | undefined;
  } = {
    uImageLocation: uImageLocation,
    uFaceCountLocation: uFaceCountLocation,
    uTextureSizeLocation: uTextureSizeLocation,
    uHeadRotationAnglesLocation: uHeadRotationAnglesLocation,

    uBlurRadiusLocation: uBlurRadiusLocation,
    uTintColorLocation: uTintColorLocation,

    uBlurEffectLocation: uBlurEffectLocation,
    uTintEffectLocation: uTintEffectLocation,
    uEarsEffectLocation: uEarsEffectLocation,
    uGlassesEffectLocation: uGlassesEffectLocation,
    uBeardEffectLocation: uBeardEffectLocation,
    uMustacheEffectLocation: uMustacheEffectLocation,

    uLeftEarImageLocation: uLeftEarImageLocation,
    uLeftEarAspectRatioLocation: uLeftEarAspectRatioLocation,
    uRightEarImageLocation: uRightEarImageLocation,
    uRightEarAspectRatioLocation: uRightEarAspectRatioLocation,
    uEarsImageOffset: uEarsImageOffset,
    uGlassesImageLocation: uGlassesImageLocation,
    uGlassesAspectRatioLocation: uGlassesAspectRatioLocation,
    uBeardImageLocation: uBeardImageLocation,
    uBeardAspectRatioLocation: uBeardAspectRatioLocation,
    uBeardImageOffset: uBeardImageOffset,
    uMustacheImageLocation: uMustacheImageLocation,
    uMustacheAspectRatioLocation: uMustacheAspectRatioLocation,
    uMustacheImageOffset: uMustacheImageOffset,

    uLeftEarPositionsLocation: uLeftEarPositionsLocation,
    uRightEarPositionsLocation: uRightEarPositionsLocation,
    uLeftEyePositionsLocation: uLeftEyePositionsLocation,
    uRightEyePositionsLocation: uRightEyePositionsLocation,
    uEyesCentersLocation: uEyesCentersLocation,
    uChinPositionsLocation: uChinPositionsLocation,
    uNosePositionsLocation: uNosePositionsLocation,

    uRightEarWidthsLocation: uRightEarWidthsLocation,
    uLeftEarWidthsLocation: uLeftEarWidthsLocation,
    uEyesWidthsLocation: uEyesWidthsLocation,
    uChinWidthsLocation: uChinWidthsLocation,
  };

  return baseUniformLocations;
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
  const atlasSide = Math.ceil(Math.sqrt(textureCount));
  const atlasSize = Math.pow(2, Math.ceil(Math.log2(atlasSide * textureSize)));

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

const initializeBaseUniforms2 = async (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseProgram: WebGLProgram,
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
  gl.useProgram(baseProgram);

  const uLiveVideoImageLocation = gl.getUniformLocation(
    baseProgram,
    "u_liveVideoImage"
  );
  const uTextureSizeLocation = gl.getUniformLocation(
    baseProgram,
    "u_textureSize"
  );
  const uFaceCountLocation = gl.getUniformLocation(baseProgram, "u_faceCount");
  const uEffectFlagsLocation = gl.getUniformLocation(
    baseProgram,
    "u_effectFlags"
  );
  const uTintColorLocation = gl.getUniformLocation(baseProgram, "u_tintColor");
  const uEffectTextureAtlasLocation = gl.getUniformLocation(
    baseProgram,
    "u_effectTextureAtlas"
  );
  const uEffectAspectRatiosLocation = gl.getUniformLocation(
    baseProgram,
    "u_effectAspectRatios"
  );
  const uPositionsOffsetsTextureLocation = gl.getUniformLocation(
    baseProgram,
    "u_positionsOffsetsTexture"
  );
  const uWidthsHeadRotationAnglesTexture = gl.getUniformLocation(
    baseProgram,
    "u_widthsHeadRotationAnglesTexture"
  );

  if (!uLiveVideoImageLocation) {
    return new Error("No uLiveVideoImageLocation");
  }
  if (!uTextureSizeLocation) {
    return new Error("No uTextureSizeLocation");
  }
  if (!uFaceCountLocation) {
    return new Error("No uFaceCountLocation");
  }
  if (!uTintColorLocation) {
    return new Error("No uTintColorLocation");
  }
  if (!uEffectFlagsLocation) {
    return new Error("No uEffectFlagsLocation");
  }
  if (!uEffectTextureAtlasLocation) {
    return new Error("No uEffectTextureAtlasLocation");
  }
  if (!uEffectAspectRatiosLocation) {
    return new Error("No uEffectAspectRatiosLocation");
  }
  if (!uPositionsOffsetsTextureLocation) {
    return new Error("No uPositionsOffsetsTextureLocation");
  }
  if (!uWidthsHeadRotationAnglesTexture) {
    return new Error("No uWidthsHeadRotationAnglesTexture");
  }

  gl.uniform2f(uTextureSizeLocation, canvas.width, canvas.height);

  // blur tint
  if (effects.tint) {
    const tintColorVector = hexToRgb(tintColor.current);
    gl.uniform3fv(uTintColorLocation, tintColorVector);
  }

  let atlasTexturePosition = bindTexture2(
    gl,
    await createAtlasTexture(gl, urls)
  );
  if (atlasTexturePosition instanceof Error) {
    return atlasTexturePosition;
  }

  gl.uniform1i(uEffectTextureAtlasLocation, atlasTexturePosition);

  gl.uniform1fv(uEffectAspectRatiosLocation, [
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
  gl.uniform1i(uEffectFlagsLocation, effectFlags);

  const baseUniformLocations: {
    [uniform in BaseUniformsLocations2]: WebGLUniformLocation;
  } = {
    uLiveVideoImageLocation: uLiveVideoImageLocation,
    uTextureSizeLocation: uTextureSizeLocation,
    uFaceCountLocation: uFaceCountLocation,
    uEffectFlagsLocation: uEffectFlagsLocation,
    uTintColorLocation: uTintColorLocation,
    uEffectTextureAtlasLocation: uEffectTextureAtlasLocation,
    uEffectAspectRatiosLocation: uEffectAspectRatiosLocation,
    uPositionsOffsetsTextureLocation: uPositionsOffsetsTextureLocation,
    uWidthsHeadRotationAnglesTexture: uWidthsHeadRotationAnglesTexture,
  };

  return baseUniformLocations;
};

export { initializeBaseUniforms, initializeBaseUniforms2 };

const LEFT_EAR_EFFECT = 0;
const RIGHT_EAR_EFFECT = 1;
const GLASSES_EFFECT = 2;
const BEARD_EFFECT = 3;
const MUSTACHE_EFFECT = 4;
const BLUR_EFFECT = 5;
const TINT_EFFECT = 6;

export type BaseUniformsLocations2 =
  | "uLiveVideoImageLocation"
  | "uFaceCountLocation"
  | "uTextureSizeLocation"
  | "uEffectFlagsLocation"
  | "uTintColorLocation"
  | "uEffectTextureAtlasLocation"
  | "uEffectAspectRatiosLocation"
  | "uPositionsOffsetsTextureLocation"
  | "uWidthsHeadRotationAnglesTexture";
