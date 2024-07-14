import { EffectTypes } from "src/context/StreamsContext";
import baseFragmentShaderSource from "./baseFragmentShader";
import baseVertexShaderSource from "./baseVertexShader";
import { mat4, vec3 } from "gl-matrix";
import { URLsTypes } from "../handleEffectWebGL";
import Atlas from "./Atlas";

interface MeshJSON {
  vertex_faces: number[];
  uv_faces: number[];
}

class BaseShader {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private program: WebGLProgram | null = null;

  private VERTEX_SHADER = baseVertexShaderSource;
  private FRAGMENT_SHADER = baseFragmentShaderSource;

  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  private meshes: { meshData?: MeshJSON; meshURL: string }[] = [
    { meshURL: "/3DAssets/mustaches/mustacheData.json" },
  ];

  private videoTexture: WebGLTexture | null = null;
  private videoTextureZPosition = 0.99;

  private twoDimAtlas: Atlas | null = null;
  private threeDimAtlas: Atlas | null = null;

  // Uniform Locations
  private uTexSize: WebGLUniformLocation | null = null;
  private uVideoTextureLocation: WebGLUniformLocation | null = null;
  private uTwoDimEffectAtlasTextureLocation: WebGLUniformLocation | null = null;
  private uThreeDimEffectAtlasTextureLocation: WebGLUniformLocation | null =
    null;
  private uEffectFlagsLocation: WebGLUniformLocation | null = null;
  private uTintColorLocation: WebGLUniformLocation | null = null;

  // Attribute locations
  private aPositionLocation: number | null = null;
  private aTexCoordLocation: number | null = null;

  private effectFlags: number = 0;
  private VIDEO_BIT = 0;
  private TWO_DIMENSIONAL_EFFECTS_BIT = 1;
  private MESH_BIT = 2;
  private BLUR_BIT = 3;
  private TINT_BIT = 4;

  constructor(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    effects: {
      [effectType in EffectTypes]?: boolean | undefined;
    }
  ) {
    this.gl = gl;
    this.initShaderProgram();
    this.initUniformLocations();
    this.initAttributeLocations();
    this.initBuffers();
    this.initVideoTexture();
    this.initEffectFlags(effects);
  }

  deconstructor() {
    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }

    if (this.positionBuffer) {
      this.gl.deleteBuffer(this.positionBuffer);
      this.positionBuffer = null;
    }

    if (this.texCoordBuffer) {
      this.gl.deleteBuffer(this.texCoordBuffer);
      this.texCoordBuffer = null;
    }

    // Clear attribute locations
    this.aPositionLocation = null;
    this.aTexCoordLocation = null;
  }

  private initShaderProgram() {
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
  }

  private loadShader(type: number, source: string): WebGLShader | null {
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
  }

  private initUniformLocations() {
    if (!this.program) {
      return;
    }

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
  }

  private initAttributeLocations() {
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
  }

  private initBuffers() {
    // Setup static buffers for position and texCoord and index
    this.positionBuffer = this.gl.createBuffer();

    this.texCoordBuffer = this.gl.createBuffer();

    this.indexBuffer = this.gl.createBuffer();
  }

  private initVideoTexture() {
    this.use();

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
  }

  private initEffectFlags(effects: {
    [effectType in EffectTypes]?: boolean | undefined;
  }) {
    if (effects.blur) this.effectFlags |= 1 << this.BLUR_BIT;
    if (effects.tint) this.effectFlags |= 1 << this.TINT_BIT;

    this.gl.uniform1i(this.uEffectFlagsLocation, this.effectFlags);
  }

  private switchTextureFlag(textureBit: number) {
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
  }

  private async loadMeshJSON(url: string): Promise<MeshJSON | undefined> {
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
  }

  private hexToRgb(hex: string) {
    hex = hex.replace(/^#/, "");

    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    return [r, g, b];
  }

  // Method to use the shader program
  use() {
    if (this.program) {
      this.gl.useProgram(this.program);
    }
  }

  async createAtlasTexture(
    type: "twoDim" | "threeDim",
    atlasImages: { [URLType in URLsTypes]?: string }
  ) {
    this.use();

    if (type === "twoDim") {
      this.twoDimAtlas = new Atlas(this.gl);
      await this.twoDimAtlas.createAtlas(
        atlasImages,
        this.uTwoDimEffectAtlasTextureLocation
      );
    } else if (type === "threeDim") {
      this.threeDimAtlas = new Atlas(this.gl);
      await this.threeDimAtlas.createAtlas(
        atlasImages,
        this.uThreeDimEffectAtlasTextureLocation
      );
    }
  }

  drawEffect(
    url: string,
    position: { x: number; y: number },
    offset: { x: number; y: number },
    scale: number,
    headRotationAngle: number
  ) {
    if (
      this.aPositionLocation === null ||
      this.aTexCoordLocation === null ||
      this.twoDimAtlas === null
    ) {
      return;
    }

    this.use();

    // Switch the texture used in the fragment shader
    this.switchTextureFlag(this.TWO_DIMENSIONAL_EFFECTS_BIT);

    // Get atlas attributes
    const atlasSize = this.twoDimAtlas.getAtlasSize();
    const atlasImagesSize = this.twoDimAtlas.getAtlasImagesSize();
    const atlasTextureZPosition = this.twoDimAtlas.getAtlasTextureZPosition();
    if (atlasSize === null) {
      return;
    }

    this.gl.uniform2f(this.uTexSize, atlasSize, atlasSize);

    const texture = this.twoDimAtlas.getTextureByURL(url);

    let texCoords;
    if (texture) {
      texCoords = new Float32Array([
        (texture.col * atlasImagesSize) / atlasSize,
        (texture.row * atlasImagesSize) / atlasSize,
        (texture.col * atlasImagesSize) / atlasSize,
        ((texture.row + 1) * atlasImagesSize) / atlasSize,
        ((texture.col + 1) * atlasImagesSize) / atlasSize,
        (texture.row * atlasImagesSize) / atlasSize,
        ((texture.col + 1) * atlasImagesSize) / atlasSize,
        ((texture.row + 1) * atlasImagesSize) / atlasSize,
      ]);
    }

    if (!texCoords) {
      console.error("Failed to get texCoords");
      return;
    }

    // Bind the texCoord buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(
      this.aTexCoordLocation,
      2,
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
      this.gl.STATIC_DRAW
    );

    // Define vertices for a square plane before applying rotation
    const baseVertices = new Float32Array([
      -scale * 2,
      scale * 3,
      atlasTextureZPosition, // Vertex 1
      -scale * 2,
      -scale * 3,
      atlasTextureZPosition, // Vertex 2
      scale * 2,
      scale * 3,
      atlasTextureZPosition, // Vertex 3
      scale * 2,
      -scale * 3,
      atlasTextureZPosition, // Vertex 4
    ]);

    // Calculate the rotation matrix
    const cosAngle = Math.cos(headRotationAngle);
    const sinAngle = Math.sin(headRotationAngle);

    // Apply the rotation matrix to the vertices
    const vertices = new Float32Array(12); // 4 vertices * 3 components (x, y, z)
    for (let i = 0; i < 4; i++) {
      const x = baseVertices[i * 3];
      const y = baseVertices[i * 3 + 1];
      vertices[i * 3] = cosAngle * x - sinAngle * y + position.x + offset.x;
      vertices[i * 3 + 1] = sinAngle * x + cosAngle * y + position.y + offset.y;
      vertices[i * 3 + 2] = baseVertices[i * 3 + 2]; // z remains unchanged
    }

    // Bind the position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    // Draw the square using the element array buffer
    this.gl.drawElements(
      this.gl.TRIANGLES,
      indices.length,
      this.gl.UNSIGNED_SHORT,
      0
    );
  }

  updateVideoTexture(video: HTMLVideoElement) {
    if (this.aPositionLocation === null || this.aTexCoordLocation == null) {
      return;
    }

    this.use();

    this.switchTextureFlag(this.VIDEO_BIT);

    this.gl.uniform2f(
      this.uTexSize,
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    const positions = new Float32Array([
      -1.0,
      1.0,
      this.videoTextureZPosition, // vertex 1
      -1.0,
      -1.0,
      this.videoTextureZPosition, // vertex 2
      1.0,
      1.0,
      this.videoTextureZPosition, // vertex 3
      1.0,
      -1.0,
      this.videoTextureZPosition, // vertex 4
    ]);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      3,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    const texCoords = new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
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
      video
    );

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  async drawMesh(
    texUrl: string,
    jsonUrl: string,
    position: { x: number; y: number },
    offset: { x: number; y: number },
    scale: number,
    headRotationAngle: number,
    headYawAngle: number
  ) {
    if (
      this.aPositionLocation === null ||
      this.aTexCoordLocation === null ||
      this.threeDimAtlas === null
    ) {
      return;
    }

    this.use();

    let currentMeshData: MeshJSON | undefined = undefined;
    for (let i = 0; i < this.meshes.length; i++) {
      const mesh = this.meshes[i];
      if (mesh.meshURL === jsonUrl) {
        if (!mesh.meshData) {
          this.meshes[i].meshData = await this.loadMeshJSON(mesh.meshURL);
        }
        currentMeshData = this.meshes[i].meshData;
        break;
      }
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

    const texture = this.threeDimAtlas.getTextureByURL(texUrl);
    if (texture === undefined) {
      return;
    }

    // Create 3D rotation matrix
    const rotationMatrix = mat4.create();
    mat4.fromYRotation(rotationMatrix, headYawAngle); // Rotation about the y-axis (yaw)
    mat4.rotateZ(rotationMatrix, rotationMatrix, headRotationAngle); // Rotation about the z-axis

    const vertices = [];
    const meshData = currentMeshData;

    if (!meshData) {
      return;
    }

    // Apply the rotation matrix to the vertices
    for (let i = 0; i < meshData.vertex_faces.length / 3; i++) {
      const x = meshData.vertex_faces[i * 3];
      const y = meshData.vertex_faces[i * 3 + 1];
      const z = meshData.vertex_faces[i * 3 + 2];

      const rotated = vec3.create();
      vec3.transformMat4(rotated, [x, y, z], rotationMatrix);

      // Apply scale and translation
      const finalX = rotated[0] * scale + position.x + offset.x;
      const finalY = rotated[1] * scale + position.y + offset.y;
      const finalZ = rotated[2]; // Z-coordinate remains unchanged

      vertices.push(finalX, finalY, finalZ);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      this.gl.STATIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
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
        u * (atlasImagesSize / atlasSize) + texture.col * atlasImagesSize;
      const transformedV =
        v * (atlasImagesSize / atlasSize) + texture.col * atlasImagesSize;

      atlasUVs.push(transformedU, transformedV);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(atlasUVs),
      this.gl.STATIC_DRAW
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
      this.gl.STATIC_DRAW
    );

    // Draw the mesh
    this.gl.drawElements(
      this.gl.TRIANGLES,
      indices.length,
      this.gl.UNSIGNED_SHORT,
      0
    );
  }

  setTintColor(tintColor: string) {
    this.gl.uniform3fv(this.uTintColorLocation, this.hexToRgb(tintColor));
  }
}

export default BaseShader;
