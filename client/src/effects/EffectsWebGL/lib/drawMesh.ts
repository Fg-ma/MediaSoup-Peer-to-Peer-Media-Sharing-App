import { Attributes } from "./setAttributes";
import { Uniforms } from "./setUniforms";

const drawMesh = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  triangleProgram: WebGLProgram,
  triangleTexture: WebGLTexture,
  positionBuffer: WebGLBuffer,
  texCoordBuffer: WebGLBuffer,
  indexBuffer: WebGLBuffer,
  indexCount: number,
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  },
  attributeLocations: { [attribute in Attributes]: number | null | undefined }
) => {
  gl.useProgram(triangleProgram);

  // Bind position buffer
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // gl.vertexAttribPointer(
  //   attributeLocations.aTrianglePositionLocation!,
  //   3,
  //   gl.FLOAT,
  //   false,
  //   0,
  //   0
  // );
  // gl.enableVertexAttribArray(attributeLocations.aTrianglePositionLocation!);

  // Bind texCoord buffer
  // gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  // gl.vertexAttribPointer(
  //   attributeLocations.aTriangleTexCoordLocation!,
  //   2,
  //   gl.FLOAT,
  //   false,
  //   0,
  //   0
  // );
  // gl.enableVertexAttribArray(attributeLocations.aTriangleTexCoordLocation!);

  // Bind index buffer
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, triangleTexture);
  gl.uniform1i(uniformLocations.uTriangleTextureLocation!, 0);

  // Draw the mesh
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 1.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
};

export default drawMesh;
