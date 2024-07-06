import flattenArray from "./flattenArray";
import { FaceLandmarks } from "../handleEffectWebGL";
import {
  BaseUniformsLocations,
  BaseUniformsLocations2,
} from "./initializeBaseUniforms";
import { EffectTypes } from "src/context/StreamsContext";
import { bindTexture2 } from "./bindTexture";
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

const updateBaseUniforms = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseProgram: WebGLProgram,
  baseUniformLocations: {
    [uniform in BaseUniformsLocations]: WebGLUniformLocation | null | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  faceCount: number,
  headRotationAngles: number[],
  leftEarPositions: number[][],
  rightEarPositions: number[][],
  leftEarWidths: number[],
  rightEarWidths: number[],
  leftEyePositions: number[][],
  rightEyePositions: number[][],
  eyesCenterPositions: number[][],
  eyesWidths: number[],
  chinPositions: number[][],
  chinWidths: number[],
  nosePositions: number[][],
  earsImageOffset: number[][],
  beardImageOffset: number[][],
  mustacheImageOffset: number[][]
) => {
  gl.useProgram(baseProgram);

  if (baseUniformLocations.uFaceCountLocation) {
    gl.uniform1i(baseUniformLocations.uFaceCountLocation, faceCount);
  }
  if (
    baseUniformLocations.uHeadRotationAnglesLocation &&
    faceLandmarks.headRotationAngles
  ) {
    gl.uniform1fv(
      baseUniformLocations.uHeadRotationAnglesLocation,
      new Float32Array(headRotationAngles)
    );
  }
  if (baseUniformLocations.uLeftEarPositionsLocation) {
    gl.uniform2fv(
      baseUniformLocations.uLeftEarPositionsLocation,
      flattenArray(leftEarPositions, maxFaces)
    );
  }
  if (baseUniformLocations.uRightEarPositionsLocation) {
    gl.uniform2fv(
      baseUniformLocations.uRightEarPositionsLocation,
      flattenArray(rightEarPositions, maxFaces)
    );
  }
  if (
    baseUniformLocations.uLeftEarWidthsLocation &&
    faceLandmarks.leftEarWidths
  ) {
    gl.uniform1fv(
      baseUniformLocations.uLeftEarWidthsLocation,
      new Float32Array(leftEarWidths)
    );
  }
  if (
    baseUniformLocations.uRightEarWidthsLocation &&
    faceLandmarks.rightEarWidths
  ) {
    gl.uniform1fv(
      baseUniformLocations.uRightEarWidthsLocation,
      new Float32Array(rightEarWidths)
    );
  }
  if (
    baseUniformLocations.uLeftEyePositionsLocation &&
    faceLandmarks.leftEyePositions
  ) {
    gl.uniform2fv(
      baseUniformLocations.uLeftEyePositionsLocation,
      flattenArray(leftEyePositions, maxFaces)
    );
  }
  if (
    baseUniformLocations.uRightEyePositionsLocation &&
    faceLandmarks.rightEyePositions
  ) {
    gl.uniform2fv(
      baseUniformLocations.uRightEyePositionsLocation,
      flattenArray(rightEyePositions, maxFaces)
    );
  }
  if (
    baseUniformLocations.uEyesCentersLocation &&
    faceLandmarks.eyesCenterPositions
  ) {
    gl.uniform2fv(
      baseUniformLocations.uEyesCentersLocation,
      flattenArray(eyesCenterPositions, maxFaces)
    );
  }
  if (baseUniformLocations.uEyesWidthsLocation && faceLandmarks.eyesWidths) {
    gl.uniform1fv(
      baseUniformLocations.uEyesWidthsLocation,
      new Float32Array(eyesWidths)
    );
  }
  if (
    baseUniformLocations.uChinPositionsLocation &&
    faceLandmarks.chinPositions
  ) {
    gl.uniform2fv(
      baseUniformLocations.uChinPositionsLocation,
      flattenArray(chinPositions, maxFaces)
    );
  }
  if (baseUniformLocations.uChinWidthsLocation && faceLandmarks.chinWidths) {
    gl.uniform1fv(
      baseUniformLocations.uChinWidthsLocation,
      new Float32Array(chinWidths)
    );
  }
  if (
    baseUniformLocations.uNosePositionsLocation &&
    faceLandmarks.nosePositions
  ) {
    gl.uniform2fv(
      baseUniformLocations.uNosePositionsLocation,
      flattenArray(nosePositions, maxFaces)
    );
  }
  if (baseUniformLocations.uEarsImageOffset && effects.ears) {
    gl.uniform2fv(
      baseUniformLocations.uEarsImageOffset,
      flattenArray(earsImageOffset, maxFaces)
    );
  }
  if (baseUniformLocations.uBeardImageOffset && effects.beards) {
    gl.uniform2fv(
      baseUniformLocations.uBeardImageOffset,
      flattenArray(beardImageOffset, maxFaces)
    );
  }
  if (baseUniformLocations.uMustacheImageOffset && effects.mustaches) {
    gl.uniform2fv(
      baseUniformLocations.uMustacheImageOffset,
      flattenArray(mustacheImageOffset, maxFaces)
    );
  }
};

const flatten1fvArrays = (
  array: number[][],
  maxFaces: number,
  maxEffects: number
) => {
  const flattened = new Float32Array(maxFaces * maxEffects);
  let index = 0;

  for (let i = 0; i < maxEffects; i++) {
    for (let j = 0; j < maxFaces; j++) {
      flattened[index++] = array[i] ? array[i][j] || 0 : 0;
    }
  }
  return flattened;
};

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

const updateBaseUniforms2 = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseProgram: WebGLProgram,
  baseUniformLocations: {
    [uniform in BaseUniformsLocations2]: WebGLUniformLocation;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
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
  gl.useProgram(baseProgram);

  gl.uniform1i(baseUniformLocations.uFaceCountLocation, faceCount);

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
    baseUniformLocations.uPositionsOffsetsTextureLocation,
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
    baseUniformLocations.uWidthsHeadRotationAnglesTexture,
    widthsHeadRotationAnglesTexturePosition
  );
};

export { updateBaseUniforms, updateBaseUniforms2 };
