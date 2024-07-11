import updateTrianglesBuffers2 from "./updateTrianglesBuffers2";
import TriangleShader from "./TriangleShader";
import mustaches from "../../../../public/3DAssests/mustaches/mustacheData.json";

export interface PointUV {
  u: number;
  v: number;
}

export const drawMustacheMesh = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  triangleShader: TriangleShader
) => {
  triangleShader.use();

  const indexCount = updateTrianglesBuffers2(
    gl,
    mustaches.uv_faces,
    mustaches.vertex_faces,
    triangleShader
  );

  if (!indexCount) {
    return;
  }

  // Draw the mesh
  gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
};

export default drawMustacheMesh;
