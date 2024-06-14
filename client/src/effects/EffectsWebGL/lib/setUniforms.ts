import { EffectTypes } from "src/context/StreamsContext";

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
  const textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  if (textureSizeLocation) {
    gl.uniform2f(textureSizeLocation, canvas.width, canvas.height);
  }

  // blur uniforms
  if (effects.blur) {
    const blurRadiusLocation = gl.getUniformLocation(program, "u_blurRadius");

    gl.uniform1f(blurRadiusLocation, 8.0);

    if (!blurRadiusLocation || !textureSizeLocation) {
      return new Error("No blurRadiusLocation or textureSizeLocation");
    }
  }

  // blur tint
  if (effects.tint) {
    const tintColorLocation = gl.getUniformLocation(program, "u_tintColor");
    const tintColorVector = hexToRgb(tintColor.current);

    gl.uniform3fv(tintColorLocation, tintColorVector);

    if (!tintColorLocation) {
      return new Error("No tintColorLocation");
    }
  }

  // blur dogEars
  if (effects.dogEars) {
    const uEarImageLeftLocation = gl.getUniformLocation(
      program,
      "u_earImageLeft"
    );
    const uEarImageRightLocation = gl.getUniformLocation(
      program,
      "u_earImageRight"
    );
    const leftEarSizeLocation = gl.getUniformLocation(program, "u_leftEarSize");
    const rightEarSizeLocation = gl.getUniformLocation(
      program,
      "u_rightEarSize"
    );

    if (leftEarSizeLocation) {
      gl.uniform2f(leftEarSizeLocation, 50, 50);
    }
    if (rightEarSizeLocation) {
      gl.uniform2f(rightEarSizeLocation, 50, 50);
    }

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
};

export default setUniforms;
