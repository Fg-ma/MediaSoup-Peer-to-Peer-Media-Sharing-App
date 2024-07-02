import { EffectTypes } from "../../context/StreamsContext";
import baseVertexShaderSource from "./lib/baseVertexShader";
import baseFragmentShaderSource from "./lib/baseFragmentShader";
import triangleVertexShaderSource from "./lib/triangleVertexShader";
import triangleFragmentShaderSource from "./lib/triangleFragmentShader";
import initializeBaseUniforms from "./lib/initializeBaseUniforms";
import createShader from "./lib/createShader";
import createAndSetupTexture from "./lib/createAndSetupTexture";
import render from "./lib/render";
import createProgram from "./lib/createProgram";
import createStopFunction from "./lib/createStopFunction";
import { loadTexture } from "./lib/loadTexture";
import loadModels from "../lib/loadModels";
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateDeadbandingMaps from "./lib/updateDeadbandingMaps";
import { FaceMesh, Results } from "@mediapipe/face_mesh";
import initializeBaseAttributes from "./lib/initializeBaseAttributes";
import { createBaseBuffers, createTriangleBuffers } from "./lib/createBuffers";
import initializeTriangleUniforms from "./lib/initializeTriangleUniforms";
import initializeTriangleAttributes from "./lib/initializeTriangleAttributes";
import { releaseAllTexturePositions } from "./lib/handleTexturePosition";

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
  releaseAllTexturePositions();

  // Setup WebGL context
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

  if (!gl) {
    return new Error("WebGL not supported");
  }

  const baseVertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    baseVertexShaderSource
  );
  if (baseVertexShader instanceof Error) {
    return new Error("No base vertex shader: ", baseVertexShader);
  }
  const baseFragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    baseFragmentShaderSource
  );
  if (baseFragmentShader instanceof Error) {
    return new Error("No base fragment shader: ", baseFragmentShader);
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

  const baseProgram = createProgram(gl, baseVertexShader, baseFragmentShader);
  if (baseProgram instanceof Error) {
    return new Error("No base program");
  }

  const triangleProgram = createProgram(
    gl,
    triangleVertexShader,
    triangleFragmentShader
  );
  if (triangleProgram instanceof Error) {
    return new Error("No triangle program");
  }

  // Create base video texture
  const baseVideoTexture = createAndSetupTexture(gl);

  if (!baseVideoTexture) {
    return new Error("No baseVideoTexture");
  }

  if (
    effects.ears ||
    effects.glasses ||
    effects.beards ||
    effects.mustaches ||
    effects.faceMask
  ) {
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
      `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Left.png`
    );
    leftEarImageTexture = leftEarTexture.texture;
    leftEarImageAspectRatio = leftEarTexture.aspectRatio;
    const rightEarTexture = await loadTexture(
      gl,
      `/2DAssets/ears/${currentEffectsStyles.current.ears.style}Right.png`
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
      `/2DAssets/glasses/${currentEffectsStyles.current.glasses.style}.png`
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
      `/2DAssets/beards/${currentEffectsStyles.current.beards.style}.png`
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
      `/2DAssets/mustaches/${currentEffectsStyles.current.mustaches.style}.png`
    );
    mustacheImageTexture = mustacheTexture.texture;
    mustacheImageAspectRatio = mustacheTexture.aspectRatio;

    if (!mustacheImageTexture || !mustacheImageAspectRatio) {
      return new Error("No mustacheImageTexture or mustacheImageAspectRatio");
    }
  }

  // Load triangle image as textures
  let triangleTexture: WebGLTexture | null | undefined;
  if (effects.faceMask) {
    const loadedTriangleTexture = await loadTexture(gl, `/2DAssets/james2.png`);
    triangleTexture = loadedTriangleTexture.texture;

    if (!triangleTexture) {
      return new Error("No triangleTexture or triangleAspectRatio");
    }
  }

  // Set up the uniforms in the base fragment shader
  const baseUniformsLocations = initializeBaseUniforms(
    gl,
    baseProgram,
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

  if (baseUniformsLocations instanceof Error) {
    return new Error("Error setting base uniforms: ", baseUniformsLocations);
  }

  // Set up the uniforms in the triangle fragment shader
  const triangleUniformsLocations = initializeTriangleUniforms(
    gl,
    triangleProgram,
    effects,
    triangleTexture
  );

  if (triangleUniformsLocations instanceof Error) {
    return new Error(
      "Error setting triangle uniforms: ",
      triangleUniformsLocations
    );
  }

  const baseAttributesLocations = initializeBaseAttributes(gl, baseProgram);

  if (baseAttributesLocations instanceof Error) {
    return new Error(
      "Error setting base attributes: ",
      baseAttributesLocations
    );
  }

  const triangleAttributesLocations = initializeTriangleAttributes(
    gl,
    triangleProgram
  );

  if (triangleAttributesLocations instanceof Error) {
    return new Error(
      "Error setting triangle attributes: ",
      triangleAttributesLocations
    );
  }

  // Create buffers
  const baseBuffers = createBaseBuffers(
    gl,
    baseProgram,
    baseAttributesLocations
  );
  if (
    !baseBuffers ||
    baseBuffers.basePositionBuffer === null ||
    baseBuffers.baseTexCoordBuffer === null
  ) {
    return new Error("Failed to create base buffers");
  }
  const { basePositionBuffer, baseTexCoordBuffer } = baseBuffers;

  const triangleBuffers = createTriangleBuffers(
    gl,
    triangleProgram,
    triangleAttributesLocations
  );
  if (
    !triangleBuffers ||
    triangleBuffers.trianglePositionBuffer === null ||
    triangleBuffers.triangleTexCoordBuffer === null ||
    triangleBuffers.triangleIndexBuffer === null
  ) {
    return new Error("Failed to create triangle buffers");
  }
  const {
    trianglePositionBuffer,
    triangleTexCoordBuffer,
    triangleIndexBuffer,
  } = triangleBuffers;

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
    chinPositions: false,
    chinWidths: false,
    nosePositions: false,
  };

  if (effects.ears) {
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
  if (effects.beards) {
    faceLandmarks.headRotationAngles = true;
    faceLandmarks.chinPositions = true;
    faceLandmarks.chinWidths = true;
  }
  if (effects.mustaches) {
    faceLandmarks.headRotationAngles = true;
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
    maxNumFaces: 2,
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
      baseProgram,
      triangleProgram,
      baseVideoTexture,
      video,
      canvas,
      animationFrameId,
      effects,
      baseUniformsLocations,
      triangleUniformsLocations,
      baseAttributesLocations,
      triangleAttributesLocations,
      faceLandmarks,
      currentEffectsStyles,
      faceMesh,
      faceMeshResults,
      triangleTexture,
      basePositionBuffer,
      baseTexCoordBuffer,
      trianglePositionBuffer,
      triangleTexCoordBuffer,
      triangleIndexBuffer
    );
  });
  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    video.play();
  };

  // Set up stop function
  createStopFunction(
    animationFrameId,
    video,
    gl,
    baseVideoTexture,
    baseProgram,
    baseVertexShader,
    baseFragmentShader,
    basePositionBuffer,
    baseTexCoordBuffer,
    triangleProgram,
    triangleVertexShader,
    triangleFragmentShader,
    trianglePositionBuffer,
    triangleTexCoordBuffer,
    triangleIndexBuffer,
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
