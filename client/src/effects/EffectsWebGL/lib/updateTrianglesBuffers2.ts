import { Point2D, Point3D } from "./drawFaceMesh";
import { PointUV } from "./drawMustacheMesh";
import { TriangleAttributesLocations } from "./initializeTriangleAttributes";

const updateTrianglesBuffers2 = (
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

export default updateTrianglesBuffers2;
