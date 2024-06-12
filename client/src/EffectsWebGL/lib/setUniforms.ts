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
    blur?: boolean | undefined;
    tint?: boolean | undefined;
  },
  tintColor: React.MutableRefObject<string>
) => {
  const blurRadiusLocation = gl.getUniformLocation(program, "u_blurRadius");
  const textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");

  if (effects.blur && (!blurRadiusLocation || !textureSizeLocation)) {
    return new Error("No blurRadiusLocation or textureSizeLocation");
  }

  if (blurRadiusLocation) {
    gl.uniform1f(blurRadiusLocation, 8.0);
  }
  if (textureSizeLocation) {
    gl.uniform2f(textureSizeLocation, canvas.width, canvas.height);
  }

  const tintColorLocation = gl.getUniformLocation(program, "u_tintColor");
  const tintColorVector = hexToRgb(tintColor.current);

  if (effects.tint && !tintColorLocation) {
    return new Error("No tintColorLocation");
  }

  if (tintColorLocation) {
    gl.uniform3fv(tintColorLocation, tintColorVector);
  }

  const uBlurEffectLocation = gl.getUniformLocation(program, "u_blurEffect");
  const uTintEffectLocation = gl.getUniformLocation(program, "u_tintEffect");

  gl.uniform1i(uBlurEffectLocation, effects.blur ? 1 : 0);
  gl.uniform1i(uTintEffectLocation, effects.tint ? 1 : 0);
};

export default setUniforms;
