class SpriteSheet {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;

  constructor(
    image: HTMLImageElement,
    frameWidth: number,
    frameHeight: number,
  ) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
  }

  drawFrame(
    ctx: CanvasRenderingContext2D,
    frameIndex: number,
    x: number,
    y: number,
  ) {
    const cols = this.image.width / this.frameWidth;
    const sx = (frameIndex % cols) * this.frameWidth;
    const sy = Math.floor(frameIndex / cols) * this.frameHeight;
    ctx.drawImage(
      this.image,
      sx,
      sy,
      this.frameWidth,
      this.frameHeight,
      x,
      y,
      this.frameWidth,
      this.frameHeight,
    );
  }
}

export default SpriteSheet;
