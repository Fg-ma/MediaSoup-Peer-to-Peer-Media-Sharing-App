import * as faceapi from "face-api.js";
import { EffectTypes } from "../../context/StreamsContext";
import vertexShaderSource from "./lib/vertexShader";
import fragmentShaderSource from "./lib/fragmentShader";
import setUniforms from "./lib/setUniforms";
import createShader from "./lib/createShader";
import createAndSetupTexture from "./lib/createAndSetupTexture";
import render from "./lib/render";
import createProgram from "./lib/createProgram";
import setStopFunction from "./lib/setStopFunction";
import createBuffers from "./lib/createBuffers";
import loadTexture from "./lib/loadTexture";
import loadModels from "../lib/loadModels";

export type FaceLandmarks =
  | "headRotationAngles"
  | "leftEarPositions"
  | "rightEarPositions"
  | "leftEarWidths"
  | "rightEarWidths"
  | "leftEyePositions"
  | "rightEyePositions"
  | "eyesCenterPositions"
  | "eyesWidths"
  | "nosePositions"
  | "chinWidths";

const handleEffectWebGL = async (
  type: "webcam" | "screen" | "audio",
  id: string,
  userUneffectedStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  userStopStreamEffects: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: () => void;
    };
    screen: {
      [screenId: string]: () => void;
    };
    audio: (() => void) | undefined;
  }>,
  tintColor: React.MutableRefObject<string>,
  effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  }
) => {
  // Setup WebGL context
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    willReadFrequently: true,
  }) as WebGLRenderingContext | null;

  if (!gl) {
    return new Error("WebGL not supported");
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  if (vertexShader instanceof Error) {
    return new Error("No vertex shader: ", vertexShader);
  }
  if (fragmentShader instanceof Error) {
    console.log(fragmentShader);
    return new Error("No fragment shader: ", fragmentShader);
  }

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (program instanceof Error) {
    return new Error("No program");
  }

  gl.useProgram(program);

  // Create buffers
  const { positionBuffer, texCoordBuffer } = createBuffers(gl, program);

  const texture = createAndSetupTexture(gl);

  if (!texture) {
    return new Error("No texture");
  }

  if (effects.dogEars || effects.glasses || effects.beard) {
    await loadModels();
  }

  // Load dogEar images as textures
  let leftDogEarImageTexture: WebGLTexture | null | undefined;
  let leftDogEarImageAspectRatio: number | undefined;
  let rightDogEarImageTexture: WebGLTexture | null | undefined;
  let rightDogEarImageAspectRatio: number | undefined;
  if (effects.dogEars) {
    const leftEarTexture = await loadTexture(
      gl,
      "/assets/ears/dogEarsLeft.png"
    );
    leftDogEarImageTexture = leftEarTexture.texture;
    leftDogEarImageAspectRatio = leftEarTexture.aspectRatio;
    const rightEarTexture = await loadTexture(
      gl,
      "/assets/ears/dogEarsRight.png"
    );
    rightDogEarImageTexture = rightEarTexture.texture;
    rightDogEarImageAspectRatio = rightEarTexture.aspectRatio;

    if (
      !leftDogEarImageTexture ||
      !leftDogEarImageAspectRatio ||
      !rightDogEarImageTexture ||
      !rightDogEarImageAspectRatio
    ) {
      return new Error(
        "No leftDogEarImageTexture or leftDogEarImageAspectRatio or rightDogEarImageTexture or rightDogEarImageAspectRatio"
      );
    }
  }

  // Load glasses images as textures
  let glassesImageTexture: WebGLTexture | null | undefined;
  let glassesImageAspectRatio: number | undefined;
  if (effects.glasses) {
    const glassesTexture = await loadTexture(
      gl,
      "/assets/glasses/glasses3.png"
    );
    glassesImageTexture = glassesTexture.texture;
    glassesImageAspectRatio = glassesTexture.aspectRatio;

    if (!glassesImageTexture || !glassesImageAspectRatio) {
      return new Error("No glassesImage or glassesImageAspectRatio");
    }
  }

  // Load beard images as textures
  let beardImageTexture: WebGLTexture | null | undefined;
  let beardImageAspectRatio: number | undefined;
  if (effects.beard) {
    const beardTexture = await loadTexture(gl, "/assets/beards/beard2.png");
    beardImageTexture = beardTexture.texture;
    beardImageAspectRatio = beardTexture.aspectRatio;

    if (!beardImageAspectRatio || !beardImageAspectRatio) {
      return new Error("No beardImageTexture or beardImageAspectRatio");
    }
  }

  // Set up the uniforms in the fragment shader
  const uniformLocations = setUniforms(
    gl,
    program,
    canvas,
    effects,
    tintColor,
    leftDogEarImageTexture,
    leftDogEarImageAspectRatio,
    rightDogEarImageTexture,
    rightDogEarImageAspectRatio,
    glassesImageTexture,
    glassesImageAspectRatio,
    beardImageTexture,
    beardImageAspectRatio
  );

  if (uniformLocations instanceof Error) {
    return new Error("Error setting uniforms: ", uniformLocations);
  }

  const faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean } = {
    headRotationAngles: false,
    leftEarPositions: false,
    rightEarPositions: false,
    leftEarWidths: false,
    rightEarWidths: false,
    leftEyePositions: false,
    rightEyePositions: false,
    eyesCenterPositions: false,
    eyesWidths: false,
    nosePositions: false,
    chinWidths: false,
  };

  if (effects.dogEars) {
    faceLandmarks.headRotationAngles = true;
    faceLandmarks.leftEarPositions = true;
    faceLandmarks.rightEarPositions = true;
    faceLandmarks.leftEarWidths = true;
    faceLandmarks.rightEarWidths = true;
  }
  if (effects.glasses) {
    faceLandmarks.headRotationAngles = true;
    faceLandmarks.eyesCenterPositions = true;
    faceLandmarks.eyesWidths = true;
  }
  if (effects.beard) {
    faceLandmarks.headRotationAngles = true;
    faceLandmarks.nosePositions = true;
    faceLandmarks.chinWidths = true;
  }

  // Start video and render loop
  let animationFrameId: number[] = [];
  const video = document.createElement("video");
  if (
    ((type === "webcam" || type === "screen") &&
      userUneffectedStreams.current[type][id]) ||
    (type === "audio" && userUneffectedStreams.current[type])
  ) {
    video.srcObject = new MediaStream([
      type === "webcam" || type === "screen"
        ? userUneffectedStreams.current[type][id].getVideoTracks()[0]
        : userUneffectedStreams.current[type]!.getVideoTracks()[0],
    ]);
  } else {
    return new Error("Error getting user uneffected streams");
  }
  video.addEventListener("play", () => {
    render(
      gl,
      texture,
      video,
      canvas,
      animationFrameId,
      effects,
      uniformLocations,
      faceLandmarks
    );
  });
  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    video.play();
  };

  // Set up stop function
  setStopFunction(
    animationFrameId,
    video,
    gl,
    texture,
    program,
    vertexShader,
    fragmentShader,
    positionBuffer,
    texCoordBuffer,
    canvas,
    type,
    id,
    userStopStreamEffects,
    leftDogEarImageTexture,
    rightDogEarImageTexture,
    glassesImageTexture,
    beardImageTexture
  );

  return canvas.captureStream().getVideoTracks()[0];
};

export default handleEffectWebGL;
