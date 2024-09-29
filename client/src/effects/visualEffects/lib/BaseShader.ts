import { NormalizedLandmarkList } from "@mediapipe/face_mesh";
import { mat4, vec3 } from "gl-matrix";
import { Delaunay } from "d3-delaunay";
import {
  CameraEffectTypes,
  ScreenEffectTypes,
} from "../../../context/StreamsContext";
import baseFragmentShaderSource from "./baseFragmentShader";
import baseVertexShaderSource from "./baseVertexShader";
import Atlas from "./Atlas";
import videoPaused from "../../../../public/2DAssets/videoPaused.png";
import videoPausedFlipped from "../../../../public/2DAssets/videoPausedFlipped.png";
import { assetData } from "../../../lib/CameraMedia";
import {
  BeardsEffectTypes,
  GlassesEffectTypes,
  HatsEffectTypes,
  MasksEffectTypes,
  MustachesEffectTypes,
  PetsEffectTypes,
} from "../../../context/CurrentEffectsStylesContext";

export interface MeshJSON {
  vertex_faces: number[];
  uv_faces: number[];
  normals: number[];
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

class BaseShader {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private program: WebGLProgram | null = null;

  private VERTEX_SHADER = baseVertexShaderSource;
  private FRAGMENT_SHADER = baseFragmentShaderSource;

  private positionBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  private twoDimAtlas: Atlas | null = null;
  private twoDimAltasTexMap: { [tex: string]: string } | undefined = undefined;

  private threeDimAtlas: Atlas | null = null;
  private threeDimAltasTexMap: { [tex: string]: string } | undefined =
    undefined;

  private videoTexture: WebGLTexture | null = null;
  private videoPausedImage: HTMLImageElement;
  private videoPausedFlippedImage: HTMLImageElement;
  private pause = false;

  // Uniform Locations
  private uTexSize: WebGLUniformLocation | null = null;
  private uVideoTextureLocation: WebGLUniformLocation | null = null;
  private uTwoDimEffectAtlasTextureLocation: WebGLUniformLocation | null = null;
  private uThreeDimEffectAtlasTextureLocation: WebGLUniformLocation | null =
    null;
  private uEffectFlagsLocation: WebGLUniformLocation | null = null;
  private uTintColorLocation: WebGLUniformLocation | null = null;
  private uLightDirectionLocation: WebGLUniformLocation | null = null;

  private uModelMatrixLocation: WebGLUniformLocation | null = null;
  private uViewMatrixLocation: WebGLUniformLocation | null = null;
  private uProjectionMatrixLocation: WebGLUniformLocation | null = null;

  // Attribute locations
  private aPositionLocation: number | null = null;
  private aTexCoordLocation: number | null = null;
  private aNormalLocation: number | null = null;

  private effectFlags: number = 0;
  private VIDEO_BIT = 0;
  private TWO_DIMENSIONAL_EFFECTS_BIT = 1;
  private MESH_BIT = 2;
  private BLUR_BIT = 3;
  private TINT_BIT = 4;

  // Lighting settings
  private lightDirection: [number, number, number] = [-1, -1, -1];

  // Camera settings
  private cameraPosition = vec3.fromValues(0, 0, 0);
  private cameraTarget = vec3.fromValues(0, 0, 0);
  private cameraUpDir = vec3.fromValues(0, 1, 0);
  private cameraFOV = Math.PI / 4;
  private cameraAspect: number;
  private nearClipPlane = 0.1;
  private farClipPlane = 100.0;

  private videoPositions: Float32Array;
  private videoTexCoords: Float32Array;
  private identityMatrix = mat4.create();

  constructor(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    effects: {
      [effectType in CameraEffectTypes | ScreenEffectTypes]?:
        | boolean
        | undefined;
    },
    lightDirection?: [number, number, number],
    cameraPosition?: vec3,
    cameraTarget?: vec3,
    cameraUpDir?: vec3,
    cameraFOV?: number,
    nearClipPlane?: number,
    farClipPlane?: number,
    pause?: boolean
  ) {
    this.gl = gl;
    this.cameraAspect = this.gl.canvas.width / this.gl.canvas.height;

    if (lightDirection) {
      this.lightDirection = lightDirection;
    }
    if (cameraPosition) {
      this.cameraPosition = cameraPosition;
    }
    if (cameraTarget) {
      this.cameraTarget = cameraTarget;
    }
    if (cameraUpDir) {
      this.cameraUpDir = cameraUpDir;
    }
    if (cameraFOV) {
      this.cameraFOV = cameraFOV;
    }
    if (nearClipPlane) {
      this.nearClipPlane = nearClipPlane;
    }
    if (farClipPlane) {
      this.farClipPlane = farClipPlane;
    }
    if (pause) {
      this.pause = pause;
    }

    this.videoPausedImage = document.createElement("img");
    this.videoPausedImage.src = videoPaused;
    this.videoPausedFlippedImage = document.createElement("img");
    this.videoPausedFlippedImage.src = videoPausedFlipped;

    this.initShaderProgram();
    this.initUniformLocations();
    this.initAttributeLocations();
    this.initLighting();
    this.initCamera();
    this.initBuffers();
    this.initVideoTexture();
    this.initEffectFlags(effects);

    const videoZDistance = 100.0;

    // Calculate the plane size based on the perspective projection
    const videoPlaneHeight =
      2.0 * Math.tan(this.cameraFOV / 2) * videoZDistance;
    const videoPlaneWidth = videoPlaneHeight * 2;

    // Define the plane's vertices in view space
    this.videoPositions = new Float32Array([
      -videoPlaneWidth / 2,
      videoPlaneHeight / 2,
      -videoZDistance, // Top-left
      -videoPlaneWidth / 2,
      -videoPlaneHeight / 2,
      -videoZDistance, // Bottom-left
      videoPlaneWidth / 2,
      videoPlaneHeight / 2,
      -videoZDistance, // Top-right
      videoPlaneWidth / 2,
      -videoPlaneHeight / 2,
      -videoZDistance, // Bottom-right
    ]);

    this.videoTexCoords = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]);
  }

  deconstructor = () => {
    // Delete WebGL program
    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }

    // Delete buffers
    if (this.positionBuffer) {
      this.gl.deleteBuffer(this.positionBuffer);
      this.positionBuffer = null;
    }
    if (this.normalBuffer) {
      this.gl.deleteBuffer(this.normalBuffer);
      this.normalBuffer = null;
    }
    if (this.texCoordBuffer) {
      this.gl.deleteBuffer(this.texCoordBuffer);
      this.texCoordBuffer = null;
    }
    if (this.indexBuffer) {
      this.gl.deleteBuffer(this.indexBuffer);
      this.indexBuffer = null;
    }

    // Delete textures
    if (this.videoTexture) {
      this.gl.deleteTexture(this.videoTexture);
      this.videoTexture = null;
    }

    // Delete atlases
    if (this.twoDimAtlas) {
      this.twoDimAtlas.deconstructor();
      this.twoDimAtlas = null;
    }
    if (this.threeDimAtlas) {
      this.threeDimAtlas.deconstructor();
      this.threeDimAtlas = null;
    }
  };

  private initShaderProgram = () => {
    const vertexShader = this.loadShader(
      this.gl.VERTEX_SHADER,
      this.VERTEX_SHADER
    );
    const fragmentShader = this.loadShader(
      this.gl.FRAGMENT_SHADER,
      this.FRAGMENT_SHADER
    );

    if (vertexShader && fragmentShader) {
      this.program = this.gl.createProgram();
      if (this.program) {
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
          console.error(
            "Unable to initialize the shader program: " +
              this.gl.getProgramInfoLog(this.program)
          );
          this.program = null;
        }
      }
    }

    this.use();
  };

  private loadShader = (type: number, source: string): WebGLShader | null => {
    const shader = this.gl.createShader(type);
    if (shader) {
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error(
          "An error occurred compiling the shaders: " +
            this.gl.getShaderInfoLog(shader)
        );
        this.gl.deleteShader(shader);
        return null;
      }
    }
    return shader;
  };

  private initUniformLocations = () => {
    if (!this.program) {
      return;
    }

    // Fragment shader uniforms
    this.uTexSize = this.gl.getUniformLocation(this.program, "u_texSize");
    this.uVideoTextureLocation = this.gl.getUniformLocation(
      this.program,
      "u_videoTexture"
    );
    this.uTwoDimEffectAtlasTextureLocation = this.gl.getUniformLocation(
      this.program,
      "u_twoDimEffectAtlasTexture"
    );
    this.uThreeDimEffectAtlasTextureLocation = this.gl.getUniformLocation(
      this.program,
      "u_threeDimEffectAtlasTexture"
    );
    this.uEffectFlagsLocation = this.gl.getUniformLocation(
      this.program,
      "u_effectFlags"
    );
    this.uTintColorLocation = this.gl.getUniformLocation(
      this.program,
      "u_tintColor"
    );
    this.uLightDirectionLocation = this.gl.getUniformLocation(
      this.program,
      "u_lightDirection"
    );

    // Vertex shader uniforms
    this.uModelMatrixLocation = this.gl.getUniformLocation(
      this.program,
      "u_modelMatrix"
    );
    this.uViewMatrixLocation = this.gl.getUniformLocation(
      this.program,
      "u_viewMatrix"
    );
    this.uProjectionMatrixLocation = this.gl.getUniformLocation(
      this.program,
      "u_projectionMatrix"
    );
  };

  private initLighting = () => {
    const length = Math.sqrt(
      this.lightDirection[0] ** 2 +
        this.lightDirection[1] ** 2 +
        this.lightDirection[2] ** 2
    );
    const normalizedLightDirection = this.lightDirection.map((x) => x / length);
    this.gl.uniform3fv(this.uLightDirectionLocation, normalizedLightDirection);
  };

  private initCamera = () => {
    // Create the view matrix
    const viewMatrix = mat4.create();
    mat4.lookAt(
      viewMatrix,
      this.cameraPosition,
      this.cameraTarget,
      this.cameraUpDir
    );

    // Create the projection matrix
    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      this.cameraFOV,
      this.cameraAspect,
      this.nearClipPlane,
      this.farClipPlane
    );

    // Use the matrices in your WebGL program
    this.gl.uniformMatrix4fv(this.uViewMatrixLocation, false, viewMatrix);
    this.gl.uniformMatrix4fv(
      this.uProjectionMatrixLocation,
      false,
      projectionMatrix
    );
  };

  private initAttributeLocations = () => {
    if (!this.program) {
      return;
    }

    this.aPositionLocation = this.gl.getAttribLocation(
      this.program,
      "a_position"
    );
    this.aTexCoordLocation = this.gl.getAttribLocation(
      this.program,
      "a_texCoord"
    );
    this.aNormalLocation = this.gl.getAttribLocation(this.program, "a_normal");
  };

  private initBuffers = () => {
    if (
      this.aPositionLocation === null ||
      this.aNormalLocation === null ||
      this.aTexCoordLocation === null
    ) {
      return;
    }

    // Setup static buffers for position and texCoord and index
    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.aPositionLocation);

    this.normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.vertexAttribPointer(
      this.aNormalLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.aNormalLocation);

    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.vertexAttribPointer(
      this.aTexCoordLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.aTexCoordLocation);

    this.indexBuffer = this.gl.createBuffer();
  };

  private initVideoTexture = () => {
    this.videoTexture = this.gl.createTexture();
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );

    this.gl.uniform1i(this.uVideoTextureLocation, 0);
  };

  private initEffectFlags = (effects: {
    [effectType in CameraEffectTypes | ScreenEffectTypes]?: boolean | undefined;
  }) => {
    if (effects.blur) this.effectFlags |= 1 << this.BLUR_BIT;
    if (effects.tint) this.effectFlags |= 1 << this.TINT_BIT;

    this.gl.uniform1i(this.uEffectFlagsLocation, this.effectFlags);
  };

  private switchTextureFlag = (textureBit: number) => {
    if (textureBit === this.VIDEO_BIT) {
      this.effectFlags |= 1 << this.VIDEO_BIT;
    } else {
      this.effectFlags &= ~(1 << this.VIDEO_BIT);
    }
    if (textureBit === this.TWO_DIMENSIONAL_EFFECTS_BIT) {
      this.effectFlags |= 1 << this.TWO_DIMENSIONAL_EFFECTS_BIT;
    } else {
      this.effectFlags &= ~(1 << this.TWO_DIMENSIONAL_EFFECTS_BIT);
    }
    if (textureBit === this.MESH_BIT) {
      this.effectFlags |= 1 << this.MESH_BIT;
    } else {
      this.effectFlags &= ~(1 << this.MESH_BIT);
    }

    this.gl.uniform1i(this.uEffectFlagsLocation, this.effectFlags);
  };

  private loadMeshJSON = async (url: string): Promise<MeshJSON | undefined> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return await response.json();
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return undefined;
    }
  };

  private getTriangles = (geometryPoints: Point3D[], uvPoints: number[]) => {
    const geometryDelaunay = Delaunay.from(
      geometryPoints,
      (p) => p.x,
      (p) => p.y
    );
    const geometryTrianglesIndices = geometryDelaunay.triangles;

    const numVertices = geometryPoints.length;
    const geometryTriangles: number[] = [];
    const uvTriangles: number[] = [];
    const vertexNormals: Float32Array = new Float32Array(numVertices * 3).fill(
      0
    );

    // Calculate face normals and accumulate them for vertex normals
    for (let i = 0; i < geometryTrianglesIndices.length; i += 3) {
      const index0 = geometryTrianglesIndices[i];
      const index1 = geometryTrianglesIndices[i + 1];
      const index2 = geometryTrianglesIndices[i + 2];

      const v0 = geometryPoints[index0];
      const v1 = geometryPoints[index1];
      const v2 = geometryPoints[index2];

      const edge1x = v1.x - v0.x;
      const edge1y = v1.y - v0.y;
      const edge1z = v1.z - v0.z;

      const edge2x = v2.x - v0.x;
      const edge2y = v2.y - v0.y;
      const edge2z = v2.z - v0.z;

      const normalX = edge1y * edge2z - edge1z * edge2y;
      const normalY = edge1z * edge2x - edge1x * edge2z;
      const normalZ = edge1x * edge2y - edge1y * edge2x;

      const length = Math.sqrt(
        normalX * normalX + normalY * normalY + normalZ * normalZ
      );
      const invLength = 1 / length;
      const normalizedNormalX = normalX * invLength;
      const normalizedNormalY = normalY * invLength;
      const normalizedNormalZ = normalZ * invLength;

      // Accumulate normals for vertices
      vertexNormals[index0 * 3] += normalizedNormalX;
      vertexNormals[index0 * 3 + 1] += normalizedNormalY;
      vertexNormals[index0 * 3 + 2] += normalizedNormalZ;

      vertexNormals[index1 * 3] += normalizedNormalX;
      vertexNormals[index1 * 3 + 1] += normalizedNormalY;
      vertexNormals[index1 * 3 + 2] += normalizedNormalZ;

      vertexNormals[index2 * 3] += normalizedNormalX;
      vertexNormals[index2 * 3 + 1] += normalizedNormalY;
      vertexNormals[index2 * 3 + 2] += normalizedNormalZ;

      // Store vertex positions
      geometryTriangles.push(
        v0.x,
        v0.y,
        v0.z,
        v1.x,
        v1.y,
        v1.z,
        v2.x,
        v2.y,
        v2.z
      );

      // Store UV coords
      uvTriangles.push(
        uvPoints[index0 * 2],
        uvPoints[index0 * 2 + 1],
        uvPoints[index1 * 2],
        uvPoints[index1 * 2 + 1],
        uvPoints[index2 * 2],
        uvPoints[index2 * 2 + 1]
      );
    }

    // Normalize vertex normals
    for (let i = 0; i < numVertices; i++) {
      const nx = vertexNormals[i * 3];
      const ny = vertexNormals[i * 3 + 1];
      const nz = vertexNormals[i * 3 + 2];
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const invLength = 1 / length;
      vertexNormals[i * 3] *= invLength;
      vertexNormals[i * 3 + 1] *= invLength;
      vertexNormals[i * 3 + 2] *= invLength;
    }

    // Flatten vertex normals into an array, repeating for each vertex in each triangle
    const normals: number[] = [];
    for (let i = 0; i < geometryTrianglesIndices.length; i++) {
      const vertexIndex = geometryTrianglesIndices[i];
      normals.push(
        -vertexNormals[vertexIndex * 3],
        -vertexNormals[vertexIndex * 3 + 1],
        vertexNormals[vertexIndex * 3 + 2]
      );
    }

    return { geometryTriangles, uvTriangles, normals };
  };

  private hexToRgb = (hex: string) => {
    hex = hex.replace(/^#/, "");

    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    return [r, g, b];
  };

  // Method to use the shader program
  use = () => {
    if (this.program) {
      this.gl.useProgram(this.program);
    }
  };

  createAtlasTexture = async (
    type: "twoDim" | "threeDim",
    atlasImages: { [URLType: string]: string }
  ) => {
    if (type === "twoDim") {
      this.twoDimAltasTexMap = atlasImages;
      this.twoDimAtlas = new Atlas(this.gl);
      await this.twoDimAtlas.createAtlas(
        atlasImages,
        this.uTwoDimEffectAtlasTextureLocation
      );
    } else if (type === "threeDim") {
      this.threeDimAltasTexMap = atlasImages;
      this.threeDimAtlas = new Atlas(this.gl);
      await this.threeDimAtlas.createAtlas(
        atlasImages,
        this.uThreeDimEffectAtlasTextureLocation
      );
    }
  };

  updateAtlasTexture = async (
    type: "twoDim" | "threeDim",
    atlasImages: { [URLType: string]: string }
  ) => {
    if (type === "twoDim") {
      this.twoDimAltasTexMap = atlasImages;
      this.twoDimAtlas?.updateAtlas(atlasImages);
    } else if (type === "threeDim") {
      this.threeDimAltasTexMap = atlasImages;
      this.threeDimAtlas?.updateAtlas(atlasImages);
    }
  };

  updateVideoTexture = (video: HTMLVideoElement, flip = false) => {
    if (this.aPositionLocation === null || this.aTexCoordLocation == null) {
      return;
    }

    this.switchTextureFlag(this.VIDEO_BIT);

    this.gl.uniform2f(
      this.uTexSize,
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    this.gl.uniformMatrix4fv(
      this.uModelMatrixLocation,
      false,
      this.identityMatrix
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.videoPositions,
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.videoTexCoords,
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aTexCoordLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.pause
        ? flip
          ? this.videoPausedImage
          : this.videoPausedFlippedImage
        : video
    );

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  };

  drawEffect = (
    effectType: string,
    position: { x: number; y: number },
    offset: { x: number; y: number },
    scale: number,
    headRotationAngle: number,
    headYawAngle: number,
    headPitchAngle: number
  ) => {
    if (
      this.aPositionLocation === null ||
      this.aTexCoordLocation === null ||
      this.twoDimAtlas === null
    ) {
      return;
    }

    // Switch the texture used in the fragment shader
    this.switchTextureFlag(this.TWO_DIMENSIONAL_EFFECTS_BIT);

    // Get atlas attributes
    const atlasSize = this.twoDimAtlas.getAtlasSize();
    const atlasImagesSize = this.twoDimAtlas.getAtlasImagesSize();
    if (atlasSize === null) {
      return;
    }

    this.gl.uniform2f(this.uTexSize, atlasSize, atlasSize);

    let tex: { url: string; row: number; col: number } | undefined;
    if (this.twoDimAltasTexMap && this.twoDimAltasTexMap[effectType]) {
      tex = this.twoDimAtlas.getTextureByURL(
        this.twoDimAltasTexMap[effectType]
      );

      if (!tex) {
        return;
      }
    } else {
      return;
    }

    let texCoords;
    texCoords = new Float32Array([
      (tex.col * atlasImagesSize) / atlasSize,
      (tex.row * atlasImagesSize) / atlasSize,
      (tex.col * atlasImagesSize) / atlasSize,
      ((tex.row + 1) * atlasImagesSize) / atlasSize,
      ((tex.col + 1) * atlasImagesSize) / atlasSize,
      (tex.row * atlasImagesSize) / atlasSize,
      ((tex.col + 1) * atlasImagesSize) / atlasSize,
      ((tex.row + 1) * atlasImagesSize) / atlasSize,
    ]);

    if (!texCoords) {
      console.error("Failed to get texCoords");
      return;
    }

    // Bind the texCoord buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.DYNAMIC_DRAW);
    this.gl.vertexAttribPointer(
      this.aTexCoordLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Define vertices for a square plane
    const baseVertices = new Float32Array([
      -1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0,
    ]);

    const zDistance = 95.0; // Distance from the camera

    // Calculate the plane size based on the perspective projection
    const planeSize = 2.0 * Math.tan(this.cameraFOV / 2) * zDistance;

    // Create 3D transformation matrix
    const transformMatrix = mat4.create();
    mat4.translate(transformMatrix, transformMatrix, [
      (position.x + offset.x) * planeSize,
      ((position.y + offset.y) * planeSize) / 2,
      -zDistance,
    ]); // Translate to position
    mat4.scale(transformMatrix, transformMatrix, [
      scale * planeSize * 2,
      scale * planeSize * 2,
      1,
    ]); // Scale
    mat4.rotateX(transformMatrix, transformMatrix, headPitchAngle); // Rotation about the x-axis (pitch)
    mat4.rotateY(transformMatrix, transformMatrix, headYawAngle); // Rotation about the y-axis (yaw)
    mat4.rotateZ(transformMatrix, transformMatrix, headRotationAngle); // Rotation about the z-axis

    this.gl.uniformMatrix4fv(this.uModelMatrixLocation, false, transformMatrix);

    // Bind the position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      baseVertices,
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Define indices for the square (two triangles)
    const indices = new Uint16Array([0, 1, 2, 2, 1, 3]);

    // Bind the index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      indices,
      this.gl.DYNAMIC_DRAW
    );

    // Draw the square using the element array buffer
    this.gl.drawElements(
      this.gl.TRIANGLES,
      indices.length,
      this.gl.UNSIGNED_SHORT,
      0
    );
  };

  drawMesh = async (
    meshType:
      | BeardsEffectTypes
      | GlassesEffectTypes
      | MustachesEffectTypes
      | MasksEffectTypes
      | HatsEffectTypes
      | PetsEffectTypes,
    position: { x: number; y: number },
    offset: { x: number; y: number },
    scale: number,
    headRotationAngle: number,
    headYawAngle: number,
    headPitchAngle: number
  ) => {
    if (
      this.aPositionLocation === null ||
      this.aTexCoordLocation === null ||
      this.aNormalLocation === null ||
      this.threeDimAtlas === null
    ) {
      return;
    }

    // Load mesh if it has already been load and return if no mesh url is found
    if (assetData.meshes[meshType]) {
      if (!assetData.meshes[meshType].data) {
        assetData.meshes[meshType].data = await this.loadMeshJSON(
          assetData.meshes[meshType].url
        );
      }
    } else {
      return;
    }

    // Switch the texture used in the fragment shader
    this.switchTextureFlag(this.MESH_BIT);

    // Get atlas attributes
    const atlasSize = this.threeDimAtlas.getAtlasSize();
    const atlasImagesSize = this.threeDimAtlas.getAtlasImagesSize();
    if (atlasSize === null) {
      return;
    }

    this.gl.uniform2f(this.uTexSize, atlasSize, atlasSize);

    let tex: { url: string; row: number; col: number } | undefined;
    if (this.threeDimAltasTexMap && this.threeDimAltasTexMap[meshType]) {
      tex = this.threeDimAtlas.getTextureByURL(
        this.threeDimAltasTexMap[meshType]
      );
      if (tex === undefined) {
        return;
      }
    } else {
      return;
    }

    const meshData = assetData.meshes[meshType].data;

    if (!meshData) {
      return;
    }

    const zDistance = 90.0;

    // Calculate the perspective size based on the perspective projection
    const perspectiveSize = 2.0 * Math.tan(this.cameraFOV / 2) * zDistance;

    // Create 3D transformation matrix
    const transformMatrix = mat4.create();
    mat4.translate(transformMatrix, transformMatrix, [
      (position.x + offset.x) * perspectiveSize,
      ((position.y + offset.y) * perspectiveSize) / 2,
      -zDistance,
    ]); // Translate to position
    mat4.scale(transformMatrix, transformMatrix, [
      (scale * perspectiveSize) / 1.5,
      (scale * perspectiveSize) / 2,
      1,
    ]); // Scale
    mat4.rotateX(transformMatrix, transformMatrix, headPitchAngle); // Rotation about the x-axis (pitch)
    mat4.rotateY(transformMatrix, transformMatrix, headYawAngle); // Rotation about the y-axis (yaw)
    mat4.rotateZ(transformMatrix, transformMatrix, headRotationAngle); // Rotation about the z-axis

    this.gl.uniformMatrix4fv(this.uModelMatrixLocation, false, transformMatrix);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(meshData.vertex_faces),
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(meshData.normals),
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aNormalLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    const atlasUVs = [];
    for (let i = 0; i < meshData.uv_faces.length / 2; i++) {
      const u = meshData.uv_faces[i * 2];
      const v = meshData.uv_faces[i * 2 + 1];

      const transformedU =
        u * (atlasImagesSize / atlasSize) + tex.col * atlasImagesSize;
      const transformedV =
        v * (atlasImagesSize / atlasSize) + tex.col * atlasImagesSize;

      atlasUVs.push(transformedU, transformedV);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(atlasUVs),
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aTexCoordLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    let indices = [];
    for (let i = 0; i < meshData.uv_faces.length / 2; i++) {
      indices.push(i);
    }

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.gl.DYNAMIC_DRAW
    );

    // Draw the mesh
    this.gl.drawElements(
      this.gl.TRIANGLES,
      indices.length,
      this.gl.UNSIGNED_SHORT,
      0
    );
  };

  drawFaceMesh = async (
    meshType:
      | BeardsEffectTypes
      | GlassesEffectTypes
      | MustachesEffectTypes
      | MasksEffectTypes
      | HatsEffectTypes
      | PetsEffectTypes,
    liveLandmarks: NormalizedLandmarkList
  ) => {
    if (
      this.aPositionLocation === null ||
      this.aNormalLocation === null ||
      this.aTexCoordLocation === null ||
      this.threeDimAtlas === null
    ) {
      return;
    }

    // Load uv mesh data
    if (assetData.meshes[meshType]) {
      if (!assetData.meshes[meshType].data) {
        assetData.meshes[meshType].data = await this.loadMeshJSON(
          assetData.meshes[meshType].url
        );
      }
    } else {
      return;
    }

    this.gl.uniformMatrix4fv(this.uModelMatrixLocation, false, mat4.create());

    // Switch the texture used in the fragment shader
    this.switchTextureFlag(this.MESH_BIT);

    // Get atlas attributes
    const atlasSize = this.threeDimAtlas.getAtlasSize();
    const atlasImagesSize = this.threeDimAtlas.getAtlasImagesSize();
    if (atlasSize === null) {
      return;
    }

    this.gl.uniform2f(this.uTexSize, atlasSize, atlasSize);

    let tex: { url: string; row: number; col: number } | undefined;
    if (this.threeDimAltasTexMap && this.threeDimAltasTexMap[meshType]) {
      tex = this.threeDimAtlas.getTextureByURL(
        this.threeDimAltasTexMap[meshType]
      );
      if (tex === undefined) {
        return;
      }
    } else {
      return;
    }

    // Get the triangles
    const { geometryTriangles, uvTriangles, normals } = this.getTriangles(
      liveLandmarks,
      assetData.meshes[meshType].data!.uv_faces
    );

    let index = 0;
    const positions: number[] = [];

    for (let i = 0; i < geometryTriangles.length; i += 9) {
      positions.push(
        geometryTriangles[i] * 2 - 1, // first x coord
        (1 - geometryTriangles[i + 1]) * 2 - 1, // first y coord
        geometryTriangles[i + 2], // first z coord
        geometryTriangles[i + 3] * 2 - 1, // second x coord
        (1 - geometryTriangles[i + 4]) * 2 - 1, // second y coord
        geometryTriangles[i + 5], // second z coord
        geometryTriangles[i + 6] * 2 - 1, // third x coord
        (1 - geometryTriangles[i + 7]) * 2 - 1, // third y coord
        geometryTriangles[i + 8] // third z coord
      );

      index += 3;
    }

    const zDistance = 85.0;

    // Calculate the plane size based on the perspective projection
    const perspectiveSize = 2.0 * Math.tan(this.cameraFOV / 2) * zDistance;

    // Create 3D transformation matrix
    const transformMatrix = mat4.create();
    mat4.translate(transformMatrix, transformMatrix, [0, 0, -zDistance]); // Translate to position
    mat4.scale(transformMatrix, transformMatrix, [
      perspectiveSize,
      perspectiveSize / 2,
      1,
    ]); // Scale

    this.gl.uniformMatrix4fv(this.uModelMatrixLocation, false, transformMatrix);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(normals),
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aNormalLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    const atlasUVs = [];
    for (let i = 0; i < uvTriangles.length / 2; i++) {
      const u = uvTriangles[i * 2];
      const v = uvTriangles[i * 2 + 1];

      const transformedU =
        u * (atlasImagesSize / atlasSize) + tex.col * atlasImagesSize;
      const transformedV =
        v * (atlasImagesSize / atlasSize) + tex.col * atlasImagesSize;

      atlasUVs.push(transformedU, transformedV);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(atlasUVs),
      this.gl.DYNAMIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aTexCoordLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(Array.from({ length: index }, (_, i) => i)),
      this.gl.DYNAMIC_DRAW
    );

    // Draw the mesh
    this.gl.drawElements(this.gl.TRIANGLES, index, this.gl.UNSIGNED_SHORT, 0);
  };

  setTintColor = (tintColor: string) => {
    this.gl.uniform3fv(this.uTintColorLocation, this.hexToRgb(tintColor));
  };

  toggleTintEffect = () => {
    if (!(this.effectFlags & (1 << this.TINT_BIT))) {
      this.effectFlags |= 1 << this.TINT_BIT;
    } else {
      this.effectFlags &= ~(1 << this.TINT_BIT);
    }

    this.gl.uniform1i(this.uEffectFlagsLocation, this.effectFlags);
  };

  toggleBlurEffect = () => {
    if (!(this.effectFlags & (1 << this.BLUR_BIT))) {
      this.effectFlags |= 1 << this.BLUR_BIT;
    } else {
      this.effectFlags &= ~(1 << this.BLUR_BIT);
    }

    this.gl.uniform1i(this.uEffectFlagsLocation, this.effectFlags);
  };

  setPause = (pause: boolean) => {
    this.pause = pause;
  };
}

export default BaseShader;
