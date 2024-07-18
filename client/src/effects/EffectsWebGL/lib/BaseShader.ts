import { NormalizedLandmarkList } from "@mediapipe/face_mesh";
import { mat4, vec3 } from "gl-matrix";
import { Delaunay } from "d3-delaunay";
import { EffectTypes } from "src/context/StreamsContext";
import baseFragmentShaderSource from "./baseFragmentShader";
import baseVertexShaderSource from "./baseVertexShader";
import Atlas from "./Atlas";

interface MeshJSON {
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

  private meshes:
    | {
        [meshes: string]: {
          meshData?: MeshJSON;
          meshURL: string;
        };
      }
    | undefined;

  private twoDimAltasTexMap: { [tex: string]: string } | undefined = undefined;

  private threeDimAltasTexMap: { [tex: string]: string } | undefined =
    undefined;

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
  private uLightDirectionLocation: WebGLUniformLocation | null = null;

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

  constructor(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    effects: {
      [effectType in EffectTypes]?: boolean | undefined;
    },
    meshes?: {
      [meshes: string]: {
        meshData?: MeshJSON;
        meshURL: string;
      };
    }
  ) {
    this.gl = gl;
    this.meshes = meshes;
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

    this.use();
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
    this.uLightDirectionLocation = this.gl.getUniformLocation(
      this.program,
      "u_lightDirection"
    );
    const lightDirection = [-1, -1, -1];
    const length = Math.sqrt(
      lightDirection[0] ** 2 + lightDirection[1] ** 2 + lightDirection[2] ** 2
    );
    const normalizedLightDirection = lightDirection.map((x) => x / length);
    this.gl.uniform3fv(this.uLightDirectionLocation, normalizedLightDirection);
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
    this.aNormalLocation = this.gl.getAttribLocation(this.program, "a_normal");
  }

  private initBuffers() {
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

  private getTriangles(geometryPoints: Point3D[], uvPoints: number[]) {
    const geometryDelaunay = Delaunay.from(
      geometryPoints,
      (p) => p.x,
      (p) => p.y
    );
    const geometryTrianglesIndices = geometryDelaunay.triangles;

    const geometryTriangles: number[] = [];
    const uvTriangles: number[] = [];
    const normals: number[] = [];
    const faceNormals: Point3D[] = [];
    const vertexNormals: Point3D[] = Array(
      geometryTrianglesIndices.length
    ).fill({
      x: 0,
      y: 0,
      z: 0,
    });

    for (let i = 0; i < geometryTrianglesIndices.length; i += 3) {
      const index0 = geometryTrianglesIndices[i];
      const index1 = geometryTrianglesIndices[i + 1];
      const index2 = geometryTrianglesIndices[i + 2];

      const v0 = geometryPoints[index0];
      const v1 = geometryPoints[index1];
      const v2 = geometryPoints[index2];

      const edge1 = {
        x: v1.x - v0.x,
        y: v1.y - v0.y,
        z: v1.z - v0.z,
      };
      const edge2 = {
        x: v2.x - v0.x,
        y: v2.y - v0.y,
        z: v2.z - v0.z,
      };

      const normal = {
        x: edge1.y * edge2.z - edge1.z * edge2.y,
        y: edge1.z * edge2.x - edge1.x * edge2.z,
        z: edge1.x * edge2.y - edge1.y * edge2.x,
      };

      const length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
      const normalizedNormal = {
        x: normal.x / length,
        y: normal.y / length,
        z: normal.z / length,
      };
      faceNormals.push(normalizedNormal);

      // Accumulate the face normals for each vertex
      vertexNormals[index0].x += normalizedNormal.x;
      vertexNormals[index0].y += normalizedNormal.y;
      vertexNormals[index0].z += normalizedNormal.z;
      vertexNormals[index1].x += normalizedNormal.x;
      vertexNormals[index1].y += normalizedNormal.y;
      vertexNormals[index1].z += normalizedNormal.z;
      vertexNormals[index2].x += normalizedNormal.x;
      vertexNormals[index2].y += normalizedNormal.y;
      vertexNormals[index2].z += normalizedNormal.z;

      if (v0 && v1 && v2) {
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
      }
      if (
        uvPoints[index0] !== undefined &&
        uvPoints[index1] !== undefined &&
        uvPoints[index2] !== undefined
      ) {
        uvTriangles.push(
          uvPoints[index0 * 2],
          uvPoints[index0 * 2 + 1],

          uvPoints[index1 * 2],
          uvPoints[index1 * 2 + 1],

          uvPoints[index2 * 2],
          uvPoints[index2 * 2 + 1]
        );
      }
    }

    // Normalize the accumulated normals for each vertex
    for (let i = 0; i < geometryPoints.length; i++) {
      const length = Math.sqrt(
        vertexNormals[i].x ** 2 +
          vertexNormals[i].y ** 2 +
          vertexNormals[i].z ** 2
      );
      vertexNormals[i].x /= length;
      vertexNormals[i].y /= length;
      vertexNormals[i].z /= length;
    }

    // Convert vertex normals to normals array
    for (const normal of vertexNormals) {
      normals.push(normal.x, normal.y, normal.z);
    }

    return { geometryTriangles, uvTriangles, normals };
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
    atlasImages: { [URLType: string]: string }
  ) {
    this.use();

    if (type === "twoDim") {
      this.twoDimAltasTexMap = atlasImages;
      this.twoDimAtlas = new Atlas(this.gl, 0.98);
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
  }

  drawEffect(
    effectType: string,
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

    // Define indices for the square (two triangles)
    const indices = new Uint16Array([0, 1, 2, 2, 1, 3]);

    // Bind the index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      indices,
      this.gl.DYNAMIC_DRAW
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
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.DYNAMIC_DRAW);
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
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.DYNAMIC_DRAW);
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
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.DYNAMIC_DRAW);
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
    meshType: string,
    position: { x: number; y: number },
    offset: { x: number; y: number },
    scale: number,
    headRotationAngle: number,
    headYawAngle: number,
    headPitchAngle: number
  ) {
    if (
      this.aPositionLocation === null ||
      this.aTexCoordLocation === null ||
      this.aNormalLocation === null ||
      this.threeDimAtlas === null
    ) {
      return;
    }

    this.use();

    // Load mesh if it has already been load and return if no mesh url is found
    if (this.meshes && this.meshes[meshType]) {
      if (!this.meshes[meshType].meshData) {
        this.meshes[meshType].meshData = await this.loadMeshJSON(
          this.meshes[meshType].meshURL
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

    // Create 3D rotation matrix
    const rotationMatrix = mat4.create();
    mat4.rotateX(rotationMatrix, rotationMatrix, headPitchAngle); // Rotation about the x-axis (pitch)
    mat4.rotateY(rotationMatrix, rotationMatrix, headYawAngle); // Rotation about the y-axis (yaw)
    mat4.rotateZ(rotationMatrix, rotationMatrix, headRotationAngle); // Rotation about the z-axis

    const vertices: number[] = [];
    const normals: number[] = [];
    const meshData = this.meshes[meshType].meshData;

    if (!meshData) {
      return;
    }

    // Apply the rotation matrix to the vertices and normals
    for (let i = 0; i < meshData.vertex_faces.length / 3; i++) {
      const x = meshData.vertex_faces[i * 3];
      const y = meshData.vertex_faces[i * 3 + 1];
      const z = meshData.vertex_faces[i * 3 + 2];

      const nx = meshData.normals[i * 3];
      const ny = meshData.normals[i * 3 + 1];
      const nz = meshData.normals[i * 3 + 2];

      const rotatedVertex = vec3.create();
      vec3.transformMat4(rotatedVertex, [x, y, z], rotationMatrix);

      const rotatedNormal = vec3.create();
      vec3.transformMat4(rotatedNormal, [nx, ny, nz], rotationMatrix);

      // Apply scale and translation
      const finalX = rotatedVertex[0] * scale + position.x + offset.x;
      const finalY = rotatedVertex[1] * scale + position.y + offset.y;
      const finalZ = rotatedVertex[2]; // Z-coordinate remains unchanged

      vertices.push(finalX, finalY, finalZ);
      normals.push(rotatedNormal[0], rotatedNormal[1], rotatedNormal[2]);
    }

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(vertices),
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
  }

  async drawFaceMesh(meshType: string, liveLandmarks: NormalizedLandmarkList) {
    if (
      this.aPositionLocation === null ||
      this.aNormalLocation === null ||
      this.aTexCoordLocation === null ||
      this.threeDimAtlas === null
    ) {
      return;
    }

    this.use();

    // Load uv mesh data
    if (this.meshes && this.meshes[meshType]) {
      if (!this.meshes[meshType].meshData) {
        this.meshes[meshType].meshData = await this.loadMeshJSON(
          this.meshes[meshType].meshURL
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

    // Get the triangles
    const { geometryTriangles, uvTriangles, normals } = this.getTriangles(
      liveLandmarks,
      this.meshes[meshType].meshData!.uv_faces
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

    // console.log(normalTriangles);
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
  }

  setTintColor(tintColor: string) {
    this.gl.uniform3fv(this.uTintColorLocation, this.hexToRgb(tintColor));
  }
}

export default BaseShader;
