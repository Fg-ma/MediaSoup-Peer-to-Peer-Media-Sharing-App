import { EffectTypes } from "src/context/StreamsContext";

export type Uniforms =
  | "uBlurEffectLocation"
  | "uTintEffectLocation"
  | "uDogEarsEffectLocation"
  | "uTextureSizeLocation"
  | "uBlurRadiusLocation"
  | "uTintColorLocation"
  | "uEarImageLeftLocation"
  | "uEarImageRightLocation"
  | "uLeftEarPositionsLocation"
  | "uRightEarPositionsLocation"
  | "uLeftEarSizesLocation"
  | "uRightEarSizesLocation"
  | "uHeadRotationAnglesLocation"
  | "uFaceCountLocation";

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
  earImageLeftTexture: WebGLTexture | null | undefined,
  earImageRightTexture: WebGLTexture | null | undefined
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

  // blur dogEars
  let uEarImageLeftLocation: WebGLUniformLocation | null | undefined;
  let uEarImageRightLocation: WebGLUniformLocation | null | undefined;
  if (effects.dogEars) {
    uEarImageLeftLocation = gl.getUniformLocation(program, "u_earImageLeft");
    uEarImageRightLocation = gl.getUniformLocation(program, "u_earImageRight");

    if (!earImageLeftTexture || !earImageRightTexture) {
      return new Error("No earImageLeft or earImageRight");
    }

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, earImageLeftTexture);
    gl.uniform1i(uEarImageLeftLocation, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, earImageRightTexture);
    gl.uniform1i(uEarImageRightLocation, 2);
  }

  const uBlurEffectLocation = gl.getUniformLocation(program, "u_blurEffect");
  const uTintEffectLocation = gl.getUniformLocation(program, "u_tintEffect");
  const uDogEarsEffectLocation = gl.getUniformLocation(program, "u_dogEars");

  gl.uniform1i(uBlurEffectLocation, effects.blur ? 1 : 0);
  gl.uniform1i(uTintEffectLocation, effects.tint ? 1 : 0);
  gl.uniform1i(uDogEarsEffectLocation, effects.dogEars ? 1 : 0);

  const uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  } = {
    uBlurEffectLocation: uBlurEffectLocation,
    uTintEffectLocation: uTintEffectLocation,
    uDogEarsEffectLocation: uDogEarsEffectLocation,
    uTextureSizeLocation: uTextureSizeLocation,
    uBlurRadiusLocation: uBlurRadiusLocation,
    uTintColorLocation: uTintColorLocation,
    uEarImageLeftLocation: uEarImageLeftLocation,
    uEarImageRightLocation: uEarImageRightLocation,
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
  };

  return uniformLocations;
};

export default setUniforms;
