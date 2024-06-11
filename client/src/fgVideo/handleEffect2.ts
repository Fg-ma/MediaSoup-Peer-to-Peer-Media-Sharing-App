import * as mediasoup from "mediasoup-client";
import { EffectTypes } from "src/context/StreamsContext";
import { applyBoxBlur, applyRedTinge } from "./effects";

const handleEffect2 = async (
  effect: EffectTypes,
  type: "webcam" | "screen" | "audio",
  id: string,
  userStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  userUneffectedStreams: React.MutableRefObject<{
    webcam: {
      [webcamId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>,
  userStreamEffects: React.MutableRefObject<{
    [effectType in EffectTypes]: {
      webcam?:
        | {
            [webcamId: string]: boolean;
          }
        | undefined;
      screen?:
        | {
            [screenId: string]: boolean;
          }
        | undefined;
      audio?: boolean;
    };
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
  producerTransport:
    | React.MutableRefObject<
        mediasoup.types.Transport<mediasoup.types.AppData> | undefined
      >
    | undefined
) => {
  if (
    !userStreamEffects ||
    !userStreamEffects.current ||
    !producerTransport ||
    !producerTransport.current
  ) {
    return;
  }

  // Set uneffected screen if necesary
  let activeEffect = false;
  for (const effect in userStreamEffects.current) {
    const effectType = effect as keyof typeof userStreamEffects.current;
    for (const kind in userStreamEffects.current[effectType]) {
      const kindType = kind as "webcam" | "screen" | "audio";
      if (type === kindType) {
        if (kindType === "webcam" || kindType === "screen") {
          for (const kindId in userStreamEffects.current[effectType][
            kindType
          ]) {
            if (kindId === id) {
              if (userStreamEffects.current[effectType][kindType]![id]) {
                activeEffect = true;
              }
            }
          }
        } else if (kindType === "audio") {
          if (userStreamEffects.current[effectType][kindType]!) {
            activeEffect = true;
          }
        }
      }
    }
  }
  if (!activeEffect) {
    if (type === "webcam" || type === "screen") {
      userUneffectedStreams.current[type][id] = userStreams.current[type][id];
    } else if (type === "audio") {
      userUneffectedStreams.current[type] = userStreams.current[type];
    }
  }

  // Create empty stream effects
  if (!userStreamEffects.current[effect][type]) {
    if (type === "webcam" || type === "screen") {
      userStreamEffects.current[effect][type] = {};
    } else if (type === "audio") {
      userStreamEffects.current[effect][type] = false;
    }
  }
  if (
    (type === "webcam" || type === "screen") &&
    !userStreamEffects.current[effect][type]
  ) {
    userStreamEffects.current[effect][type]![id] = false;
  }
  // Fill stream effects
  if (type === "webcam" || type === "screen") {
    userStreamEffects.current[effect][type]![id] =
      !userStreamEffects.current[effect][type]![id];
  } else if (type === "audio") {
    userStreamEffects.current[effect][type] =
      !userStreamEffects.current[effect][type];
  }

  // Stop old effect streams
  for (const kind in userStopStreamEffects.current) {
    const kindType = kind as "webcam" | "screen" | "audio";
    if (type === kindType) {
      if (kindType === "webcam" || kindType === "screen") {
        for (const kindId in userStopStreamEffects.current[kindType]) {
          if (kindId === id) {
            userStopStreamEffects.current[kindType][id]();
          }
        }
      } else if (kindType === "audio") {
        userStopStreamEffects.current[kindType]!();
      }
    }
  }

  // Set user streams
  let effects: { [effect in EffectTypes]?: boolean } = {};

  for (const effect in userStreamEffects.current) {
    const effectType = effect as keyof typeof userStreamEffects.current;
    for (const kind in userStreamEffects.current[effectType]) {
      const kindType = kind as "webcam" | "screen";
      for (const kindId in userStreamEffects.current[effectType][kindType]) {
        if (kindId === id) {
          if (userStreamEffects.current[effectType][kindType]![id]) {
            effects[effectType] = true;
          }
        }
      }
    }
  }

  let finalTrack: MediaStreamTrack | undefined;
  if (Object.keys(effects).length !== 0) {
    // Setup WebGL context
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // Shaders
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform float u_blurRadius;
      uniform vec2 u_textureSize;

      void main() {
        vec4 color = vec4(0.0);
        float total = 0.0;

        const int MAX_RADIUS = 16;

        for (int x = -MAX_RADIUS; x <= MAX_RADIUS; x++) {
          for (int y = -MAX_RADIUS; y <= MAX_RADIUS; y++) {
            if (abs(float(x)) <= u_blurRadius && abs(float(y)) <= u_blurRadius) {
              vec2 offset = vec2(float(x), float(y)) / u_textureSize;
              color += texture2D(u_image, v_texCoord + offset);
              total += 1.0;
            }
          }
        }

        gl_FragColor = color / total;
      }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );
    if (!vertexShader) {
      console.error("no vertexshader");
      return;
    }
    if (!fragmentShader) {
      console.error("no fragmenthsader");
      return;
    }
    const program = createProgram(gl, vertexShader, fragmentShader);

    if (!program) {
      console.error("no program");
      return;
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
      console.error("no texture");
      return;
    }

    // Render Loop
    const blurRadiusLocation = gl.getUniformLocation(program, "u_blurRadius");
    const textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");

    if (!blurRadiusLocation || !textureSizeLocation) {
      console.error("no blurRadiusLocation or textureSizeLocation");
      return;
    }

    // Start video and render loop
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
        blurRadiusLocation,
        textureSizeLocation,
        canvas
      );
    });
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      video.play();
    };

    // Capture final track
    finalTrack = canvas.captureStream().getVideoTracks()[0];
  }

  if (type === "webcam" || type === "screen") {
    if (finalTrack) {
      userStreams.current[type][id] = new MediaStream([finalTrack]);
    } else if (userUneffectedStreams.current[type][id]) {
      userStreams.current[type][id] = userUneffectedStreams.current[type][id];
      delete userUneffectedStreams.current[type][id];
    }
  } else if (type === "audio") {
    if (finalTrack) {
      userStreams.current[type] = new MediaStream([finalTrack]);
    } else if (userUneffectedStreams.current[type]) {
      userStreams.current[type] = userUneffectedStreams.current[type];
      delete userUneffectedStreams.current[type];
    }
  }

  finalTrack = finalTrack
    ? finalTrack
    : type === "webcam" || type === "screen"
    ? userStreams.current[type][id].getTracks()[0]
    : type === "audio"
    ? userStreams.current[type]?.getTracks()[0]
    : undefined;

  if (finalTrack) {
    const params = {
      track: finalTrack,
      appData: {
        producerType: type,
        producerDirection: "swap",
        producerId: id,
      },
    };

    try {
      await producerTransport.current.produce(params);
    } catch (error) {
      console.error("Transport failed to produce: ", error);
      return;
    }
  }
};

export default handleEffect2;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("no shader");
    return;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed with: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram();
  if (!program) {
    console.error("no program from createProgram");
    return;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program failed to link: " + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

// Texture
function createAndSetupTexture(gl: WebGLRenderingContext) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

function updateTexture(
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  video: HTMLVideoElement
) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
}

function render(
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  video: HTMLVideoElement,
  blurRadiusLocation: WebGLUniformLocation,
  textureSizeLocation: WebGLUniformLocation,
  canvas: HTMLCanvasElement
) {
  updateTexture(gl, texture, video);
  gl.uniform1f(blurRadiusLocation, 8.0);
  gl.uniform2f(textureSizeLocation, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(() =>
    render(gl, texture, video, blurRadiusLocation, textureSizeLocation, canvas)
  );
}
