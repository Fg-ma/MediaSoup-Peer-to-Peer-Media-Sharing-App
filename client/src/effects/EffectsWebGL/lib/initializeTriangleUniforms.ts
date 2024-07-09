import { EffectTypes } from "src/context/StreamsContext";
import bindTexture from "./bindTexture";
import TriangleShader from "./createTriangleShader";

const initializeTriangleUniforms = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  triangleShader: TriangleShader,
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  triangleTexture: WebGLTexture | null | undefined
) => {
  triangleShader.use();

  if (effects.faceMask) {
    if (!triangleTexture) {
      return new Error("No triangleTexture");
    }

    let triangleTexturePosition = bindTexture(gl, triangleTexture);
    if (triangleTexturePosition instanceof Error) {
      return triangleTexturePosition;
    }

    gl.uniform1i(
      triangleShader.triangleTextureLocation,
      triangleTexturePosition
    );
  }
};

export default initializeTriangleUniforms;
