import { NormalizedLandmarkList } from "@mediapipe/face_mesh";
import { getTriangles } from "./getTriangles";
import { Attributes } from "./setAttributes";
import { Uniforms } from "./setUniforms";
import { createTrianglesBuffer } from "./createBuffers";

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const drawFaceMesh = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  triangleProgram: WebGLProgram,
  liveLandmarks: NormalizedLandmarkList,
  canvas: HTMLCanvasElement,
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  },
  attributeLocations: {
    [uniform in Attributes]: number | null | undefined;
  },
  triangleTexture: WebGLTexture
) => {
  // Get the triangles
  const { overlayTriangles, liveTriangles } = getTriangles(liveLandmarks);

  const loadedTrianglesBuffers = createTrianglesBuffer(
    gl,
    overlayTriangles,
    liveTriangles,
    canvas,
    attributeLocations
  );

  if (!loadedTrianglesBuffers) {
    return;
  }

  const { positionBuffer, texCoordBuffer, indexBuffer, indexCount } =
    loadedTrianglesBuffers;

  if (!positionBuffer || !texCoordBuffer || !indexBuffer) {
    return;
  }

  gl.useProgram(triangleProgram);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
  // gl.viewport(0, 0, canvas.width, canvas.height);
  // gl.clearColor(0.0, 1.0, 0.0, 0.0);
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.enable(gl.DEPTH_TEST);

  gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
  gl.disable(gl.BLEND);
};

export default drawFaceMesh;
