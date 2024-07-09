import TriangleShader from "./createTriangleShader";
import { Point2D, Point3D } from "./drawFaceMesh";

const updateTrianglesBuffers = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  srcTrianglesArray: [Point2D, Point2D, Point2D][],
  destTrianglesArray: [Point3D, Point3D, Point3D][],
  triangleShader: TriangleShader
) => {
  if (
    triangleShader.positionLocation === null ||
    triangleShader.texCoordLocation === null
  ) {
    return;
  }

  const positions: number[] = [];
  const texCoords: number[] = [];
  const indices: number[] = [];

  let index = 0;

  srcTrianglesArray.forEach((triangle, triangleIndex) => {
    const srcVertices: number[] = [];
    const texCoord: number[] = [];

    triangle.forEach((point) => {
      srcVertices.push(point.x, 1 - point.y, 0);
      texCoord.push(point.x, point.y);
    });

    const destTriangle = destTrianglesArray[triangleIndex];
    if (!destTriangle) {
      return;
    }
    const destVertices: number[] = [];
    destTriangle.forEach((point) => {
      // Normalize the x and y coords to be from -1 to 1
      const normalizedXCord = point.x * 2 - 1;
      const normalizedYCord = (1 - point.y) * 2 - 1;

      destVertices.push(normalizedXCord, normalizedYCord, point.z);
    });

    positions.push(...destVertices);
    texCoords.push(...texCoord);
    indices.push(index, index + 1, index + 2);
    index += 3;
  });

  // Create or reuse buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleShader.getPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(
    triangleShader.positionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleShader.getTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(
    triangleShader.texCoordLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleShader.getIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.DYNAMIC_DRAW
  );

  return indices.length;
};

export default updateTrianglesBuffers;
