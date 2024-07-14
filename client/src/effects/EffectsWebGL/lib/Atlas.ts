import { URLsTypes } from "../handleEffectWebGL";
import { getNextTexturePosition } from "./handleTexturePosition";

class Atlas {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private atlasCanvas: HTMLCanvasElement | null = null;
  private atlasContext: CanvasRenderingContext2D | null = null;

  private atlasImages: { [URLType in URLsTypes]?: string } | undefined =
    undefined;
  private altasImageURLMap: {
    url: string;
    row: number;
    col: number;
  }[] = [];

  private atlasTexture: WebGLTexture | null = null;
  private atlasSize: number | null = null;
  private atlasImagesSize = 512;
  private atlasTextureZPosition = 0.5;

  constructor(
    gl: WebGL2RenderingContext | WebGLRenderingContext,
    atlasTextureZPosition?: number
  ) {
    this.gl = gl;
    if (atlasTextureZPosition) {
      this.atlasTextureZPosition = atlasTextureZPosition;
    }
  }

  async createAtlas(
    atlasImages: { [URLType in URLsTypes]?: string },
    uAtlasTextureLocation: WebGLUniformLocation | null
  ) {
    this.atlasImages = atlasImages;

    const textureCount = Object.keys(this.atlasImages).length;

    if (textureCount === 0) {
      return;
    }

    this.altasImageURLMap = [];

    // Activate texture based on position
    const texturePosition = getNextTexturePosition();
    if (texturePosition instanceof Error) {
      console.error(texturePosition);
      return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + texturePosition);

    // Set up texture
    this.atlasTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlasTexture);
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

    let atlasSideLength = Math.ceil(Math.sqrt(textureCount));
    if (atlasSideLength === 1) {
      atlasSideLength = 2;
    }
    this.atlasSize = Math.pow(
      2,
      Math.ceil(Math.log2(atlasSideLength * this.atlasImagesSize))
    );
    atlasSideLength = this.atlasSize / this.atlasImagesSize;

    this.atlasCanvas = document.createElement("canvas");
    this.atlasCanvas.width = this.atlasSize;
    this.atlasCanvas.height = this.atlasSize;
    this.atlasContext = this.atlasCanvas.getContext("2d");

    if (!this.atlasContext) {
      throw new Error("Unable to create canvas 2D context.");
    }

    // Load images in the atlas
    await this.loadImages(atlasSideLength);

    const atlasImage = this.atlasContext.getImageData(
      0,
      0,
      this.atlasSize,
      this.atlasSize
    );

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.atlasSize,
      this.atlasSize,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      atlasImage.data
    );

    // Set uniform
    this.gl.uniform1i(uAtlasTextureLocation, texturePosition);
  }

  private loadImage(
    url: string
  ): Promise<{ img: HTMLImageElement; url: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve({ img, url });
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  }

  private async loadImages(atlasSideLength: number) {
    if (this.atlasImages === undefined) {
      return;
    }

    const images = await Promise.all(
      Object.values(this.atlasImages).map(this.loadImage)
    );

    images.forEach((image, index) => {
      const row = Math.floor(index / atlasSideLength);
      const col = index % atlasSideLength;
      this.atlasContext?.drawImage(
        image.img,
        col * this.atlasImagesSize,
        row * this.atlasImagesSize,
        this.atlasImagesSize,
        this.atlasImagesSize
      );
      this.altasImageURLMap.push({ url: image.url, row, col });
    });
  }

  getAtlasTexture() {
    return this.atlasTexture;
  }

  getTextureByURL(url: string) {
    return this.altasImageURLMap.find((entry) => entry.url === url);
  }

  getAtlasSize() {
    return this.atlasSize;
  }

  getAtlasImagesSize() {
    return this.atlasImagesSize;
  }

  getAtlasTextureZPosition() {
    return this.atlasTextureZPosition;
  }
}

export default Atlas;
