import { Point2D, Point3D } from "./drawFaceMesh";
import { PointUV } from "./drawMustacheMesh";
import { TriangleAttributesLocations } from "./initializeTriangleAttributes";

const updateTrianglesBuffers2 = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  srcTrianglesArray: [PointUV, PointUV, PointUV][],
  destTrianglesArray: [Point3D, Point3D, Point3D][],
  triangleAttributeLocations: {
    [attribute in TriangleAttributesLocations]: number | null | undefined;
  },
  trianglePositionBuffer: WebGLBuffer,
  triangleTexCoordBuffer: WebGLBuffer,
  triangleIndexBuffer: WebGLBuffer
) => {
  if (
    triangleAttributeLocations.aPositionLocation === undefined ||
    triangleAttributeLocations.aPositionLocation === null ||
    triangleAttributeLocations.aTexCoordLocation === undefined ||
    triangleAttributeLocations.aTexCoordLocation === null
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
      srcVertices.push(point.u, point.v, 0);
      texCoord.push(point.u, point.v);
    });

    const destTriangle = destTrianglesArray[triangleIndex];
    if (!destTriangle) {
      return;
    }
    const destVertices: number[] = [];
    destTriangle.forEach((point) => {
      // Normalize the x and y coords to be from -1 to 1
      const normalizedXCord = point.x * 2 - 1;
      const normalizedYCord = point.y * 2 - 1;

      destVertices.push(normalizedXCord, normalizedYCord, point.z);
    });

    positions.push(...destVertices);
    texCoords.push(...texCoord);
    indices.push(index, index + 1, index + 2);
    index += 3;
  });

  console.log(positions, texCoords, indices);

  // Create or reuse buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(
    triangleAttributeLocations.aPositionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(
    triangleAttributeLocations.aTexCoordLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.DYNAMIC_DRAW
  );

  return indices.length;
};

const updateTrianglesBuffers3 = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  srcTrianglesArray: number[],
  destTrianglesArray: number[],
  triangleAttributeLocations: {
    [attribute in TriangleAttributesLocations]: number | null | undefined;
  },
  trianglePositionBuffer: WebGLBuffer,
  triangleTexCoordBuffer: WebGLBuffer,
  triangleIndexBuffer: WebGLBuffer
) => {
  if (
    triangleAttributeLocations.aPositionLocation === undefined ||
    triangleAttributeLocations.aPositionLocation === null ||
    triangleAttributeLocations.aTexCoordLocation === undefined ||
    triangleAttributeLocations.aTexCoordLocation === null
  ) {
    return;
  }

  // Create or reuse buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(destTrianglesArray),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(
    triangleAttributeLocations.aPositionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleTexCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(srcTrianglesArray),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(
    triangleAttributeLocations.aTexCoordLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  let indices = [];
  for (let i = 0; i < srcTrianglesArray.length / 2; i++) {
    indices.push(i);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  return indices.length;
};

export { updateTrianglesBuffers2, updateTrianglesBuffers3 };
