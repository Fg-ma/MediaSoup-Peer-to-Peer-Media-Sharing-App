import { Uniforms } from "./setUniforms";
import { EffectTypes } from "src/context/StreamsContext";
import { FaceLandmarks } from "../handleEffectWebGL";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import directionalShift from "./directionalShift";
import updateTwoDimensionalSmooth from "./updateTwoDimensionalSmooth";
import updateOneDimensionalSmoothVariables from "./updateOneDimensionalSmoothVariables";
import updateUniforms from "./updateUniforms";
import toggleFaceTrackedEffects from "./toggleFaceTrackedEffects";

export type TwoDimensionalVariableTypes =
  | "eyesCenterPosition"
  | "leftEyePosition"
  | "rightEyePosition"
  | "nosePosition"
  | "chinPosition";
export type OneDimensionalVariableTypes =
  | "leftEarWidth"
  | "rightEarWidth"
  | "eyesWidth"
  | "chinWidth"
  | "headRotationAngle"
  | "headPitchAngle"
  | "headYawAngle"
  | "interocularDistance";

export const smoothedTwoDimensionalVariables: {
  [featureType in TwoDimensionalVariableTypes]: { [id: string]: number[] };
} = {
  eyesCenterPosition: {},
  leftEyePosition: {},
  rightEyePosition: {},
  nosePosition: {},
  chinPosition: {},
};
export const smoothedOneDimensionalVariables: {
  [featureType in OneDimensionalVariableTypes]: { [id: string]: number };
} = {
  leftEarWidth: {},
  rightEarWidth: {},
  eyesWidth: {},
  chinWidth: {},
  headRotationAngle: {},
  headPitchAngle: {},
  headYawAngle: {},
  interocularDistance: {},
};

let faceTrackers: {
  [id: string]: { position: faceapi.Point; lastSeen: number };
} = {};
const maxFaceTrackerAge = 5;
const detectionTimeout = 200;

let detectTimeout: NodeJS.Timeout | undefined;
let detectionTimedout = false;

const updateFaceLandmarks = async (
  gl: WebGLRenderingContext,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  uniformLocations: {
    [uniform in Uniforms]: WebGLUniformLocation | null | undefined;
  },
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  },
  faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>
) => {
  const faceMesh = new FaceMesh({
    locateFile: (file: any) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    },
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults(onResults);

  console.log(faceMesh);
};

export default updateFaceLandmarks;

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
        color: "#C0C0C070",
        lineWidth: 1,
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {
        color: "#FF3030",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {
        color: "#30FF30",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {
        color: "#E0E0E0",
      });
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {
        color: "#E0E0E0",
      });
    }
  }
  canvasCtx.restore();
}
