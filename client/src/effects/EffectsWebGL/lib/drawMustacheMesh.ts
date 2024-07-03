import { NormalizedLandmarkList } from "@mediapipe/face_mesh";
import { getTriangles } from "./getTriangles";
import { TriangleAttributesLocations } from "./initializeTriangleAttributes";
import {
  updateTrianglesBuffers2,
  updateTrianglesBuffers3,
} from "./updateTrianglesBuffers2";
import { TriangleUniformsLocations } from "./initializeTriangleUniforms";
import mustaches from "../../../../public/3DAssests/mustaches/mustacheData.json";
import obj from "../../../../public/3DAssests/mustaches/mustache.obj";

interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface PointUV {
  u: number;
  v: number;
}

const parseOBJ = (
  objData: string
): {
  vertices: { x: number; y: number; z: number }[];
  normals: { nx: number; ny: number; nz: number }[];
  uvs: { u: number; v: number }[];
  faces: {
    vertices: number[];
    normals: number[];
    uvs: number[];
  }[];
} => {
  const vertices: { x: number; y: number; z: number }[] = [];
  const normals: { nx: number; ny: number; nz: number }[] = [];
  const uvs: { u: number; v: number }[] = [];
  const faces: {
    vertices: number[];
    normals: number[];
    uvs: number[];
  }[] = [];

  // Split OBJ data into lines
  const lines = objData.split("\n");

  // Process each line
  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith("v ")) {
      // Vertex
      const parts = line.split(/\s+/);
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const z = parseFloat(parts[3]);
      vertices.push({ x, y, z });
    } else if (line.startsWith("vn ")) {
      // Normal
      const parts = line.split(/\s+/);
      const nx = parseFloat(parts[1]);
      const ny = parseFloat(parts[2]);
      const nz = parseFloat(parts[3]);
      normals.push({ nx, ny, nz });
    } else if (line.startsWith("vt ")) {
      // UV
      const parts = line.split(/\s+/);
      const u = parseFloat(parts[1]);
      const v = parseFloat(parts[2]);
      uvs.push({ u, v });
    } else if (line.startsWith("f ")) {
      // Face
      const parts = line.split(/\s+/);
      const faceVertices = [];
      const faceNormals = [];
      const faceUVs = [];

      for (let i = 1; i < parts.length; i++) {
        const indices = parts[i].split("/");
        const vertexIndex = parseInt(indices[0]) - 1; // OBJ indices are 1-based
        faceVertices.push(vertexIndex);

        if (indices.length > 1 && indices[1].length > 0) {
          const uvIndex = parseInt(indices[1]) - 1;
          faceUVs.push(uvIndex);
        }

        if (indices.length > 2 && indices[2].length > 0) {
          const normalIndex = parseInt(indices[2]) - 1;
          faceNormals.push(normalIndex);
        }
      }

      faces.push({
        vertices: faceVertices,
        normals: faceNormals,
        uvs: faceUVs,
      });
    }
  });

  // Example output
  console.log("Vertices:", vertices);
  console.log("Normals:", normals);
  console.log("UVs:", uvs);
  console.log("Faces:", faces);

  return { vertices, normals, uvs, faces };
};

function scaleVerticesUniformly(
  vertices: { x: number; y: number; z: number }[]
) {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  // Find min and max for each component
  vertices.forEach((vertex) => {
    if (vertex.x < minX) minX = vertex.x;
    if (vertex.x > maxX) maxX = vertex.x;
    if (vertex.y < minY) minY = vertex.y;
    if (vertex.y > maxY) maxY = vertex.y;
    if (vertex.z < minZ) minZ = vertex.z;
    if (vertex.z > maxZ) maxZ = vertex.z;
  });

  // Find the range of each component
  let rangeX = maxX - minX;
  let rangeY = maxY - minY;
  let rangeZ = maxZ - minZ;

  // Find the overall scale factor to fit within [0.25, 0.75]
  let scaleFactor = 0.5 / Math.max(rangeX, rangeY, rangeZ);

  // Scale and shift each vertex uniformly
  vertices.forEach((vertex) => {
    vertex.x = (vertex.x - minX) * scaleFactor + 0.25;
    vertex.y = (vertex.y - minY) * scaleFactor + 0.25;
    vertex.z = (vertex.z - minZ) * scaleFactor + 0.25;
  });

  return vertices;
}

function transformArray(arr: number[]) {
  // Create a new array to store the transformed values
  let transformedArray: number[] = [];

  // Loop through the original array
  for (let i = 0; i < arr.length; i++) {
    // Check if the current index is even or odd (0-based index)
    if (i % 2 === 1) {
      // Transform the value (1 - current value) and push to the new array
      transformedArray.push(1 - arr[i]);
    } else {
      // If the index is even, just push the value as is
      transformedArray.push(arr[i]);
    }
  }

  // Return the transformed array
  return transformedArray;
}

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

  const indexCount = updateTrianglesBuffers3(
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
