import flattenArray from "./flattenArray";
import { FaceLandmarks } from "../handleEffectWebGL";
import {
  BaseUniformsLocations,
  BaseUniformsLocations2,
} from "./initializeBaseUniforms";
import { EffectTypes } from "src/context/StreamsContext";
import { bindTexture2 } from "./bindTexture";
import { releaseTexturePosition } from "./handleTexturePosition";

let lastPositionTexturePosition: number | undefined;

export const updateLastPositionTexturePosition = (
  position: number | undefined
) => {
  lastPositionTexturePosition = position;
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

const flatten2fvArrays = (
  array: [number, number][][],
  maxFaces: number,
  maxPositions: number
) => {
  const flattened = new Float32Array(maxFaces * maxPositions * 2);
  let index = 0;

  for (let i = 0; i < maxPositions; i++) {
    for (let j = 0; j < maxFaces; j++) {
      if (array[i] && array[i][j]) {
        flattened[index++] = array[i][j][0];
        flattened[index++] = array[i][j][1];
      } else {
        flattened[index++] = 0;
        flattened[index++] = 0;
      }
    }
  }

  return flattened;
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
  positions: [number, number][][],
  maxFaces: number,
  maxDataTypes: number
) => {
  const data = new Float32Array(maxFaces * maxDataTypes * 4);

  let index = 0;
  for (let i = 0; i < maxDataTypes; i++) {
    for (let j = 0; j < maxFaces; j++) {
      if (positions[i] && positions[i][j]) {
        data[index++] = positions[i][j][0]; // R
        data[index++] = positions[i][j][1]; // G
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
  gl.bindTexture(gl.TEXTURE_2D, texture);

  if (gl instanceof WebGL2RenderingContext) {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      maxFaces,
      maxDataTypes,
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
      maxFaces,
      maxDataTypes,
      0,
      gl.RGBA,
      gl.FLOAT,
      data
    );
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  return texture;
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

  gl.uniform1fv(
    baseUniformLocations.uHeadRotationAnglesLocation,
    new Float32Array(headRotationAngles.length !== 0 ? headRotationAngles : [0])
  );

  if (lastPositionTexturePosition) {
    releaseTexturePosition(lastPositionTexturePosition);
  }
  const positionTexturePosition = bindTexture2(
    gl,
    createDataTexture(
      gl,
      [
        leftEyePositions,
        rightEyePositions,
        eyesCenterPositions,
        chinPositions,
        nosePositions,
      ],
      maxFaces,
      maxPositions
    )
  );
  if (positionTexturePosition instanceof Error) {
    return positionTexturePosition;
  }
  lastPositionTexturePosition = positionTexturePosition;

  gl.uniform1i(
    baseUniformLocations.uPositionsTextureLocation,
    positionTexturePosition
  );

  gl.uniform1fv(
    baseUniformLocations.uWidthsLocation,
    flatten1fvArrays(
      [leftEarWidths, rightEarWidths, eyesWidths, chinWidths],
      maxFaces,
      maxWidths
    )
  );

  gl.uniform2fv(
    baseUniformLocations.uImageOffsetsLocation,
    flatten2fvArrays(
      [
        earsImageOffset,
        earsImageOffset,
        [],
        beardImageOffset,
        mustacheImageOffset,
      ],
      maxFaces,
      5
    )
  );
};

export { updateBaseUniforms, updateBaseUniforms2 };
