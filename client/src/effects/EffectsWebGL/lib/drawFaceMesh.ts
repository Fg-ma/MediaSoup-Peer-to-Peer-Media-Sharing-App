import { NormalizedLandmarkList } from "@mediapipe/face_mesh";
import { getTriangles } from "./getTriangles";
import { TriangleAttributesLocations } from "./initializeTriangleAttributes";
import updateTrianglesBuffers from "./updateTrianglesBuffers";
import { uvPoints } from "./uvPoints";

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
  triangleAttributeLocations: {
    [uniform in TriangleAttributesLocations]: number | null | undefined;
  },
  trianglePositionBuffer: WebGLBuffer,
  triangleTexCoordBuffer: WebGLBuffer,
  triangleIndexBuffer: WebGLBuffer
) => {
  gl.useProgram(triangleProgram);

  // Get the triangles
  const { overlayTriangles, liveTriangles } = getTriangles(
    liveLandmarks,
    uvPoints
  );

  const indexCount = updateTrianglesBuffers(
    gl,
    overlayTriangles,
    liveTriangles,
    triangleAttributeLocations,
    trianglePositionBuffer,
    triangleTexCoordBuffer,
    triangleIndexBuffer
  );

  if (!indexCount) {
    return;
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Draw the mesh
  gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);

  gl.disable(gl.BLEND);
};

export default drawFaceMesh;
