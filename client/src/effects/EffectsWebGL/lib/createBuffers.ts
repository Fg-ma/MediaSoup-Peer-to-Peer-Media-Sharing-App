import { BaseAttributesLocations } from "./initializeBaseAttributes";
import { TriangleAttributesLocations } from "./initializeTriangleAttributes";

const createBaseBuffers = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseProgram: WebGLProgram,
  baseAttributeLocations: {
    [baseAttributeLocation in BaseAttributesLocations]:
      | number
      | null
      | undefined;
  }
) => {
  if (
    baseAttributeLocations.aPositionLocation === null ||
    baseAttributeLocations.aPositionLocation === undefined ||
    baseAttributeLocations.aTexCoordLocation === null ||
    baseAttributeLocations.aTexCoordLocation === undefined
  ) {
    return;
  }

  gl.useProgram(baseProgram);

  const basePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, basePositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(
    baseAttributeLocations.aPositionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(baseAttributeLocations.aPositionLocation);

  const baseTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, baseTexCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(
    baseAttributeLocations.aTexCoordLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(baseAttributeLocations.aTexCoordLocation);

  return { basePositionBuffer, baseTexCoordBuffer };
};

const createTriangleBuffers = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  triangleProgram: WebGLProgram,
  triangleAttributeLocations: {
    [attribute in TriangleAttributesLocations]: number | null | undefined;
  }
) => {
  if (
    triangleAttributeLocations.aPositionLocation === null ||
    triangleAttributeLocations.aPositionLocation === undefined ||
    triangleAttributeLocations.aTexCoordLocation === null ||
    triangleAttributeLocations.aTexCoordLocation === undefined
  ) {
    return;
  }

  gl.useProgram(triangleProgram);

  const trianglePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(
    triangleAttributeLocations.aPositionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(triangleAttributeLocations.aPositionLocation);

  const triangleTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(
    triangleAttributeLocations.aTexCoordLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(triangleAttributeLocations.aTexCoordLocation);

  const triangleIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([]), gl.DYNAMIC_DRAW);

  return {
    trianglePositionBuffer,
    triangleTexCoordBuffer,
    triangleIndexBuffer,
  };
};

export { createBaseBuffers, createTriangleBuffers };
