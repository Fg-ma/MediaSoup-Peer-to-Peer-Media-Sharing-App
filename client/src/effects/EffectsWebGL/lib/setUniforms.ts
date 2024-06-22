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
  | "uChinWidthsLocation";

const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, "");

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b];
};

const setUniforms = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
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
  const uTextureSizeLocation = gl.getUniformLocation(program, "u_textureSize");

  if (!uTextureSizeLocation) {
    return new Error("No uBlurRadiusLocation or uTextureSizeLocation");
  }

  gl.uniform2f(uTextureSizeLocation, canvas.width, canvas.height);

  // blur uniforms
  let uBlurRadiusLocation: WebGLUniformLocation | null | undefined;
  if (effects.blur) {
    uBlurRadiusLocation = gl.getUniformLocation(program, "u_blurRadius");

    if (!uBlurRadiusLocation) {
      return new Error("No uBlurRadiusLocation");
    }

    gl.uniform1f(uBlurRadiusLocation, 8.0);
  }

  // blur tint
  let uTintColorLocation: WebGLUniformLocation | null | undefined;
  if (effects.tint) {
    uTintColorLocation = gl.getUniformLocation(program, "u_tintColor");
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
    uLeftEarImageLocation = gl.getUniformLocation(program, "u_leftEarImage");
    uLeftEarAspectRatioLocation = gl.getUniformLocation(
      program,
      "u_leftEarAspectRatio"
    );
    uRightEarImageLocation = gl.getUniformLocation(program, "u_rightEarImage");
    uRightEarAspectRatioLocation = gl.getUniformLocation(
      program,
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
    uGlassesImageLocation = gl.getUniformLocation(program, "u_glassesImage");
    uGlassesAspectRatioLocation = gl.getUniformLocation(
      program,
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
    uBeardImageLocation = gl.getUniformLocation(program, "u_beardImage");
    uBeardAspectRatioLocation = gl.getUniformLocation(
      program,
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
    uMustacheImageLocation = gl.getUniformLocation(program, "u_mustacheImage");
    uMustacheAspectRatioLocation = gl.getUniformLocation(
      program,
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

  const uBlurEffectLocation = gl.getUniformLocation(program, "u_blurEffect");
  const uTintEffectLocation = gl.getUniformLocation(program, "u_tintEffect");
  const uEarsEffectLocation = gl.getUniformLocation(program, "u_earsEffect");
  const uGlassesEffectLocation = gl.getUniformLocation(
    program,
    "u_glassesEffect"
  );
  const uBeardEffectLocation = gl.getUniformLocation(program, "u_beardEffect");
  const uMustacheEffectLocation = gl.getUniformLocation(
    program,
    "u_mustacheEffect"
  );

  gl.uniform1i(uBlurEffectLocation, effects.blur ? 1 : 0);
  gl.uniform1i(uTintEffectLocation, effects.tint ? 1 : 0);
  gl.uniform1i(uEarsEffectLocation, effects.ears ? 1 : 0);
  gl.uniform1i(uGlassesEffectLocation, effects.glasses ? 1 : 0);
  gl.uniform1i(uBeardEffectLocation, effects.beards ? 1 : 0);
  gl.uniform1i(uMustacheEffectLocation, effects.mustaches ? 1 : 0);

  const uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  } = {
    uFaceCountLocation: gl.getUniformLocation(program, "u_faceCount"),
    uTextureSizeLocation: uTextureSizeLocation,
    uHeadRotationAnglesLocation: gl.getUniformLocation(
      program,
      "u_headRotationAngles"
    ),
    uHeadPitchAnglesLocation: gl.getUniformLocation(
      program,
      "u_headPitchAngles"
    ),
    uHeadYawAnglesLocation: gl.getUniformLocation(program, "u_headYawAngles"),

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
    uEarsImageOffset: gl.getUniformLocation(program, "u_earsImageOffset"),
    uGlassesImageLocation: uGlassesImageLocation,
    uGlassesAspectRatioLocation: uGlassesAspectRatioLocation,
    uBeardImageLocation: uBeardImageLocation,
    uBeardAspectRatioLocation: uBeardAspectRatioLocation,
    uBeardImageOffset: gl.getUniformLocation(program, "u_beardImageOffset"),
    uMustacheImageLocation: uMustacheImageLocation,
    uMustacheAspectRatioLocation: uMustacheAspectRatioLocation,
    uMustacheImageOffset: gl.getUniformLocation(
      program,
      "u_mustacheImageOffset"
    ),

    uLeftEarPositionsLocation: gl.getUniformLocation(
      program,
      "u_leftEarPositions"
    ),
    uRightEarPositionsLocation: gl.getUniformLocation(
      program,
      "u_rightEarPositions"
    ),
    uLeftEyePositionsLocation: gl.getUniformLocation(
      program,
      "u_leftEyePositions"
    ),
    uRightEyePositionsLocation: gl.getUniformLocation(
      program,
      "u_rightEyePositions"
    ),
    uEyesCentersLocation: gl.getUniformLocation(program, "u_eyesCenters"),
    uChinPositionsLocation: gl.getUniformLocation(program, "u_chinPositions"),
    uNosePositionsLocation: gl.getUniformLocation(program, "u_nosePositions"),

    uRightEarWidthsLocation: gl.getUniformLocation(program, "u_rightEarWidths"),
    uLeftEarWidthsLocation: gl.getUniformLocation(program, "u_leftEarWidths"),
    uEyesWidthsLocation: gl.getUniformLocation(program, "u_eyesWidths"),
    uChinWidthsLocation: gl.getUniformLocation(program, "u_chinWidths"),
  };

  return uniformLocations;
};

export default setUniforms;
