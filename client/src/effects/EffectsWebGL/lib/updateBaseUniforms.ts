import { BaseShader } from "./createBaseShader";
import { getNextTexturePosition } from "./handleTexturePosition";

let currentPositionsOffsetsTexturePosition: number | undefined;

export const updateCurrentPositionsOffsetsTexturePosition = (
  position: number | undefined
) => {
  currentPositionsOffsetsTexturePosition = position;
};

let currentWidthsHeadRotationAnglesTexturePosition: number | undefined;

export const updateCurrentWidthsHeadRotationAnglesTexturePosition = (
  position: number | undefined
) => {
  currentWidthsHeadRotationAnglesTexturePosition = position;
};

const maxFaces = 8;
const maxPositions = 5;
const maxWidths = 4;

const createDataTexture = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  dataSet1: [number, number][][],
  dataSet2: [number, number][][],
  firstMaxDataDimension: number,
  secondMaxDataDimension: number,
  texturePosition?: number
) => {
  const data = new Float32Array(
    firstMaxDataDimension * secondMaxDataDimension * 4
  );

  let index = 0;
  for (let i = 0; i < secondMaxDataDimension; i++) {
    for (let j = 0; j < firstMaxDataDimension; j++) {
      if (dataSet1[i] && dataSet1[i][j] && dataSet2[i] && dataSet2[i][j]) {
        data[index++] = dataSet1[i][j][0]; // R
        data[index++] = dataSet1[i][j][1]; // G
        data[index++] = dataSet2[i][j][0]; // B
        data[index++] = dataSet2[i][j][1]; // A
      } else if (dataSet1[i] && dataSet1[i][j]) {
        data[index++] = dataSet1[i][j][0]; // R
        data[index++] = dataSet1[i][j][1]; // G
        data[index++] = 0; // B
        data[index++] = 0; // A
      } else if (dataSet2[i] && dataSet2[i][j]) {
        data[index++] = 0; // R
        data[index++] = 0; // G
        data[index++] = dataSet2[i][j][0]; // B
        data[index++] = dataSet2[i][j][1]; // A
      } else {
        data[index++] = 0;
        data[index++] = 0;
        data[index++] = 0;
        data[index++] = 0;
      }
    }
  }

  const texture = gl.createTexture();
  let position: number | Error;
  if (!texturePosition) {
    position = getNextTexturePosition();
  } else {
    position = texturePosition;
  }

  if (position instanceof Error) {
    return position;
  }

  gl.activeTexture(gl.TEXTURE0 + position);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  if (gl instanceof WebGL2RenderingContext) {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      firstMaxDataDimension,
      secondMaxDataDimension,
      0,
      gl.RGBA,
      gl.FLOAT,
      data
    );
  } else {
    const ext = gl.getExtension("OES_texture_float");
    if (!ext) {
      throw new Error("OES_texture_float not supported");
    }
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      firstMaxDataDimension,
      secondMaxDataDimension,
      0,
      gl.RGBA,
      gl.FLOAT,
      data
    );
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return position;
};

const createDataTexture2 = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  dataSet1: number[][],
  dataSet2: number[],
  firstMaxDataDimension: number,
  secondMaxDataDimension: number,
  texturePosition?: number
) => {
  const data = new Float32Array(
    firstMaxDataDimension * secondMaxDataDimension * 4
  );

  let index = 0;
  for (let i = 0; i < secondMaxDataDimension; i++) {
    for (let j = 0; j < firstMaxDataDimension; j++) {
      if (i === 0 && dataSet1[i] && dataSet1[i][j] && dataSet2[j]) {
        data[index++] = dataSet1[i][j]; // R
        data[index++] = dataSet2[j]; // G
        data[index++] = 0; // B
        data[index++] = 0; // A
      } else if (dataSet1[i] && dataSet1[i][j]) {
        data[index++] = dataSet1[i][j]; // R
        data[index++] = 0; // G
        data[index++] = 0; // B
        data[index++] = 0; // A
      } else if (i === 0 && dataSet2[j]) {
        data[index++] = 0; // R
        data[index++] = dataSet2[j]; // G
        data[index++] = 0; // B
        data[index++] = 0; // A
      } else {
        data[index++] = 0;
        data[index++] = 0;
        data[index++] = 0;
        data[index++] = 0;
      }
    }
  }

  const texture = gl.createTexture();
  let position: number | Error;
  if (!texturePosition) {
    position = getNextTexturePosition();
  } else {
    position = texturePosition;
  }

  if (position instanceof Error) {
    return position;
  }

  gl.activeTexture(gl.TEXTURE0 + position);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  if (gl instanceof WebGL2RenderingContext) {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      firstMaxDataDimension,
      secondMaxDataDimension,
      0,
      gl.RGBA,
      gl.FLOAT,
      data
    );
  } else {
    const ext = gl.getExtension("OES_texture_float");
    if (!ext) {
      throw new Error("OES_texture_float not supported");
    }
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      firstMaxDataDimension,
      secondMaxDataDimension,
      0,
      gl.RGBA,
      gl.FLOAT,
      data
    );
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return position;
};

const updateBaseUniforms = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseShader: BaseShader,
  faceCount: number,
  headRotationAngles: number[],
  leftEarWidths: number[],
  rightEarWidths: number[],
  leftEyePositions: [number, number][],
  rightEyePositions: [number, number][],
  eyesCenterPositions: [number, number][],
  eyesWidths: number[],
  chinPositions: [number, number][],
  chinWidths: number[],
  nosePositions: [number, number][],
  earsImageOffset: [number, number][],
  beardImageOffset: [number, number][],
  mustacheImageOffset: [number, number][]
) => {
  baseShader.use();

  gl.uniform1i(baseShader.faceCountLocation, faceCount);

  const positionsOffsetsTexturePosition = createDataTexture(
    gl,
    [
      leftEyePositions,
      rightEyePositions,
      eyesCenterPositions,
      chinPositions,
      nosePositions,
    ],
    [
      earsImageOffset,
      earsImageOffset,
      [],
      beardImageOffset,
      mustacheImageOffset,
    ],
    maxFaces,
    maxPositions,
    currentPositionsOffsetsTexturePosition
  );
  if (positionsOffsetsTexturePosition instanceof Error) {
    return positionsOffsetsTexturePosition;
  }
  currentPositionsOffsetsTexturePosition = positionsOffsetsTexturePosition;

  gl.uniform1i(
    baseShader.positionsOffsetsTextureLocation,
    positionsOffsetsTexturePosition
  );

  const widthsHeadRotationAnglesTexturePosition = createDataTexture2(
    gl,
    [leftEarWidths, rightEarWidths, eyesWidths, chinWidths],
    headRotationAngles,
    maxFaces,
    maxWidths,
    currentWidthsHeadRotationAnglesTexturePosition
  );
  if (widthsHeadRotationAnglesTexturePosition instanceof Error) {
    return widthsHeadRotationAnglesTexturePosition;
  }
  currentWidthsHeadRotationAnglesTexturePosition =
    widthsHeadRotationAnglesTexturePosition;

  gl.uniform1i(
    baseShader.widthsHeadRotationAnglesTextureLocation,
    widthsHeadRotationAnglesTexturePosition
  );
};

export default updateBaseUniforms;
