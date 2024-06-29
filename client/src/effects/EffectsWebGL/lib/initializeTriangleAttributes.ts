export type TriangleAttributes = "aPositionLocation" | "aTexCoordLocation";

const initializeTriangleAttributes = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  triangleProgram: WebGLProgram
) => {
  gl.useProgram(triangleProgram);

  const aPositionLocation = gl.getAttribLocation(triangleProgram, "a_position");
  const aTexCoordLocation = gl.getAttribLocation(triangleProgram, "a_texCoord");

  const triangleAttributeLocations: {
    [attribute in TriangleAttributes]: number | null | undefined;
  } = {
    aPositionLocation: aPositionLocation,
    aTexCoordLocation: aTexCoordLocation,
  };

  return triangleAttributeLocations;
};

export default initializeTriangleAttributes;
