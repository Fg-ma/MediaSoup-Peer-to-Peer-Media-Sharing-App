import React, { useEffect, useRef, useState } from "react";

interface SpriteSheetProps {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
}

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

class Animation {
  frames: number[];
  frameDuration: number;
  loop: boolean;
  private timer: number = 0;
  private currentFrame: number = 0;

  constructor(frames: number[], frameDuration: number, loop: boolean = true) {
    this.frames = frames;
    this.frameDuration = frameDuration;
    this.loop = loop;
  }

  update(dt: number) {
    this.timer += dt;
    if (this.timer >= this.frameDuration) {
      this.timer = 0;
      this.currentFrame++;
      if (this.currentFrame >= this.frames.length) {
        this.currentFrame = this.loop ? 0 : this.frames.length - 1;
      }
    }
  }

  getCurrentFrame(): number {
    return this.frames[this.currentFrame];
  }

  reset() {
    this.currentFrame = 0;
    this.timer = 0;
  }
}

export default function TableLittleBuddies() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState<Animation | null>(
    null,
  );
  const [spriteSheet, setSpriteSheet] = useState<SpriteSheet | null>(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    // Initialize sprite sheet and animations
    const init = async () => {
      const img = await loadImage("sprite-sheet.png"); // Replace with your sprite sheet path
      const sheet = new SpriteSheet(img, 64, 64); // Adjust frame size
      setSpriteSheet(sheet);

      const idleAnimation = new Animation([0, 1, 2, 3], 0.2);
      const runAnimation = new Animation([4, 5, 6, 7], 0.1);

      // Set default animation
      setCurrentAnimation(idleAnimation);

      // Key event listeners to switch animations
      window.addEventListener("keydown", (e) => {
        if (e.key === "r") {
          setCurrentAnimation(runAnimation);
          runAnimation.reset();
        } else if (e.key === "i") {
          setCurrentAnimation(idleAnimation);
          idleAnimation.reset();
        }
      });
    };

    init();

    return () => {
      window.removeEventListener("keydown", () => {});
    };
  }, []);

  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!canvasRef.current || !spriteSheet || !currentAnimation) return;

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      currentAnimation.update(dt);
      const frameIndex = currentAnimation.getCurrentFrame();
      spriteSheet.drawFrame(ctx, frameIndex, 300, 200); // Draw frame at (300, 200)

      requestAnimationFrame(gameLoop);
    };

    if (spriteSheet && currentAnimation) {
      requestAnimationFrame(gameLoop);
    }
  }, [currentAnimation, spriteSheet]);

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
}
