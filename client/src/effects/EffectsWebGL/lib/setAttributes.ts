import { EffectTypes } from "src/context/StreamsContext";

export type Attributes =
  | "aVideoPositionLocation"
  | "aVideoTexCoordLocation"
  | "aTrianglePositionLocation"
  | "aTriangleTexCoordLocation";

const setAttributes = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  videoProgram: WebGLProgram,
  triangleProgram: WebGLProgram
) => {
  gl.useProgram(videoProgram);

  const aVideoPositionLocation = gl.getAttribLocation(
    videoProgram,
    "a_position"
  );
  const aVideoTexCoordLocation = gl.getAttribLocation(
    videoProgram,
    "a_texCoord"
  );

  gl.useProgram(triangleProgram);

  const aTrianglePositionLocation = gl.getAttribLocation(
    triangleProgram,
    "a_position"
  );
  const aTriangleTexCoordLocation = gl.getAttribLocation(
    triangleProgram,
    "a_texCoord"
  );

  const attributeLocations: {
    [attribute in Attributes]: number | null | undefined;
  } = {
    aVideoPositionLocation: aVideoPositionLocation,
    aVideoTexCoordLocation: aVideoTexCoordLocation,
    aTrianglePositionLocation: aTrianglePositionLocation,
    aTriangleTexCoordLocation: aTriangleTexCoordLocation,
  };

  return attributeLocations;
};

export default setAttributes;
