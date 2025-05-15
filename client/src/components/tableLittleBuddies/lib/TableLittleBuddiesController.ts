import Animation from "./Animation";
import SpriteSheet from "./SpriteSheet";
import {
  coreAnimations,
  CoreSpriteAnimationsTypes,
  OptionalSpriteAnimationsTypes,
  spirteSheetsMeta,
  SpriteType,
} from "./typeConstant";

class TableLittleBuddiesController {
  private activeDirs = new Set<"up" | "down" | "left" | "right">();
  private sprinting = false;
  private prevDir:
    | "left"
    | "right"
    | "up"
    | "down"
    | "leftUp"
    | "leftDown"
    | "rightUp"
    | "rightDown" = "left";

  constructor(
    private tableLittleBuddiesContainer: React.RefObject<HTMLDivElement>,
    private canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    private spriteSheet: React.MutableRefObject<SpriteSheet | null>,
    private lastTimeRef: React.MutableRefObject<number>,
    private sprite: React.MutableRefObject<SpriteType | null>,
  ) {}

  init = async () => {
    if (!this.tableLittleBuddiesContainer.current) return;

    const positioning = {
      position: { top: 50, left: 50 },
      scale: {
        x:
          (spirteSheetsMeta["horse"].frameWidth /
            this.tableLittleBuddiesContainer.current.clientWidth) *
          100,
        y:
          (spirteSheetsMeta["horse"].frameHeight /
            this.tableLittleBuddiesContainer.current.clientHeight) *
          100,
      },
      rotation: 0,
      flip: false,
    };

    const img = await this.loadImage(spirteSheetsMeta["horse"].url);
    const sheet = new SpriteSheet(
      img,
      spirteSheetsMeta["horse"].frameWidth,
      spirteSheetsMeta["horse"].frameHeight,
    );
    this.spriteSheet.current = sheet;

    if (
      spirteSheetsMeta["horse"].animations.core.idle.alt &&
      spirteSheetsMeta["horse"].animations.alt.run
    ) {
      const idleCore = new Animation(
        spirteSheetsMeta["horse"].animations.core.idle.core,
        0.2,
      );
      const idleAlt1 = new Animation(
        spirteSheetsMeta["horse"].animations.core.idle.alt.alt1,
        0.2,
      );
      const idleAlt2 = new Animation(
        spirteSheetsMeta["horse"].animations.core.idle.alt.alt2,
        0.2,
      );
      const walkCore = new Animation(
        spirteSheetsMeta["horse"].animations.core.walk.core,
        0.1,
      );
      const runCore = new Animation(
        spirteSheetsMeta["horse"].animations.alt.run.core,
        0.1,
      );

      this.sprite.current = {
        positioning,
        animations: {
          currentAnimation: "idle",
          coreAnimations: {
            walk: { core: walkCore },
            idle: { core: idleCore, alt: { alt1: idleAlt1, alt2: idleAlt2 } },
          },
          optionalAnimations: {
            run: {
              core: runCore,
            },
          },
        },
      };
    }

    requestAnimationFrame(this.gameLoop);
  };

  private loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => console.log("bad");
      img.src = src;
    });
  };

  gameLoop = (timestamp: number) => {
    if (
      !this.canvasRef.current ||
      !this.spriteSheet.current ||
      !this.sprite.current
    )
      return;

    const ctx = this.canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (this.lastTimeRef.current === 0) {
      this.lastTimeRef.current = timestamp;
    }

    const dt = (timestamp - this.lastTimeRef.current) / 1000;
    this.lastTimeRef.current = timestamp;

    ctx.clearRect(
      0,
      0,
      this.canvasRef.current.width,
      this.canvasRef.current.height,
    );

    const coreAnimation = coreAnimations.includes(
      this.sprite.current.animations.currentAnimation,
    );
    const currentAnimation = coreAnimation
      ? this.sprite.current.animations.coreAnimations[
          this.sprite.current.animations
            .currentAnimation as CoreSpriteAnimationsTypes
        ].core
      : this.sprite.current.animations.optionalAnimations[
          this.sprite.current.animations
            .currentAnimation as OptionalSpriteAnimationsTypes
        ]?.core;

    if (!currentAnimation) return;

    currentAnimation.update(dt);
    const frameIndex = currentAnimation.getCurrentFrame();
    this.spriteSheet.current.drawFrame(ctx, frameIndex, 0, 0);

    if (
      this.sprite.current.animations.currentAnimation === "run" ||
      this.sprite.current.animations.currentAnimation === "walk"
    ) {
      this.move();
    }

    requestAnimationFrame(this.gameLoop);
  };

  private updateMovement() {
    if (!this.sprite.current) return;

    if (this.activeDirs.size === 0) {
      if (this.sprite.current.animations.currentAnimation !== "idle") {
        this.sprite.current.animations.currentAnimation = "idle";
        this.sprite.current.animations.coreAnimations.idle.core.reset();
      }
      return;
    }

    // choose run vs walk animation
    const animationType = this.sprinting ? "run" : "walk";
    const isCore = animationType === "walk";
    const animations = this.sprite.current.animations;
    if (animations.currentAnimation !== animationType) {
      animations.currentAnimation = animationType;
      const animation = isCore
        ? animations.coreAnimations.walk.core
        : animations.optionalAnimations.run!.core;
      animation.reset();
    }
  }

  private move = () => {
    if (!this.canvasRef.current || !this.sprite.current) return;

    // movement step
    const meta = spirteSheetsMeta["horse"];
    const speed = this.sprinting ? meta.runSpeed : meta.walkSpeed;

    const moveCount = this.activeDirs.size;
    const norm = moveCount > 1 ? Math.SQRT1_2 : 1;

    let dx = 0;
    let dy = 0;
    if (this.activeDirs.has("up")) dy -= speed * norm;
    if (this.activeDirs.has("down")) dy += speed * norm;
    if (this.activeDirs.has("left")) dx -= speed * norm;
    if (this.activeDirs.has("right")) dx += speed * norm;

    if (dx > 0 && dy > 0) {
      this.sprite.current.positioning.rotation = 45;
      this.sprite.current.positioning.flip = true;
      this.prevDir = "leftDown";
    } else if (dx > 0 && dy < 0) {
      this.sprite.current.positioning.rotation = -45;
      this.sprite.current.positioning.flip = true;
      this.prevDir = "leftUp";
    } else if (dx < 0 && dy > 0) {
      this.sprite.current.positioning.rotation = -45;
      this.sprite.current.positioning.flip = false;
      this.prevDir = "rightDown";
    } else if (dx < 0 && dy < 0) {
      this.sprite.current.positioning.rotation = 45;
      this.sprite.current.positioning.flip = false;
      this.prevDir = "rightUp";
    } else if (dx === 0 && dy > 0) {
      if (this.prevDir !== "down") {
        this.sprite.current.positioning.rotation =
          this.prevDir === "right" ||
          this.prevDir === "rightDown" ||
          this.prevDir === "rightUp"
            ? 90
            : -90;
        this.sprite.current.positioning.flip =
          this.prevDir === "right" ||
          this.prevDir === "rightDown" ||
          this.prevDir === "rightUp";
        this.prevDir = "down";
      }
    } else if (dx === 0 && dy < 0) {
      if (this.prevDir !== "up") {
        this.sprite.current.positioning.rotation =
          this.prevDir === "right" ||
          this.prevDir === "rightDown" ||
          this.prevDir === "rightUp"
            ? -90
            : 90;
        this.sprite.current.positioning.flip =
          this.prevDir === "right" ||
          this.prevDir === "rightDown" ||
          this.prevDir === "rightUp";
        this.prevDir = "up";
      }
    } else if (dx > 0 && dy === 0) {
      this.sprite.current.positioning.rotation = 0;
      this.sprite.current.positioning.flip = true;
      this.prevDir = "right";
    } else if (dx < 0 && dy === 0) {
      this.sprite.current.positioning.rotation = 0;
      this.sprite.current.positioning.flip = false;
      this.prevDir = "left";
    }

    const pos = this.sprite.current.positioning.position;
    this.sprite.current.positioning.position = {
      top: pos.top + dy,
      left: pos.left + dx,
    };

    this.canvasRef.current.style.width = `${this.sprite.current.positioning.scale.x}%`;
    this.canvasRef.current.style.height = `${this.sprite.current.positioning.scale.y}%`;
    this.canvasRef.current.style.top = `${this.sprite.current.positioning.position.top}%`;
    this.canvasRef.current.style.left = `${this.sprite.current.positioning.position.left}%`;
    this.canvasRef.current.style.transform = `rotate(${this.sprite.current.positioning.rotation}deg) scaleX(${this.sprite.current.positioning.flip ? "-1" : "1"})`;
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;

    const key = event.key.toLowerCase();

    this.sprinting = event.shiftKey;

    switch (key) {
      case "w":
        this.activeDirs.add("up");
        this.updateMovement();
        break;
      case "a":
        this.activeDirs.add("left");
        this.updateMovement();
        break;
      case "d":
        this.activeDirs.add("right");
        this.updateMovement();
        break;
      case "s":
        this.activeDirs.add("down");
        this.updateMovement();
        break;
      case "arrowup":
        this.activeDirs.add("up");
        this.updateMovement();
        break;
      case "arrowleft":
        this.activeDirs.add("left");
        this.updateMovement();
        break;
      case "arrowdown":
        this.activeDirs.add("down");
        this.updateMovement();
        break;
      case "arrowright":
        this.activeDirs.add("right");
        this.updateMovement();
        break;
      default:
        break;
    }

    this.updateMovement();
  };

  handleKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    this.sprinting = event.shiftKey;

    switch (key) {
      case "w":
        this.activeDirs.delete("up");
        this.updateMovement();
        break;
      case "a":
        this.activeDirs.delete("left");
        this.updateMovement();
        break;
      case "d":
        this.activeDirs.delete("right");
        this.updateMovement();
        break;
      case "s":
        this.activeDirs.delete("down");
        this.updateMovement();
        break;
      case "arrowup":
        this.activeDirs.delete("up");
        this.updateMovement();
        break;
      case "arrowleft":
        this.activeDirs.delete("left");
        this.updateMovement();
        break;
      case "arrowdown":
        this.activeDirs.delete("down");
        this.updateMovement();
        break;
      case "arrowright":
        this.activeDirs.delete("right");
        this.updateMovement();
        break;
      default:
        break;
    }
  };
}

export default TableLittleBuddiesController;
