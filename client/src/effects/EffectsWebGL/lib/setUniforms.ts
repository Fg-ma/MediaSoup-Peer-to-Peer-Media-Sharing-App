import { EffectTypes } from "src/context/StreamsContext";

export type Uniforms =
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
  | "uChinWidthsLocation"
  | "uTriangleTextureLocation";

const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, "");

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b];
};

const setUniforms = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  videoProgram: WebGLProgram,
  triangleProgram: WebGLProgram,
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
  mustacheImageAspectRatio: number | undefined,
  triangleImageTexture: WebGLTexture | null | undefined
) => {
  gl.useProgram(videoProgram);

  const uTextureSizeLocation = gl.getUniformLocation(
    videoProgram,
    "u_textureSize"
  );

  if (!uTextureSizeLocation) {
    return new Error("No uTextureSizeLocation");
  }

  gl.uniform2f(uTextureSizeLocation, canvas.width, canvas.height);

  // blur uniforms
  let uBlurRadiusLocation: WebGLUniformLocation | null | undefined;
  if (effects.blur) {
    uBlurRadiusLocation = gl.getUniformLocation(videoProgram, "u_blurRadius");

    if (!uBlurRadiusLocation) {
      return new Error("No uBlurRadiusLocation");
    }

    gl.uniform1f(uBlurRadiusLocation, 8.0);
  }

  // blur tint
  let uTintColorLocation: WebGLUniformLocation | null | undefined;
  if (effects.tint) {
    uTintColorLocation = gl.getUniformLocation(videoProgram, "u_tintColor");
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
      videoProgram,
      "u_leftEarImage"
    );
    uLeftEarAspectRatioLocation = gl.getUniformLocation(
      videoProgram,
      "u_leftEarAspectRatio"
    );
    uRightEarImageLocation = gl.getUniformLocation(
      videoProgram,
      "u_rightEarImage"
    );
    uRightEarAspectRatioLocation = gl.getUniformLocation(
      videoProgram,
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
      videoProgram,
      "u_glassesImage"
    );
    uGlassesAspectRatioLocation = gl.getUniformLocation(
      videoProgram,
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
    uBeardImageLocation = gl.getUniformLocation(videoProgram, "u_beardImage");
    uBeardAspectRatioLocation = gl.getUniformLocation(
      videoProgram,
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
      videoProgram,
      "u_mustacheImage"
    );
    uMustacheAspectRatioLocation = gl.getUniformLocation(
      videoProgram,
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
    videoProgram,
    "u_blurEffect"
  );
  const uTintEffectLocation = gl.getUniformLocation(
    videoProgram,
    "u_tintEffect"
  );
  const uEarsEffectLocation = gl.getUniformLocation(
    videoProgram,
    "u_earsEffect"
  );
  const uGlassesEffectLocation = gl.getUniformLocation(
    videoProgram,
    "u_glassesEffect"
  );
  const uBeardEffectLocation = gl.getUniformLocation(
    videoProgram,
    "u_beardEffect"
  );
  const uMustacheEffectLocation = gl.getUniformLocation(
    videoProgram,
    "u_mustacheEffect"
  );

  gl.uniform1i(uBlurEffectLocation, effects.blur ? 1 : 0);
  gl.uniform1i(uTintEffectLocation, effects.tint ? 1 : 0);
  gl.uniform1i(uEarsEffectLocation, effects.ears ? 1 : 0);
  gl.uniform1i(uGlassesEffectLocation, effects.glasses ? 1 : 0);
  gl.uniform1i(uBeardEffectLocation, effects.beards ? 1 : 0);
  gl.uniform1i(uMustacheEffectLocation, effects.mustaches ? 1 : 0);

  const uFaceCountLocation = gl.getUniformLocation(videoProgram, "u_faceCount");
  const uHeadRotationAnglesLocation = gl.getUniformLocation(
    videoProgram,
    "u_headRotationAngles"
  );
  const uHeadPitchAnglesLocation = gl.getUniformLocation(
    videoProgram,
    "u_headPitchAngles"
  );
  const uHeadYawAnglesLocation = gl.getUniformLocation(
    videoProgram,
    "u_headYawAngles"
  );
  const uEarsImageOffset = gl.getUniformLocation(
    videoProgram,
    "u_earsImageOffset"
  );
  const uBeardImageOffset = gl.getUniformLocation(
    videoProgram,
    "u_beardImageOffset"
  );
  const uMustacheImageOffset = gl.getUniformLocation(
    videoProgram,
    "u_mustacheImageOffset"
  );
  const uLeftEarPositionsLocation = gl.getUniformLocation(
    videoProgram,
    "u_leftEarPositions"
  );
  const uRightEarPositionsLocation = gl.getUniformLocation(
    videoProgram,
    "u_rightEarPositions"
  );
  const uLeftEyePositionsLocation = gl.getUniformLocation(
    videoProgram,
    "u_leftEyePositions"
  );
  const uRightEyePositionsLocation = gl.getUniformLocation(
    videoProgram,
    "u_rightEyePositions"
  );
  const uEyesCentersLocation = gl.getUniformLocation(
    videoProgram,
    "u_eyesCenters"
  );
  const uChinPositionsLocation = gl.getUniformLocation(
    videoProgram,
    "u_chinPositions"
  );
  const uNosePositionsLocation = gl.getUniformLocation(
    videoProgram,
    "u_nosePositions"
  );
  const uRightEarWidthsLocation = gl.getUniformLocation(
    videoProgram,
    "u_rightEarWidths"
  );
  const uLeftEarWidthsLocation = gl.getUniformLocation(
    videoProgram,
    "u_leftEarWidths"
  );
  const uEyesWidthsLocation = gl.getUniformLocation(
    videoProgram,
    "u_eyesWidths"
  );
  const uChinWidthsLocation = gl.getUniformLocation(
    videoProgram,
    "u_chinWidths"
  );

  gl.useProgram(triangleProgram);

  const uTriangleTextureLocation = gl.getUniformLocation(
    triangleProgram,
    "u_triangleTexture"
  );

  if (!triangleImageTexture || !uTriangleTextureLocation) {
    return new Error("No triangleImageTexture or uTriangleTextureLocation");
  }

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, triangleImageTexture);
  gl.uniform1i(uTriangleTextureLocation, 3);

  const uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  } = {
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

    uTriangleTextureLocation: uTriangleTextureLocation,
  };

  return uniformLocations;
};

export default setUniforms;
