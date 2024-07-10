import { EffectTypes } from "src/context/StreamsContext";
import {
  baseFragmentShaderSource,
  baseFragmentShaderSource2,
} from "./baseFragmentShader";
import {
  baseVertexShaderSource,
  baseVertexShaderSource2,
} from "./baseVertexShader";

class BaseShader {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private program: WebGLProgram | null = null;

  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;

  private VERTEX_SHADER = baseVertexShaderSource;
  private FRAGMENT_SHADER = baseFragmentShaderSource;

  // Uniform locations
  private uLiveVideoImageLocation: WebGLUniformLocation | null = null;
  private uTextureSizeLocation: WebGLUniformLocation | null = null;
  private uFaceCountLocation: WebGLUniformLocation | null = null;
  private uEffectFlagsLocation: WebGLUniformLocation | null = null;
  private uTintColorLocation: WebGLUniformLocation | null = null;
  private uEffectTextureAtlasLocation: WebGLUniformLocation | null = null;
  private uEffectAspectRatiosLocation: WebGLUniformLocation | null = null;
  private uPositionsOffsetsTextureLocation: WebGLUniformLocation | null = null;
  private uWidthsHeadRotationAnglesTextureLocation: WebGLUniformLocation | null =
    null;

  // Attribute locations
  private aPositionLocation: number | null = null;
  private aTexCoordLocation: number | null = null;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
    this.initShaderProgram();
    this.initUniformLocations();
    this.initAttributeLocations();
    this.initBuffers();
  }

  deconstructor() {
    if (this.program) {
      const attachedShaders = this.gl.getAttachedShaders(this.program);
      if (attachedShaders) {
        for (const shader of attachedShaders) {
          this.gl.detachShader(this.program, shader);
          this.gl.deleteShader(shader);
        }
      }
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

    // Clear uniform and attribute locations
    this.uLiveVideoImageLocation = null;
    this.uTextureSizeLocation = null;
    this.uFaceCountLocation = null;
    this.uEffectFlagsLocation = null;
    this.uTintColorLocation = null;
    this.uEffectTextureAtlasLocation = null;
    this.uEffectAspectRatiosLocation = null;
    this.uPositionsOffsetsTextureLocation = null;
    this.uWidthsHeadRotationAnglesTextureLocation = null;
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
    if (this.program) {
      this.uLiveVideoImageLocation = this.gl.getUniformLocation(
        this.program,
        "u_liveVideoImage"
      );
      this.uTextureSizeLocation = this.gl.getUniformLocation(
        this.program,
        "u_textureSize"
      );
      this.uFaceCountLocation = this.gl.getUniformLocation(
        this.program,
        "u_faceCount"
      );
      this.uEffectFlagsLocation = this.gl.getUniformLocation(
        this.program,
        "u_effectFlags"
      );
      this.uTintColorLocation = this.gl.getUniformLocation(
        this.program,
        "u_tintColor"
      );
      this.uEffectTextureAtlasLocation = this.gl.getUniformLocation(
        this.program,
        "u_effectTextureAtlas"
      );
      this.uEffectAspectRatiosLocation = this.gl.getUniformLocation(
        this.program,
        "u_effectAspectRatios"
      );
      this.uPositionsOffsetsTextureLocation = this.gl.getUniformLocation(
        this.program,
        "u_positionsOffsetsTexture"
      );
      this.uWidthsHeadRotationAnglesTextureLocation =
        this.gl.getUniformLocation(
          this.program,
          "u_widthsHeadRotationAnglesTexture"
        );
    }
  }

  private initAttributeLocations() {
    if (this.program) {
      this.aPositionLocation = this.gl.getAttribLocation(
        this.program,
        "a_position"
      );
      this.aTexCoordLocation = this.gl.getAttribLocation(
        this.program,
        "a_texCoord"
      );
    }
  }

  private initBuffers() {
    if (this.aPositionLocation === null || this.aTexCoordLocation == null) {
      console.error("An error occurred while initializing the buffers");
      return;
    }

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      this.gl.STATIC_DRAW
    );
    this.gl.vertexAttribPointer(
      this.aPositionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.aPositionLocation);

    this.texCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]),
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
    this.gl.enableVertexAttribArray(this.aTexCoordLocation);
  }

  // Method to use the shader program
  use() {
    if (this.program) {
      this.gl.useProgram(this.program);
    }
  }

  // Method to create a blank plane
  drawBlankPlanes() {}

  // Getter methods for uniform locations (if needed)
  get liveVideoImageLocation() {
    return this.uLiveVideoImageLocation;
  }

  get textureSizeLocation() {
    return this.uTextureSizeLocation;
  }

  get faceCountLocation() {
    return this.uFaceCountLocation;
  }

  get effectFlagsLocation() {
    return this.uEffectFlagsLocation;
  }

  get tintColorLocation() {
    return this.uTintColorLocation;
  }

  get effectTextureAtlasLocation() {
    return this.uEffectTextureAtlasLocation;
  }

  get effectAspectRatiosLocation() {
    return this.uEffectAspectRatiosLocation;
  }

  get positionsOffsetsTextureLocation() {
    return this.uPositionsOffsetsTextureLocation;
  }

  get widthsHeadRotationAnglesTextureLocation() {
    return this.uWidthsHeadRotationAnglesTextureLocation;
  }

  get positionLocation() {
    return this.aPositionLocation;
  }

  get texCoordLocation() {
    return this.aTexCoordLocation;
  }

  get getPositionBuffer() {
    return this.positionBuffer;
  }

  get getTexCoordBuffer() {
    return this.texCoordBuffer;
  }
}

class BaseShader2 {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private program: WebGLProgram | null = null;

  private VERTEX_SHADER = baseVertexShaderSource2;
  private FRAGMENT_SHADER = baseFragmentShaderSource2;

  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  private videoTexture: WebGLTexture | null = null;

  private twoDimensionalEffectsAtlasTexture: WebGLTexture | null = null;
  private twoDimensionalAltasURLMap: {
    url: string;
    row: number;
    col: number;
  }[] = [];
  private twoDimensionalEffectsAtlasSize: number | null = null;
  private twoDimensionalEffectsTextureSize: number = 512;

  // Uniform Locations
  private uTwoDimensionalEffectAtlasTextureLocation: WebGLUniformLocation | null =
    null;
  private uVideoTextureLocation: WebGLUniformLocation | null = null;
  private uUseVideoTextureLocation: WebGLUniformLocation | null = null;
  private uEffectFlagsLocation: WebGLUniformLocation | null = null;
  private uTintColorLocation: WebGLUniformLocation | null = null;

  // Attribute locations
  private aPositionLocation: number | null = null;
  private aTexCoordLocation: number | null = null;

  private BLUR_EFFECT = 0;
  private TINT_EFFECT = 1;

  constructor(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    effects: {
      [effectType in EffectTypes]?: boolean | undefined;
    },
    tintColor: string
  ) {
    this.gl = gl;
    this.initShaderProgram();
    this.initUniformLocations();
    this.initAttributeLocations();
    this.initBuffers();
    this.initVideoTexture();

    let effectFlags = 0;

    if (effects.blur) effectFlags |= 1 << this.BLUR_EFFECT;
    if (effects.tint) effectFlags |= 1 << this.TINT_EFFECT;

    gl.uniform1i(this.uEffectFlagsLocation, effectFlags);

    const tintColorVector = this.hexToRgb(tintColor);
    gl.uniform3fv(this.uTintColorLocation, tintColorVector);
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

    this.uTwoDimensionalEffectAtlasTextureLocation = this.gl.getUniformLocation(
      this.program,
      "u_twoDimensionalEffectAtlasTexture"
    );
    this.uVideoTextureLocation = this.gl.getUniformLocation(
      this.program,
      "u_videoTexture"
    );
    this.uUseVideoTextureLocation = this.gl.getUniformLocation(
      this.program,
      "u_useVideoTexture"
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

  createAtlasTexture = async (urls: string[], textureSize?: number) => {
    this.use();

    this.twoDimensionalAltasURLMap = [];

    if (textureSize) {
      this.twoDimensionalEffectsTextureSize = textureSize;
    }

    this.twoDimensionalEffectsAtlasTexture = this.gl.createTexture();
    this.gl.bindTexture(
      this.gl.TEXTURE_2D,
      this.twoDimensionalEffectsAtlasTexture
    );
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

    const textureCount = urls.length;
    let atlasSide = Math.ceil(Math.sqrt(textureCount));
    this.twoDimensionalEffectsAtlasSize = Math.pow(
      2,
      Math.ceil(Math.log2(atlasSide * this.twoDimensionalEffectsTextureSize))
    );
    atlasSide =
      this.twoDimensionalEffectsAtlasSize /
      this.twoDimensionalEffectsTextureSize;

    const atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = this.twoDimensionalEffectsAtlasSize;
    atlasCanvas.height = this.twoDimensionalEffectsAtlasSize;
    const atlasContext = atlasCanvas.getContext("2d");

    if (!atlasContext) {
      throw new Error("Unable to create canvas 2D context.");
    }

    const loadImage = (
      url: string
    ): Promise<{ img: HTMLImageElement; url: string }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve({ img, url });
        img.onerror = (error) => reject(error);
        img.src = url;
      });
    };

    const images = await Promise.all(urls.map(loadImage));
    images.forEach((image, index) => {
      const row = Math.floor(index / atlasSide);
      const col = index % atlasSide;
      atlasContext.drawImage(
        image.img,
        col * this.twoDimensionalEffectsTextureSize,
        row * this.twoDimensionalEffectsTextureSize,
        this.twoDimensionalEffectsTextureSize,
        this.twoDimensionalEffectsTextureSize
      );
      this.twoDimensionalAltasURLMap.push({ url: image.url, row, col });
    });

    const atlasImage = atlasContext.getImageData(
      0,
      0,
      this.twoDimensionalEffectsAtlasSize,
      this.twoDimensionalEffectsAtlasSize
    );

    this.gl.bindTexture(
      this.gl.TEXTURE_2D,
      this.twoDimensionalEffectsAtlasTexture
    );
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.twoDimensionalEffectsAtlasSize,
      this.twoDimensionalEffectsAtlasSize,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      atlasImage.data
    );

    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(
      this.gl.TEXTURE_2D,
      this.twoDimensionalEffectsAtlasTexture
    );
    this.gl.uniform1i(this.uTwoDimensionalEffectAtlasTextureLocation, 1);
  };

  drawEffect(
    url: string,
    position: { x: number; y: number },
    offset: { x: number; y: number },
    scale: number,
    headRotationAngle: number
  ) {
    if (this.aPositionLocation === null || this.aTexCoordLocation === null) {
      return;
    }

    this.use();

    this.gl.uniform1i(this.uUseVideoTextureLocation, 0);

    const texture = this.twoDimensionalAltasURLMap.find(
      (entry) => entry.url === url
    );

    let texCoords;
    if (texture && this.twoDimensionalEffectsAtlasSize !== null) {
      texCoords = new Float32Array([
        (texture.col * this.twoDimensionalEffectsTextureSize) /
          this.twoDimensionalEffectsAtlasSize,
        (texture.row * this.twoDimensionalEffectsTextureSize) /
          this.twoDimensionalEffectsAtlasSize,
        (texture.col * this.twoDimensionalEffectsTextureSize) /
          this.twoDimensionalEffectsAtlasSize,
        ((texture.row + 1) * this.twoDimensionalEffectsTextureSize) /
          this.twoDimensionalEffectsAtlasSize,
        ((texture.col + 1) * this.twoDimensionalEffectsTextureSize) /
          this.twoDimensionalEffectsAtlasSize,
        (texture.row * this.twoDimensionalEffectsTextureSize) /
          this.twoDimensionalEffectsAtlasSize,
        ((texture.col + 1) * this.twoDimensionalEffectsTextureSize) /
          this.twoDimensionalEffectsAtlasSize,
        ((texture.row + 1) * this.twoDimensionalEffectsTextureSize) /
          this.twoDimensionalEffectsAtlasSize,
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

    // Define vertices for a square before applying rotation
    const baseVertices = new Float32Array([
      -scale * 2,
      scale * 3,
      0.0, // Vertex 1
      -scale * 2,
      -scale * 3,
      0.0, // Vertex 2
      scale * 2,
      scale * 3,
      0.0, // Vertex 3
      scale * 2,
      -scale * 3,
      0.0, // Vertex 4
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

    this.gl.uniform1i(this.uUseVideoTextureLocation, 1);

    const positions = new Float32Array([
      -1.0, 1.0, 0.99, -1.0, -1.0, 0.99, 1.0, 1.0, 0.99, 1.0, -1.0, 0.99,
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
}

export { BaseShader, BaseShader2 };
