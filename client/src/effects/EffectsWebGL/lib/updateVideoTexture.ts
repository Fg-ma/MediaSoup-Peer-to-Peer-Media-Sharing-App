import { BaseAttributes } from "./initializeBaseAttributes";

const updateVideoTexture = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  videoTexture: WebGLTexture,
  video: HTMLVideoElement,
  videoProgram: WebGLProgram,
  videoPositionBuffer: WebGLBuffer,
  videoTexCoordBuffer: WebGLBuffer,
  baseAttributeLocations: {
    [uniform in BaseAttributes]: number | null | undefined;
  }
) => {
  if (
    baseAttributeLocations.aPositionLocation === null ||
    baseAttributeLocations.aPositionLocation === undefined ||
    baseAttributeLocations.aTexCoordLocation === null ||
    baseAttributeLocations.aTexCoordLocation === undefined
  ) {
    return;
  }

  gl.useProgram(videoProgram);

  gl.bindBuffer(gl.ARRAY_BUFFER, videoPositionBuffer);
  gl.vertexAttribPointer(
    baseAttributeLocations.aPositionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, videoTexCoordBuffer);
  gl.vertexAttribPointer(
    baseAttributeLocations.aTexCoordLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

export default updateVideoTexture;
