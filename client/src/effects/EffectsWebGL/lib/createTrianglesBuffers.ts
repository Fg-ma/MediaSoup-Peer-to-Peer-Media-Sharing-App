import { Point2D, Point3D } from "./drawFaceMesh";
import { TriangleAttributes } from "./initializeTriangleAttributes";

let buffers = {
  positionBuffer: null,
  texCoordBuffer: null,
  indexBuffer: null,
};

const createTrianglesBuffers = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  srcTrianglesArray: [Point2D, Point2D, Point2D][],
  destTrianglesArray: [Point3D, Point3D, Point3D][],
  attributeLocations: {
    [attribute in TriangleAttributes]: number | null | undefined;
  }
) => {
  if (
    attributeLocations.aPositionLocation === undefined ||
    attributeLocations.aPositionLocation === null ||
    attributeLocations.aTexCoordLocation === undefined ||
    attributeLocations.aTexCoordLocation === null
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
  const positionBuffer = buffers.positionBuffer || gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(
    attributeLocations.aPositionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(attributeLocations.aPositionLocation);

  const texCoordBuffer = buffers.texCoordBuffer || gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(
    attributeLocations.aTexCoordLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(attributeLocations.aTexCoordLocation);

  const indexBuffer = buffers.indexBuffer || gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.DYNAMIC_DRAW
  );

  return {
    positionBuffer,
    texCoordBuffer,
    indexBuffer,
    indexCount: indices.length,
  };
};

export default createTrianglesBuffers;
