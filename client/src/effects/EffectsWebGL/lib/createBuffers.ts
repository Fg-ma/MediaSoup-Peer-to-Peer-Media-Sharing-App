import { Point2D, Point3D } from "./drawFaceMesh";
import { Attributes } from "./setAttributes";

export const createBuffers = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  program: WebGLProgram
) => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  const texCoords = [0, 1, 1, 1, 0, 0, 1, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  return { positionBuffer, texCoordBuffer };
};

let buffers = {
  positionBuffer: null,
  texCoordBuffer: null,
  indexBuffer: null,
};

export const createTrianglesBuffer = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  srcTrianglesArray: [Point2D, Point2D, Point2D][],
  destTrianglesArray: [Point3D, Point3D, Point3D][],
  canvas: HTMLCanvasElement,
  attributeLocations: { [attribute in Attributes]: number | null | undefined }
) => {
  if (
    attributeLocations.aTrianglePositionLocation === undefined ||
    attributeLocations.aTrianglePositionLocation === null ||
    attributeLocations.aTriangleTexCoordLocation === undefined ||
    attributeLocations.aTriangleTexCoordLocation === null
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
      destVertices.push(point.x, 1 - point.y, point.z - 0.5);
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
    attributeLocations.aTrianglePositionLocation,
    3, // Assuming positions are 3 components (x, y, z)
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(attributeLocations.aTrianglePositionLocation);

  const texCoordBuffer = buffers.texCoordBuffer || gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(
    attributeLocations.aTriangleTexCoordLocation,
    2, // Assuming texCoords are 2 components (u, v)
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(attributeLocations.aTriangleTexCoordLocation);

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
