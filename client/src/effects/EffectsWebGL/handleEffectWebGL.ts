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
import { EffectStylesType } from "src/context/CurrentEffectsStylesContext";
import updateDeadbandingMaps from "./lib/updateDeadbandingMaps";

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
  const uniformLocations = setUniforms(
    gl,
    program,
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
      faceLandmarks,
      currentEffectsStyles
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
    leftEarImageTexture,
    rightEarImageTexture,
    glassesImageTexture,
    beardImageTexture,
    mustacheImageTexture
  );

  return canvas.captureStream().getVideoTracks()[0];
};

export default handleEffectWebGL;
