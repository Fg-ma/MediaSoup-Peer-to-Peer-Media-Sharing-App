import { NormalizedLandmarkList } from "@mediapipe/face_mesh";
import { getTriangles } from "./getTriangles";
import { TriangleAttributesLocations } from "./initializeTriangleAttributes";
import updateTrianglesBuffers from "./updateTrianglesBuffers";
import { TriangleUniformsLocations } from "./initializeTriangleUniforms";

interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface PointUV {
  u: number;
  v: number;
}

const extractVerticessAndUVsFromJSONFile = async (
  url: string
): Promise<{ vertices: Point3D[]; uvs: PointUV[] }> => {
  // Fetch the JSON file
  const response = await fetch(url);

  // Parse the JSON content
  const jsonObject = await response.json();

  // Extract the arrays from the object
  const vertices: Point3D[] = jsonObject.vertices;
  const uvs: PointUV[] = jsonObject.uvs;

  // Return the extracted arrays
  return { vertices, uvs };
};

export const drawMustacheMesh = (
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

  // Example usage
  const fileUrl = "/3DAssets/mustaches/mustacheData.json";
  extractVerticessAndUVsFromJSONFile(fileUrl).then(({ vertices, uvs }) => {
    console.log(vertices);
    console.log(uvs);
  });

  // Get the triangles
  // const { overlayTriangles, liveTriangles } = getTriangles(liveLandmarks);

  // const indexCount = updateTrianglesBuffers(
  //   gl,
  //   overlayTriangles,
  //   liveTriangles,
  //   triangleAttributeLocations,
  //   trianglePositionBuffer,
  //   triangleTexCoordBuffer,
  //   triangleIndexBuffer
  // );

  // if (!indexCount) {
  //   return;
  // }

  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // // Draw the mesh
  // gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);

  // gl.disable(gl.BLEND);
};

export default drawMustacheMesh;
