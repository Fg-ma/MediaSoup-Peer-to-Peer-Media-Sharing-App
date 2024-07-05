import { TriangleAttributesLocations } from "./initializeTriangleAttributes";
import updateTrianglesBuffers2 from "./updateTrianglesBuffers2";
import mustaches from "../../../../public/3DAssests/mustaches/mustacheData.json";

export interface PointUV {
  u: number;
  v: number;
}

export const drawMustacheMesh = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  triangleProgram: WebGLProgram,
  triangleAttributeLocations: {
    [uniform in TriangleAttributesLocations]: number | null | undefined;
  },
  trianglePositionBuffer: WebGLBuffer,
  triangleTexCoordBuffer: WebGLBuffer,
  triangleIndexBuffer: WebGLBuffer
) => {
  gl.useProgram(triangleProgram);

  const indexCount = updateTrianglesBuffers2(
    gl,
    mustaches.uv_faces,
    mustaches.vertex_faces,
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

export default drawMustacheMesh;
