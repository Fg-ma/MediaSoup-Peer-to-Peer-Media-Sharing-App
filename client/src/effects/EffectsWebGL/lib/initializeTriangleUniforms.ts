import { EffectTypes } from "src/context/StreamsContext";

export type TriangleUniforms = "uTriangleTextureLocation";

const initializeTriangleUniforms = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  triangleProgram: WebGLProgram,
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  triangleImageTexture: WebGLTexture | null | undefined
) => {
  gl.useProgram(triangleProgram);

  const uTriangleTextureLocation = gl.getUniformLocation(
    triangleProgram,
    "u_triangleTexture"
  );
  if (effects.faceMask) {
    if (!triangleImageTexture || !uTriangleTextureLocation) {
      return new Error("No triangleImageTexture or uTriangleTextureLocation");
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, triangleImageTexture);
    gl.uniform1i(uTriangleTextureLocation, 3);
  }

  const uniformLocations: {
    [uniform in TriangleUniforms]: WebGLUniformLocation | null | undefined;
  } = {
    uTriangleTextureLocation: uTriangleTextureLocation,
  };

  return uniformLocations;
};

export default initializeTriangleUniforms;
