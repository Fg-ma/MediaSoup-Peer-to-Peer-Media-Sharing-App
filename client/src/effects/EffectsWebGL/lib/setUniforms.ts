import { EffectTypes } from "src/context/StreamsContext";

export type Uniforms =
  | "uBlurEffectLocation"
  | "uTintEffectLocation"
  | "uDogEarsEffectLocation"
  | "uGlassesEffectLocation"
  | "uTextureSizeLocation"
  | "uBlurRadiusLocation"
  | "uTintColorLocation"
  | "uLeftDogEarImageLocation"
  | "uLeftDogEarAspectRatioLocation"
  | "uRightDogEarImageLocation"
  | "uRightDogEarAspectRatioLocation"
  | "uLeftEarPositionsLocation"
  | "uRightEarPositionsLocation"
  | "uLeftEarSizesLocation"
  | "uRightEarSizesLocation"
  | "uHeadRotationAnglesLocation"
  | "uFaceCountLocation"
  | "uLeftEyePositionsLocation"
  | "uRightEyePositionsLocation"
  | "uEyesCentersLocation"
  | "uEyesWidths"
  | "uGlassesAspectRatioLocation";

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
  glassesImageAspectRatio: number | undefined
) => {
  const uTextureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  if (uTextureSizeLocation) {
    gl.uniform2f(uTextureSizeLocation, canvas.width, canvas.height);
  }

  // blur uniforms
  let uBlurRadiusLocation: WebGLUniformLocation | null | undefined;
  if (effects.blur) {
    uBlurRadiusLocation = gl.getUniformLocation(program, "u_blurRadius");

    gl.uniform1f(uBlurRadiusLocation, 8.0);

    if (!uBlurRadiusLocation || !uTextureSizeLocation) {
      return new Error("No uBlurRadiusLocation or uTextureSizeLocation");
    }
  }

  // blur tint
  let uTintColorLocation: WebGLUniformLocation | null | undefined;
  if (effects.tint) {
    uTintColorLocation = gl.getUniformLocation(program, "u_tintColor");
    const tintColorVector = hexToRgb(tintColor.current);

    gl.uniform3fv(uTintColorLocation, tintColorVector);

    if (!uTintColorLocation) {
      return new Error("No uTintColorLocation");
    }
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
      "u_rightDogEarAspectRatioLocation"
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
      !uGlassesImageLocation
    ) {
      return new Error(
        "No glassesImageTexture or glassesImageAspectRatio or no uGlassesImageLocation"
      );
    }

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, glassesImageTexture);
    gl.uniform1i(uGlassesImageLocation, 3);

    gl.uniform1f(uGlassesAspectRatioLocation, glassesImageAspectRatio);
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

  gl.uniform1i(uBlurEffectLocation, effects.blur ? 1 : 0);
  gl.uniform1i(uTintEffectLocation, effects.tint ? 1 : 0);
  gl.uniform1i(uDogEarsEffectLocation, effects.dogEars ? 1 : 0);
  gl.uniform1i(uGlassesEffectLocation, effects.glasses ? 1 : 0);

  const uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  } = {
    uBlurEffectLocation: uBlurEffectLocation,
    uTintEffectLocation: uTintEffectLocation,
    uDogEarsEffectLocation: uDogEarsEffectLocation,
    uGlassesEffectLocation: uGlassesEffectLocation,
    uTextureSizeLocation: uTextureSizeLocation,
    uBlurRadiusLocation: uBlurRadiusLocation,
    uTintColorLocation: uTintColorLocation,
    uLeftDogEarImageLocation: uLeftDogEarImageLocation,
    uLeftDogEarAspectRatioLocation: uLeftDogEarAspectRatioLocation,
    uRightDogEarImageLocation: uRightDogEarImageLocation,
    uRightDogEarAspectRatioLocation: uRightDogEarAspectRatioLocation,
    uLeftEarPositionsLocation: gl.getUniformLocation(
      program,
      "u_leftEarPositions"
    ),
    uRightEarPositionsLocation: gl.getUniformLocation(
      program,
      "u_rightEarPositions"
    ),
    uLeftEarSizesLocation: gl.getUniformLocation(program, "u_leftEarSizes"),
    uRightEarSizesLocation: gl.getUniformLocation(program, "u_rightEarSizes"),
    uHeadRotationAnglesLocation: gl.getUniformLocation(
      program,
      "u_headRotationAngles"
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
    uEyesWidths: gl.getUniformLocation(program, "u_eyesWidths"),
    uGlassesAspectRatioLocation: uGlassesAspectRatioLocation,
  };

  return uniformLocations;
};

export default setUniforms;
