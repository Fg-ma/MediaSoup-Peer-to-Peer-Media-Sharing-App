export type BaseAttributes = "aPositionLocation" | "aTexCoordLocation";

const initializeBaseAttributes = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  videoProgram: WebGLProgram
) => {
  gl.useProgram(videoProgram);

  const aPositionLocation = gl.getAttribLocation(videoProgram, "a_position");
  const aTexCoordLocation = gl.getAttribLocation(videoProgram, "a_texCoord");

  const baseAttributeLocations: {
    [attribute in BaseAttributes]: number | null | undefined;
  } = {
    aPositionLocation: aPositionLocation,
    aTexCoordLocation: aTexCoordLocation,
  };

  return baseAttributeLocations;
};

export default initializeBaseAttributes;
