import { getNextTexturePosition } from "./handleTexturePosition";

class Atlas {
  private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private atlasCanvas: HTMLCanvasElement | null = null;
  private atlasContext: CanvasRenderingContext2D | null = null;

  private atlasImages:
    | { [URLType: string]: { url: string; size: number } }
    | undefined = undefined;
  altasImageURLMap: {
    url: string;
    top: number;
    left: number;
    size: number;
  }[] = [];

  private atlasTexture: WebGLTexture | null = null;
  private uAtlasTextureLocation: WebGLUniformLocation | null = null;
  private atlasSize: number | null = null;
  private texturePosition: number | undefined = undefined;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
  }

  deconstructor() {
    // Delete WebGL texture
    if (this.atlasTexture) {
      this.gl.deleteTexture(this.atlasTexture);
      this.atlasTexture = null;
    }

    // Clear the canvas and its context
    if (this.atlasCanvas) {
      this.atlasCanvas.remove();
    }
    this.atlasContext = null;
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

  private async loadImages() {
    if (this.atlasImages === undefined || this.atlasSize === null) {
      return;
    }

    // Calculate total width and height needed for the atlas
    let currentHeight = 0;
    let currentWidth = 0;

    // Load images and calculate their placement in the atlas
    for (const [key, { url, size }] of Object.entries(this.atlasImages)) {
      const image = await this.loadImage(url);
      const img = image.img;

      // Ensure the current width + the image width doesn't exceed the atlas size
      if (currentWidth + size > this.atlasSize) {
        // Move to the next row
        currentHeight += size;
        currentWidth = 0;
      }

      // Draw the image on the canvas at the current position
      this.atlasContext?.drawImage(
        img,
        currentWidth,
        currentHeight,
        size,
        size // Keep the aspect ratio
      );

      // Store the image position
      this.altasImageURLMap.push({
        url: url,
        top: currentHeight,
        left: currentWidth,
        size,
      });

      // Update current width for the next image
      currentWidth += size;
    }
  }

  async createAtlas(
    atlasImages: { [URLType in string]: { url: string; size: number } },
    uAtlasTextureLocation: WebGLUniformLocation | null
  ) {
    this.atlasImages = atlasImages;
    this.uAtlasTextureLocation = uAtlasTextureLocation;

    this.altasImageURLMap = [];

    // Activate texture based on position
    const texturePosition = getNextTexturePosition();
    if (texturePosition instanceof Error) {
      console.error(texturePosition);
      return;
    }
    this.texturePosition = texturePosition;
    this.gl.activeTexture(this.gl.TEXTURE0 + this.texturePosition);

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

    // Calculate the required atlas size based on total images size
    let totalWidth = 256;
    let totalHeight = 256;
    if (Object.keys(this.atlasImages).length > 0) {
      totalWidth = Math.max(
        ...Object.values(this.atlasImages).map((img) => img.size)
      );
      totalHeight = Object.values(this.atlasImages).length * totalWidth; // This might need to be adjusted based on your layout requirements.
    }

    // Ensure the atlas size is a power of two
    this.atlasSize = Math.pow(
      2,
      Math.ceil(Math.log2(Math.max(totalWidth, totalHeight)))
    );

    this.atlasCanvas = document.createElement("canvas");
    this.atlasCanvas.width = this.atlasSize;
    this.atlasCanvas.height = this.atlasSize;
    this.atlasContext = this.atlasCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!this.atlasContext) {
      throw new Error("Unable to create canvas 2D context.");
    }

    // Load images in the atlas
    await this.loadImages();

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
    this.gl.uniform1i(this.uAtlasTextureLocation, texturePosition);
  }

  async updateAtlas(atlasImages: {
    [URLType in string]: { url: string; size: number };
  }) {
    if (!this.texturePosition || !this.atlasContext || !this.atlasCanvas) {
      return;
    }

    this.atlasImages = atlasImages;
    const textureCount = Object.keys(this.atlasImages).length;

    if (textureCount === 0) {
      return;
    }

    this.altasImageURLMap = [];

    // Activate the texture
    this.gl.activeTexture(this.gl.TEXTURE0 + this.texturePosition);

    // Delete the old texture if it exists
    if (this.atlasTexture !== undefined) {
      this.gl.deleteTexture(this.atlasTexture);
      this.atlasTexture = null;
    }

    // Set up a new texture
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
      this.gl.LINEAR_MIPMAP_LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );

    // Enable pre-multiplied alpha
    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    // Recalculate atlas size and canvas dimensions
    let currentHeight = 0;
    let currentWidth = 0;
    let maxHeight = 0; // Keep track of the tallest image in the current row

    // Calculate the size of the atlas and placement of images
    for (const { size } of Object.values(this.atlasImages)) {
      currentWidth += size;
      maxHeight = Math.max(maxHeight, size);
      // If the current width exceeds the atlas size, move to the next row
      if (currentWidth > (this.atlasSize ?? 0)) {
        currentHeight += maxHeight; // Move down by the tallest image
        currentWidth = size; // Start new row with the current image
        maxHeight = size; // Reset maxHeight for the new row
      }
    }

    // Update the atlasSize to ensure it fits all images
    this.atlasSize = Math.pow(
      2,
      Math.ceil(Math.log2(currentHeight + maxHeight))
    );

    // Set the new canvas dimensions
    this.atlasCanvas.width = this.atlasSize;
    this.atlasCanvas.height = this.atlasSize;

    // Use the loadImages function to load and draw images on the canvas
    await this.loadImages();

    // Get the image data from the canvas
    const atlasImage = this.atlasContext.getImageData(
      0,
      0,
      this.atlasSize,
      this.atlasSize
    );

    // Upload the image data to the texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlasTexture);
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

    // Generate mipmaps
    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    // Set the uniform to bind the texture to the shader
    this.gl.uniform1i(this.uAtlasTextureLocation, this.texturePosition);
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
}

export default Atlas;
