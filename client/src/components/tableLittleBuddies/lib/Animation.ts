class Animation {
  private frames: number[];
  private frameDuration: number;
  private totalDuration: number;
  private elapsedTime = 0;

  constructor(
    frames: number[],
    frameDuration: number,
    private loop = true,
  ) {
    this.frames = frames;
    this.frameDuration = frameDuration;
    this.totalDuration = frames.length * frameDuration;
  }

  update(dt: number) {
    this.elapsedTime += dt;
    if (!this.loop && this.elapsedTime >= this.totalDuration) {
      this.elapsedTime = this.totalDuration - 1e-8;
    } else if (this.loop) {
      this.elapsedTime %= this.totalDuration;
    }
  }

  getCurrentFrame(): number {
    const frameCount = this.frames.length;
    let idx = Math.floor(this.elapsedTime / this.frameDuration);

    return this.frames[
      this.loop ? idx % frameCount : Math.min(idx, frameCount - 1)
    ];
  }

  reset() {
    this.elapsedTime = 0;
  }
}

export default Animation;
