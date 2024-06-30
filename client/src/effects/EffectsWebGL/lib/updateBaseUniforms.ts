import flattenArray from "./flattenArray";
import { FaceLandmarks } from "../handleEffectWebGL";
import { BaseUniforms } from "./initializeBaseUniforms";
import { EffectTypes } from "src/context/StreamsContext";

const maxFaces = 8;

const updateBaseUniforms = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  baseProgram: WebGLProgram,
  baseUniformLocations: {
    [uniform in BaseUniforms]: WebGLUniformLocation | null | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  faceCount: number,
  headRotationAngles: number[],
  headPitchAngles: number[],
  headYawAngles: number[],
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
      // new Float32Array([0.0])
      // new Float32Array([Math.PI / 4.0])
    );
  }
  if (
    baseUniformLocations.uHeadPitchAnglesLocation &&
    faceLandmarks.headPitchAngles
  ) {
    gl.uniform1fv(
      baseUniformLocations.uHeadPitchAnglesLocation,
      new Float32Array(headPitchAngles)
      // new Float32Array([0.0])
      // new Float32Array([Math.PI / 4.0])
    );
  }
  if (
    baseUniformLocations.uHeadYawAnglesLocation &&
    faceLandmarks.headYawAngles
  ) {
    gl.uniform1fv(
      baseUniformLocations.uHeadYawAnglesLocation,
      new Float32Array(headYawAngles)
      // new Float32Array([0.0])
      // new Float32Array([Math.PI / 3.0])
    );
  }
  if (
    baseUniformLocations.uLeftEarPositionsLocation &&
    faceLandmarks.leftEarPositions
  ) {
    gl.uniform2fv(
      baseUniformLocations.uLeftEarPositionsLocation,
      flattenArray(leftEarPositions, maxFaces)
    );
  }
  if (
    baseUniformLocations.uRightEarPositionsLocation &&
    faceLandmarks.rightEarPositions
  ) {
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

  if (
    baseUniformLocations.uBeardEffectLocation &&
    baseUniformLocations.uHeadRotationAnglesLocation &&
    baseUniformLocations.uHeadPitchAnglesLocation &&
    baseUniformLocations.uHeadYawAnglesLocation &&
    baseUniformLocations.uChinPositionsLocation &&
    baseUniformLocations.uChinWidthsLocation &&
    baseUniformLocations.uBeardImageOffset &&
    baseUniformLocations.uBeardAspectRatioLocation &&
    baseUniformLocations.uBeardImageLocation
  )
    console.log(
      gl.getUniform(baseProgram, baseUniformLocations.uBeardEffectLocation),
      headRotationAngles,
      gl.getUniform(
        baseProgram,
        baseUniformLocations.uHeadRotationAnglesLocation
      ),
      headPitchAngles,
      gl.getUniform(baseProgram, baseUniformLocations.uHeadPitchAnglesLocation),
      headYawAngles,
      gl.getUniform(baseProgram, baseUniformLocations.uHeadYawAnglesLocation),
      chinPositions,
      gl.getUniform(baseProgram, baseUniformLocations.uChinPositionsLocation),
      chinWidths,
      gl.getUniform(baseProgram, baseUniformLocations.uChinWidthsLocation),
      beardImageOffset,
      gl.getUniform(baseProgram, baseUniformLocations.uBeardImageOffset),
      gl.getUniform(
        baseProgram,
        baseUniformLocations.uBeardAspectRatioLocation
      ),
      gl.getUniform(baseProgram, baseUniformLocations.uBeardImageLocation)
    );
};

export default updateBaseUniforms;
