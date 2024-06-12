import { EffectTypes } from "src/context/StreamsContext";
import vertexShaderSource from "./lib/vertexShader";
import fragmentShaderSource from "./lib/fragmentShader";
import setUniforms from "./lib/setUniforms";
import createShader from "./lib/createShader";
import createAndSetupTexture from "./lib/createAndSetupTexture";
import render from "./lib/render";
import createProgram from "./lib/createProgram";
import setStopFunction from "./lib/setStopFunction";

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
  if (!vertexShader) {
    return new Error("No vertex shader");
  }
  if (!fragmentShader) {
    return new Error("No fragment shader");
  }

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    return new Error("No program");
  }

  gl.useProgram(program);

  // Buffers
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  const texCoords = [0, 1, 1, 1, 0, 0, 1, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(texCoordLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  const texture = createAndSetupTexture(gl);

  if (!texture) {
    return new Error("No texture");
  }

  setUniforms(gl, program, canvas, effects, tintColor);

  // Start video and render loop
  const video = document.createElement("video");
  video.srcObject = new MediaStream([
    type === "webcam" || type === "screen"
      ? userUneffectedStreams.current[type][id].getVideoTracks()[0]
      : userUneffectedStreams.current[type]!.getVideoTracks()[0],
  ]);
  let animationFrameId: number[] = [];
  video.addEventListener("play", () => {
    render(gl, texture, video, animationFrameId);
  });
  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth / 2;
    canvas.height = video.videoHeight / 2;
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

export default handleEffectWebGL;
