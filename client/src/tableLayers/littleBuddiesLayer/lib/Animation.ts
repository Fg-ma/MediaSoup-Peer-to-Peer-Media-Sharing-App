export type AnimationListenerTypes = onAnimationNoLoopFinihsedType;

export type onAnimationNoLoopFinihsedType = {
  type: "animationNoLoopFinihsed";
};

class Animation {
  private frames: number[];
  private frameDuration: number | null;
  private totalDuration: number | null;
  private elapsedTime = 0;

  private listeners: Set<(message: AnimationListenerTypes) => void> = new Set();

  constructor(
    frames: number[],
    frameDuration: number | null,
    private loop = true,
  ) {
    this.frames = frames;
    this.frameDuration = frameDuration;
    this.totalDuration =
      frameDuration !== null ? frames.length * frameDuration : frameDuration;
  }

  update(dt: number) {
    if (this.totalDuration === null) return;
    this.elapsedTime += dt;
    if (!this.loop && this.elapsedTime >= this.totalDuration) {
      this.elapsedTime = this.totalDuration - 1e-8;
      this.listeners.forEach((listener) => {
        listener({
          type: "animationNoLoopFinihsed",
        });
      });
    } else if (this.loop) {
      this.elapsedTime %= this.totalDuration;
    }
  }

  getCurrentFrame(): number {
    if (this.frameDuration === null) return this.frames[0];

    const frameCount = this.frames.length;
    let idx = Math.floor(this.elapsedTime / this.frameDuration);

    return this.frames[
      this.loop ? idx % frameCount : Math.min(idx, frameCount - 1)
    ];
  }

  reset() {
    this.elapsedTime = 0;
  }

  addAnimationListener = (
    listener: (message: AnimationListenerTypes) => void,
  ): void => {
    this.listeners.add(listener);
  };

  removeDownloadListener = (
    listener: (message: AnimationListenerTypes) => void,
  ): void => {
    this.listeners.delete(listener);
  };
}

export default Animation;
