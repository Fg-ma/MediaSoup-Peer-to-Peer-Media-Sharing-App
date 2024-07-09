import TriangleShader from "./createTriangleShader";

const updateTrianglesBuffers2 = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  srcTrianglesArray: number[],
  destTrianglesArray: number[],
  triangleShader: TriangleShader
) => {
  if (
    triangleShader.positionLocation === null ||
    triangleShader.texCoordLocation === null
  ) {
    return;
  }

  // Create or reuse buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleShader.getPositionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(destTrianglesArray),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(
    triangleShader.positionLocation,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleShader.getTexCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(srcTrianglesArray),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(
    triangleShader.texCoordLocation,
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

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleShader.getIndexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  return indices.length;
};

export default updateTrianglesBuffers2;
