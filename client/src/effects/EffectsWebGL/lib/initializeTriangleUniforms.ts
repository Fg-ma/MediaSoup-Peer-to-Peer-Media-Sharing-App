import { EffectTypes } from "src/context/StreamsContext";
import bindTexture from "./bindTexture";

export type TriangleUniformsLocations = "uTriangleTextureLocation";

const initializeTriangleUniforms = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  triangleProgram: WebGLProgram,
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  triangleTexture: WebGLTexture | null | undefined
) => {
  gl.useProgram(triangleProgram);

  const uTriangleTextureLocation = gl.getUniformLocation(
    triangleProgram,
    "u_triangleTexture"
  );
  if (effects.faceMask) {
    if (!triangleTexture || !uTriangleTextureLocation) {
      return new Error("No triangleTexture or uTriangleTextureLocation");
    }

    bindTexture(gl, triangleTexture, uTriangleTextureLocation);
  }

  const uniformLocations: {
    [uniform in TriangleUniformsLocations]:
      | WebGLUniformLocation
      | null
      | undefined;
  } = {
    uTriangleTextureLocation: uTriangleTextureLocation,
  };

  return uniformLocations;
};

export default initializeTriangleUniforms;
