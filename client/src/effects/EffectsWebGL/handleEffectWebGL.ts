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

  // Load dogEar images as textures
  let earImageLeftTexture: WebGLTexture | null | undefined;
  let earImageRightTexture: WebGLTexture | null | undefined;
  if (effects.dogEars) {
    earImageLeftTexture = await loadTexture(gl, "/dogEarsLeft.png");
    earImageRightTexture = await loadTexture(gl, "/dogEarsRight.png");
    await loadModels();
  }

  if (effects.dogEars && (!earImageLeftTexture || !earImageRightTexture)) {
    return new Error("No earImageLeft or earImageRight");
  }

  // Set up the uniforms in the fragment shader
  const uniformLocations = setUniforms(
    gl,
    program,
    canvas,
    effects,
    tintColor,
    earImageLeftTexture,
    earImageRightTexture
  );

  if (uniformLocations instanceof Error) {
    return new Error("Error setting uniforms: ", uniformLocations);
  }

  // Start video and render loop
  let animationFrameId: number[] = [];
  const video = document.createElement("video");
  video.srcObject = new MediaStream([
    type === "webcam" || type === "screen"
      ? userUneffectedStreams.current[type][id].getVideoTracks()[0]
      : userUneffectedStreams.current[type]!.getVideoTracks()[0],
  ]);
  video.addEventListener("play", () => {
    render(
      gl,
      texture,
      video,
      canvas,
      animationFrameId,
      effects,
      uniformLocations
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
    earImageLeftTexture,
    earImageRightTexture
  );

  return canvas.captureStream().getVideoTracks()[0];
};

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
}

export default handleEffectWebGL;
