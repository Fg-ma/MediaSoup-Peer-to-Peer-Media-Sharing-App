import { EffectTypes } from "../../context/StreamsContext";
import videoVertexShaderSource from "./lib/videoVertexShader";
import videoFragmentShaderSource from "./lib/videoFragmentShader";
import triangleVertexShaderSource from "./lib/triangleVertexShader";
import triangleFragmentShaderSource from "./lib/triangleFragmentShader";
import setUniforms from "./lib/setUniforms";
import createShader from "./lib/createShader";
import createAndSetupTexture from "./lib/createAndSetupTexture";
import render from "./lib/render";
import createProgram from "./lib/createProgram";
import setStopFunction from "./lib/setStopFunction";
import createBuffers from "./lib/createBuffers";
import loadTexture from "./lib/loadTexture";
import loadModels from "../lib/loadModels";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateDeadbandingMaps from "./lib/updateDeadbandingMaps";
import { FaceMesh, Results } from "@mediapipe/face_mesh";

export type FaceLandmarks =
  | "headRotationAngles"
  | "headPitchAngles"
  | "headYawAngles"
  | "leftEarPositions"
  | "rightEarPositions"
  | "leftEarWidths"
  | "rightEarWidths"
  | "leftEyePositions"
  | "rightEyePositions"
  | "eyesCenterPositions"
  | "eyesWidths"
  | "chinPositions"
  | "chinWidths"
  | "nosePositions";

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
  },
  currentEffectsStyles: React.MutableRefObject<EffectStylesType>
) => {
  // Setup WebGL context
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

  if (!gl) {
    return new Error("WebGL not supported");
  }

  const videoVertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    videoVertexShaderSource
  );
  if (videoVertexShader instanceof Error) {
    return new Error("No video vertex shader: ", videoVertexShader);
  }
  const videoFragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    videoFragmentShaderSource
  );
  if (videoFragmentShader instanceof Error) {
    return new Error("No video fragment shader: ", videoFragmentShader);
  }

  const triangleVertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    triangleVertexShaderSource
  );
  if (triangleVertexShader instanceof Error) {
    return new Error("No triangle vertex shader: ", triangleVertexShader);
  }
  const triangleFragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    triangleFragmentShaderSource
  );
  if (triangleFragmentShader instanceof Error) {
    return new Error("No triangle fragment shader: ", triangleFragmentShader);
  }

  const videoProgram = createProgram(
    gl,
    videoVertexShader,
    videoFragmentShader
  );
  if (videoProgram instanceof Error) {
    return new Error("No video program");
  }
  gl.useProgram(videoProgram);

  const triangleProgram = createProgram(
    gl,
    triangleVertexShader,
    triangleFragmentShader
  );
  if (triangleProgram instanceof Error) {
    return new Error("No triangle program");
  }
  gl.useProgram(triangleProgram);

  // Create buffers
  const {
    positionBuffer: videoPositionBuffer,
    texCoordBuffer: videoTexCoordBuffer,
  } = createBuffers(gl, videoProgram);

  const {
    positionBuffer: trianglePositionBuffer,
    texCoordBuffer: triangleTexCoordBuffer,
  } = createBuffers(gl, triangleProgram);

  const texture = createAndSetupTexture(gl);

  if (!texture) {
    return new Error("No texture");
  }

  if (effects.ears || effects.glasses || effects.beards || effects.mustaches) {
    await loadModels();
  }

  // Load ear images as textures
  let leftEarImageTexture: WebGLTexture | null | undefined;
  let leftEarImageAspectRatio: number | undefined;
  let rightEarImageTexture: WebGLTexture | null | undefined;
  let rightEarImageAspectRatio: number | undefined;
  if (effects.ears) {
    const leftEarTexture = await loadTexture(
      gl,
      `/assets/ears/${currentEffectsStyles.current.ears.style}Left.png`
    );
    leftEarImageTexture = leftEarTexture.texture;
    leftEarImageAspectRatio = leftEarTexture.aspectRatio;
    const rightEarTexture = await loadTexture(
      gl,
      `/assets/ears/${currentEffectsStyles.current.ears.style}Right.png`
    );
    rightEarImageTexture = rightEarTexture.texture;
    rightEarImageAspectRatio = rightEarTexture.aspectRatio;

    if (
      !leftEarImageTexture ||
      !leftEarImageAspectRatio ||
      !rightEarImageTexture ||
      !rightEarImageAspectRatio
    ) {
      return new Error(
        "No leftEarImageTexture or leftEarImageAspectRatio or rightEarImageTexture or rightEarImageAspectRatio"
      );
    }
  }

  // Load glasses image as textures
  let glassesImageTexture: WebGLTexture | null | undefined;
  let glassesImageAspectRatio: number | undefined;
  if (effects.glasses) {
    const glassesTexture = await loadTexture(
      gl,
      `/assets/glasses/${currentEffectsStyles.current.glasses.style}.png`
    );
    glassesImageTexture = glassesTexture.texture;
    glassesImageAspectRatio = glassesTexture.aspectRatio;

    if (!glassesImageTexture || !glassesImageAspectRatio) {
      return new Error("No glassesImage or glassesImageAspectRatio");
    }
  }

  // Load beard image as textures
  let beardImageTexture: WebGLTexture | null | undefined;
  let beardImageAspectRatio: number | undefined;
  if (effects.beards) {
    const beardTexture = await loadTexture(
      gl,
      `/assets/beards/${currentEffectsStyles.current.beards.style}.png`
    );
    beardImageTexture = beardTexture.texture;
    beardImageAspectRatio = beardTexture.aspectRatio;

    if (!beardImageTexture || !beardImageAspectRatio) {
      return new Error("No beardImageTexture or beardImageAspectRatio");
    }
  }

  // Load mustaches image as textures
  let mustacheImageTexture: WebGLTexture | null | undefined;
  let mustacheImageAspectRatio: number | undefined;
  if (effects.mustaches) {
    const mustacheTexture = await loadTexture(
      gl,
      `/assets/mustaches/${currentEffectsStyles.current.mustaches.style}.png`
    );
    mustacheImageTexture = mustacheTexture.texture;
    mustacheImageAspectRatio = mustacheTexture.aspectRatio;

    if (!mustacheImageTexture || !mustacheImageAspectRatio) {
      return new Error("No mustacheImageTexture or mustacheImageAspectRatio");
    }
  }

  // Set up the uniforms in the fragment shader
  const { uniformLocations, attributeLocations } = setUniforms(
    gl,
    videoProgram,
    triangleProgram,
    canvas,
    effects,
    tintColor,
    leftEarImageTexture,
    leftEarImageAspectRatio,
    rightEarImageTexture,
    rightEarImageAspectRatio,
    glassesImageTexture,
    glassesImageAspectRatio,
    beardImageTexture,
    beardImageAspectRatio,
    mustacheImageTexture,
    mustacheImageAspectRatio
  );

  if (uniformLocations instanceof Error) {
    return new Error("Error setting uniforms: ", uniformLocations);
  }

  const faceLandmarks: { [faceLandmark in FaceLandmarks]: boolean } = {
    headRotationAngles: false,
    headPitchAngles: false,
    headYawAngles: false,
    leftEarPositions: false,
    rightEarPositions: false,
    leftEarWidths: false,
    rightEarWidths: false,
    leftEyePositions: false,
    rightEyePositions: false,
    eyesCenterPositions: false,
    eyesWidths: false,
    chinPositions: false,
    chinWidths: false,
    nosePositions: false,
  };

  if (effects.ears) {
    faceLandmarks.headRotationAngles = true;
    faceLandmarks.headPitchAngles = true;
    faceLandmarks.headYawAngles = true;
    faceLandmarks.leftEarPositions = true;
    faceLandmarks.rightEarPositions = true;
    faceLandmarks.leftEarWidths = true;
    faceLandmarks.rightEarWidths = true;
  }
  if (effects.glasses) {
    faceLandmarks.headRotationAngles = true;
    faceLandmarks.headPitchAngles = true;
    faceLandmarks.headYawAngles = true;
    faceLandmarks.eyesCenterPositions = true;
    faceLandmarks.eyesWidths = true;
  }
  if (effects.beards) {
    faceLandmarks.headRotationAngles = true;
    faceLandmarks.headPitchAngles = true;
    faceLandmarks.headYawAngles = true;
    faceLandmarks.chinPositions = true;
    faceLandmarks.chinWidths = true;
  }
  if (effects.mustaches) {
    faceLandmarks.headRotationAngles = true;
    faceLandmarks.headPitchAngles = true;
    faceLandmarks.headYawAngles = true;
    faceLandmarks.nosePositions = true;
    faceLandmarks.eyesWidths = true;
  }

  updateDeadbandingMaps(effects, currentEffectsStyles);

  let faceMeshResults: Results[] = [];
  const faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    },
  });
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  faceMesh.onResults((results) => {
    faceMeshResults[0] = results;
  });

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
      videoProgram,
      triangleProgram,
      texture,
      video,
      canvas,
      animationFrameId,
      effects,
      uniformLocations,
      faceLandmarks,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults
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
    videoProgram,
    videoVertexShader,
    videoFragmentShader,
    videoPositionBuffer,
    videoTexCoordBuffer,
    triangleProgram,
    triangleVertexShader,
    triangleFragmentShader,
    trianglePositionBuffer,
    triangleTexCoordBuffer,
    canvas,
    type,
    id,
    userStopStreamEffects,
    leftEarImageTexture,
    rightEarImageTexture,
    glassesImageTexture,
    beardImageTexture,
    mustacheImageTexture
  );

  return canvas.captureStream().getVideoTracks()[0];
};

export default handleEffectWebGL;
