import { EffectTypes } from "src/context/StreamsContext";

export type Uniforms =
  | "uHeadRotationAnglesLocation"
  | "uTextureSizeLocation"
  | "uBlurRadiusLocation"
  | "uTintColorLocation"
  | "uBlurEffectLocation"
  | "uTintEffectLocation"
  | "uDogEarsEffectLocation"
  | "uGlassesEffectLocation"
  | "uBeardEffectLocation"
  | "uLeftDogEarImageLocation"
  | "uLeftDogEarAspectRatioLocation"
  | "uRightDogEarImageLocation"
  | "uRightDogEarAspectRatioLocation"
  | "uGlassesImageLocation"
  | "uGlassesAspectRatioLocation"
  | "uBeardImageLocation"
  | "uBeardAspectRatioLocation"
  | "uLeftEarPositionsLocation"
  | "uRightEarPositionsLocation"
  | "uFaceCountLocation"
  | "uLeftEyePositionsLocation"
  | "uRightEyePositionsLocation"
  | "uEyesCentersLocation"
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
  leftDogEarImageTexture: WebGLTexture | null | undefined,
  leftDogEarImageAspectRatio: number | undefined,
  rightDogEarImageTexture: WebGLTexture | null | undefined,
  rightDogEarImageAspectRatio: number | undefined,
  glassesImageTexture: WebGLTexture | null | undefined,
  glassesImageAspectRatio: number | undefined,
  beardImageTexture: WebGLTexture | null | undefined,
  beardImageAspectRatio: number | undefined
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

  // dogEars
  let uLeftDogEarImageLocation: WebGLUniformLocation | null | undefined;
  let uLeftDogEarAspectRatioLocation: WebGLUniformLocation | null | undefined;
  let uRightDogEarImageLocation: WebGLUniformLocation | null | undefined;
  let uRightDogEarAspectRatioLocation: WebGLUniformLocation | null | undefined;
  if (effects.dogEars) {
    uLeftDogEarImageLocation = gl.getUniformLocation(
      program,
      "u_leftDogEarImage"
    );
    uLeftDogEarAspectRatioLocation = gl.getUniformLocation(
      program,
      "u_leftDogEarAspectRatio"
    );
    uRightDogEarImageLocation = gl.getUniformLocation(
      program,
      "u_rightDogEarImage"
    );
    uRightDogEarAspectRatioLocation = gl.getUniformLocation(
      program,
      "u_rightDogEarAspectRatio"
    );

    if (
      !leftDogEarImageTexture ||
      !leftDogEarImageAspectRatio ||
      !rightDogEarImageTexture ||
      !rightDogEarImageAspectRatio
    ) {
      return new Error(
        "No leftDogEarImageTexture or leftDogEarImageAspectRatio or rightDogEarImageTexture or rightDogEarImageAspectRatio"
      );
    }

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, leftDogEarImageTexture);
    gl.uniform1i(uLeftDogEarImageLocation, 1);

    gl.uniform1f(uLeftDogEarAspectRatioLocation, leftDogEarImageAspectRatio);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, rightDogEarImageTexture);
    gl.uniform1i(uRightDogEarImageLocation, 2);

    gl.uniform1f(uRightDogEarAspectRatioLocation, rightDogEarImageAspectRatio);
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
  if (effects.beard) {
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

  const uBlurEffectLocation = gl.getUniformLocation(program, "u_blurEffect");
  const uTintEffectLocation = gl.getUniformLocation(program, "u_tintEffect");
  const uDogEarsEffectLocation = gl.getUniformLocation(
    program,
    "u_dogEarsEffect"
  );
  const uGlassesEffectLocation = gl.getUniformLocation(
    program,
    "u_glassesEffect"
  );
  const uBeardEffectLocation = gl.getUniformLocation(program, "u_beardEffect");

  gl.uniform1i(uBlurEffectLocation, effects.blur ? 1 : 0);
  gl.uniform1i(uTintEffectLocation, effects.tint ? 1 : 0);
  gl.uniform1i(uDogEarsEffectLocation, effects.dogEars ? 1 : 0);
  gl.uniform1i(uGlassesEffectLocation, effects.glasses ? 1 : 0);
  gl.uniform1i(uBeardEffectLocation, effects.beard ? 1 : 0);

  const uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  } = {
    uHeadRotationAnglesLocation: gl.getUniformLocation(
      program,
      "u_headRotationAngles"
    ),
    uTextureSizeLocation: uTextureSizeLocation,

    uBlurRadiusLocation: uBlurRadiusLocation,
    uTintColorLocation: uTintColorLocation,

    uBlurEffectLocation: uBlurEffectLocation,
    uTintEffectLocation: uTintEffectLocation,
    uDogEarsEffectLocation: uDogEarsEffectLocation,
    uGlassesEffectLocation: uGlassesEffectLocation,
    uBeardEffectLocation: uBeardEffectLocation,

    uLeftDogEarImageLocation: uLeftDogEarImageLocation,
    uLeftDogEarAspectRatioLocation: uLeftDogEarAspectRatioLocation,
    uRightDogEarImageLocation: uRightDogEarImageLocation,
    uRightDogEarAspectRatioLocation: uRightDogEarAspectRatioLocation,
    uGlassesImageLocation: uGlassesImageLocation,
    uGlassesAspectRatioLocation: uGlassesAspectRatioLocation,
    uBeardImageLocation: uBeardImageLocation,
    uBeardAspectRatioLocation: uBeardAspectRatioLocation,

    uLeftEarPositionsLocation: gl.getUniformLocation(
      program,
      "u_leftEarPositions"
    ),
    uRightEarPositionsLocation: gl.getUniformLocation(
      program,
      "u_rightEarPositions"
    ),
    uFaceCountLocation: gl.getUniformLocation(program, "u_faceCount"),
    uLeftEyePositionsLocation: gl.getUniformLocation(
      program,
      "u_leftEyePositions"
    ),
    uRightEyePositionsLocation: gl.getUniformLocation(
      program,
      "u_rightEyePositions"
    ),
    uEyesCentersLocation: gl.getUniformLocation(program, "u_eyesCenters"),
    uNosePositionsLocation: gl.getUniformLocation(program, "u_nosePositions"),

    uRightEarWidthsLocation: gl.getUniformLocation(program, "u_rightEarWidths"),
    uLeftEarWidthsLocation: gl.getUniformLocation(program, "u_leftEarWidths"),
    uEyesWidthsLocation: gl.getUniformLocation(program, "u_eyesWidths"),
    uChinWidthsLocation: gl.getUniformLocation(program, "u_chinWidths"),
  };

  return uniformLocations;
};

export default setUniforms;
