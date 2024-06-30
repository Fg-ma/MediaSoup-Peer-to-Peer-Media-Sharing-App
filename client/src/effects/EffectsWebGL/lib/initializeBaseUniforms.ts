import { EffectTypes } from "src/context/StreamsContext";

export type BaseUniforms =
  | "uImageLocation"
  | "uFaceCountLocation"
  | "uTextureSizeLocation"
  | "uHeadRotationAnglesLocation"
  | "uHeadPitchAnglesLocation"
  | "uHeadYawAnglesLocation"
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
      !rightEarImageTexture ||
      !rightEarImageAspectRatio
    ) {
      return new Error(
        "No leftEarImageTexture or leftEarImageAspectRatio or rightEarImageTexture or rightEarImageAspectRatio"
      );
    }

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, leftEarImageTexture);
    gl.uniform1i(uLeftEarImageLocation, 1);

    gl.uniform1f(uLeftEarAspectRatioLocation, leftEarImageAspectRatio);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, rightEarImageTexture);
    gl.uniform1i(uRightEarImageLocation, 2);

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

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, glassesImageTexture);
    gl.uniform1i(uGlassesImageLocation, 3);

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

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, beardImageTexture);
    gl.uniform1i(uBeardImageLocation, 4);

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

    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, mustacheImageTexture);
    gl.uniform1i(uMustacheImageLocation, 5);

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
  const uHeadPitchAnglesLocation = gl.getUniformLocation(
    baseProgram,
    "u_headPitchAngles"
  );
  const uHeadYawAnglesLocation = gl.getUniformLocation(
    baseProgram,
    "u_headYawAngles"
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
    [uniform in BaseUniforms]: WebGLUniformLocation | null | undefined;
  } = {
    uImageLocation: uImageLocation,
    uFaceCountLocation: uFaceCountLocation,
    uTextureSizeLocation: uTextureSizeLocation,
    uHeadRotationAnglesLocation: uHeadRotationAnglesLocation,
    uHeadPitchAnglesLocation: uHeadPitchAnglesLocation,
    uHeadYawAnglesLocation: uHeadYawAnglesLocation,

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

export default initializeBaseUniforms;
