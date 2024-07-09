import { NormalizedLandmarkList } from "@mediapipe/face_mesh";
import { getTriangles } from "./getTriangles";
import updateTrianglesBuffers from "./updateTrianglesBuffers";
import { uvPoints } from "./uvPoints";
import TriangleShader from "./createTriangleShader";

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
  liveLandmarks: NormalizedLandmarkList,
  triangleShader: TriangleShader
) => {
  triangleShader.use();

  // Get the triangles
  const { overlayTriangles, liveTriangles } = getTriangles(
    liveLandmarks,
    uvPoints
  );

  const indexCount = updateTrianglesBuffers(
    gl,
    overlayTriangles,
    liveTriangles,
    triangleShader
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
