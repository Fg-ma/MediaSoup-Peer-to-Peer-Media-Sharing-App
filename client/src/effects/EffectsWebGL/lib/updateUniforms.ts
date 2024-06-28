import flattenArray from "./flattenArray";
import { FaceLandmarks } from "../handleEffectWebGL";
import { Uniforms } from "./setUniforms";
import { EffectTypes } from "src/context/StreamsContext";

const maxFaces = 8;

const updateUniforms = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  videoProgram: WebGLProgram,
  triangleProgram: WebGLProgram,
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
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
  earsImageOffset: number[],
  beardImageOffset: number[],
  mustacheImageOffset: number[]
) => {
  gl.useProgram(videoProgram);

  if (uniformLocations.uFaceCountLocation) {
    gl.uniform1i(uniformLocations.uFaceCountLocation, faceCount);
  }
  if (
    uniformLocations.uHeadRotationAnglesLocation &&
    faceLandmarks.headRotationAngles
  ) {
    gl.uniform1fv(
      uniformLocations.uHeadRotationAnglesLocation,
      new Float32Array(headRotationAngles)
    );
  }
  if (
    uniformLocations.uHeadPitchAnglesLocation &&
    faceLandmarks.headPitchAngles
  ) {
    // console.log(headPitchAngles);
    gl.uniform1fv(
      uniformLocations.uHeadPitchAnglesLocation,
      new Float32Array([0.0])
      // new Float32Array([Math.PI / 4.0])
      // new Float32Array(headPitchAngles)
    );
  }
  if (uniformLocations.uHeadYawAnglesLocation && faceLandmarks.headYawAngles) {
    gl.uniform1fv(
      uniformLocations.uHeadYawAnglesLocation,
      new Float32Array(headYawAngles)
      // new Float32Array([0.0])
      // new Float32Array([Math.PI / 3.0])
    );
  }
  if (
    uniformLocations.uLeftEarPositionsLocation &&
    faceLandmarks.leftEarPositions
  ) {
    gl.uniform2fv(
      uniformLocations.uLeftEarPositionsLocation,
      flattenArray(leftEarPositions, maxFaces)
    );
  }
  if (
    uniformLocations.uRightEarPositionsLocation &&
    faceLandmarks.rightEarPositions
  ) {
    gl.uniform2fv(
      uniformLocations.uRightEarPositionsLocation,
      flattenArray(rightEarPositions, maxFaces)
    );
  }
  if (uniformLocations.uLeftEarWidthsLocation && faceLandmarks.leftEarWidths) {
    gl.uniform1fv(
      uniformLocations.uLeftEarWidthsLocation,
      new Float32Array(leftEarWidths)
    );
  }
  if (
    uniformLocations.uRightEarWidthsLocation &&
    faceLandmarks.rightEarWidths
  ) {
    gl.uniform1fv(
      uniformLocations.uRightEarWidthsLocation,
      new Float32Array(rightEarWidths)
    );
  }
  if (
    uniformLocations.uLeftEyePositionsLocation &&
    faceLandmarks.leftEyePositions
  ) {
    gl.uniform2fv(
      uniformLocations.uLeftEyePositionsLocation,
      flattenArray(leftEyePositions, maxFaces)
    );
  }
  if (
    uniformLocations.uRightEyePositionsLocation &&
    faceLandmarks.rightEyePositions
  ) {
    gl.uniform2fv(
      uniformLocations.uRightEyePositionsLocation,
      flattenArray(rightEyePositions, maxFaces)
    );
  }
  if (
    uniformLocations.uEyesCentersLocation &&
    faceLandmarks.eyesCenterPositions
  ) {
    gl.uniform2fv(
      uniformLocations.uEyesCentersLocation,
      flattenArray(eyesCenterPositions, maxFaces)
    );
  }
  if (uniformLocations.uEyesWidthsLocation && faceLandmarks.eyesWidths) {
    gl.uniform1fv(
      uniformLocations.uEyesWidthsLocation,
      new Float32Array(eyesWidths)
    );
  }
  if (uniformLocations.uChinPositionsLocation && faceLandmarks.chinPositions) {
    gl.uniform2fv(
      uniformLocations.uChinPositionsLocation,
      flattenArray(chinPositions, maxFaces)
    );
  }
  if (uniformLocations.uChinWidthsLocation && faceLandmarks.chinWidths) {
    gl.uniform1fv(
      uniformLocations.uChinWidthsLocation,
      new Float32Array(chinWidths)
    );
  }
  if (uniformLocations.uNosePositionsLocation && faceLandmarks.nosePositions) {
    gl.uniform2fv(
      uniformLocations.uNosePositionsLocation,
      flattenArray(nosePositions, maxFaces)
    );
  }
  if (uniformLocations.uEarsImageOffset && effects.ears) {
    gl.uniform2fv(uniformLocations.uEarsImageOffset, earsImageOffset);
  }
  if (uniformLocations.uBeardImageOffset && effects.beards) {
    gl.uniform2fv(uniformLocations.uBeardImageOffset, beardImageOffset);
  }
  if (uniformLocations.uMustacheImageOffset && effects.mustaches) {
    gl.uniform2fv(uniformLocations.uMustacheImageOffset, mustacheImageOffset);
  }
};

export default updateUniforms;
