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
  const gl = canvas.getContext("webgl");

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
    return new Error("No vertex shader");
  }
  if (fragmentShader instanceof Error) {
    return new Error("No fragment shader");
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
  let earImageLeft: WebGLTexture | null | undefined;
  let earImageRight: WebGLTexture | null | undefined;
  if (effects.dogEars) {
    earImageLeft = await loadTexture(gl, "/dogEarsLeft.png");
    earImageRight = await loadTexture(gl, "/dogEarsRight.png");
  }

  if (effects.dogEars && (!earImageLeft || !earImageRight)) {
    return new Error("No earImageLeft or earImageRight");
  }

  // Set up the uniforms in the fragment shader
  setUniforms(
    gl,
    program,
    canvas,
    effects,
    tintColor,
    earImageLeft,
    earImageRight
  );

  // Load face detection models
  await loadModels();

  // Start video and render loop
  let animationFrameId: number[] = [];
  const video = document.createElement("video");
  video.srcObject = new MediaStream([
    type === "webcam" || type === "screen"
      ? userUneffectedStreams.current[type][id].getVideoTracks()[0]
      : userUneffectedStreams.current[type]!.getVideoTracks()[0],
  ]);
  video.addEventListener("play", () => {
    render(gl, texture, video, animationFrameId, program, effects);
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
    userStopStreamEffects
  );

  return canvas.captureStream().getVideoTracks()[0];
};

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
}

async function loadTexture(
  gl: WebGLRenderingContext,
  url: string
): Promise<WebGLTexture | null> {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      resolve(texture);
    };
    image.onerror = (error) => reject(error);
    image.src = url;
  });
}

export default handleEffectWebGL;
