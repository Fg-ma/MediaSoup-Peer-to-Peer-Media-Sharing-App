import { Attributes } from "./setAttributes";
import { Uniforms } from "./setUniforms";

const updateVideoTexture = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  updateVideoTexture: WebGLTexture,
  video: HTMLVideoElement,
  videoProgram: WebGLProgram,
  videoPositionBuffer: WebGLBuffer,
  videoTexCoordBuffer: WebGLBuffer,
  videoTexture: WebGLTexture,
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  },
  attributeLocations: {
    [uniform in Attributes]: number | null | undefined;
  }
) => {
  gl.useProgram(videoProgram);

  // gl.activeTexture(gl.TEXTURE0);
  // gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  // gl.uniform1i(uniformLocations.uImageLocation!, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, videoPositionBuffer);
  gl.vertexAttribPointer(
    attributeLocations.aVideoPositionLocation!,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  // gl.enableVertexAttribArray(attributeLocations.aVideoPositionLocation!);

  gl.bindBuffer(gl.ARRAY_BUFFER, videoTexCoordBuffer);
  gl.vertexAttribPointer(
    attributeLocations.aVideoTexCoordLocation!,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  // gl.enableVertexAttribArray(attributeLocations.aVideoTexCoordLocation!);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, updateVideoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

export default updateVideoTexture;
