import Animation from "./Animation";
import SpriteSheet from "./SpriteSheet";
import {
  AltSpriteAnimationsTypes,
  coreAnimations,
  CoreSpriteAnimationsTypes,
  LittleBuddiesTypes,
  spirteSheetsMeta,
  SpriteAnimations,
  SpriteAnimationsTypes,
  SpriteType,
} from "./typeConstant";

class LittleBuddiesController {
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
    | "rightDown"
    | undefined = undefined;

  private idleTimeout: undefined | NodeJS.Timeout;

  constructor(
    private littleBuddy: LittleBuddiesTypes,
    private littleBuddiesContainer: React.RefObject<HTMLDivElement>,
    private canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
    private spriteSheet: React.MutableRefObject<SpriteSheet | null>,
    private lastTimeRef: React.MutableRefObject<number>,
    private sprite: React.MutableRefObject<SpriteType | null>,
  ) {}

  private newAnimation = (
    animations: SpriteAnimations,
    type: "core" | "alt",
    name: SpriteAnimationsTypes,
  ) => {
    // @ts-expect-error: trust me I know what i'm doing
    const meta = spirteSheetsMeta[this.littleBuddy].animations[type][name];
    const newCoreAnimation = new Animation(meta.core, meta.speed);

    const altMeta = meta.alt;
    const newAltAnimations: { [alt: string]: Animation } = {};
    if (altMeta) {
      for (const alt in altMeta) {
        const newAltAnimation = new Animation(
          altMeta[alt].animation,
          altMeta[alt].speed !== undefined ? altMeta[alt].speed : meta.speed,
          altMeta[alt].loop,
        );
        if (!altMeta[alt].loop)
          newAltAnimation.addAnimationListener(this.idleAltAnimationFinished);
        newAltAnimations[alt] = newAltAnimation;
      }
    }

    // @ts-expect-error: trust me I know what i'm doing
    animations[type === "core" ? "coreAnimations" : "altAnimations"][name] = {
      core: newCoreAnimation,
      ...(altMeta ? { alt: newAltAnimations } : {}),
    };
  };

  init = async () => {
    if (!this.littleBuddiesContainer.current) return;

    const meta = spirteSheetsMeta[this.littleBuddy];

    const positioning = {
      position: { top: 50, left: 50 },
      scale: {
        x:
          (meta.frameWidth / this.littleBuddiesContainer.current.clientWidth) *
          100,
        y:
          (meta.frameHeight /
            this.littleBuddiesContainer.current.clientHeight) *
          100,
      },
      rotation: 0,
      flip: false,
    };

    const img = await this.loadImage(meta.url);

    const sheet = new SpriteSheet(img, meta.frameWidth, meta.frameHeight);
    this.spriteSheet.current = sheet;

    const animations: SpriteAnimations = {
      currentAnimation: { core: "idle", alt: undefined },
      // @ts-expect-error: trust me I know what i'm doing
      coreAnimations: {},
      altAnimations: {},
    };

    for (const core in meta.animations.core) {
      this.newAnimation(animations, "core", core as SpriteAnimationsTypes);
    }
    for (const alt in meta.animations.alt) {
      this.newAnimation(animations, "alt", alt as SpriteAnimationsTypes);
    }

    this.sprite.current = {
      rotatable: meta.rotatable,
      flipTextures: meta.flipTextures,
      positioning,
      animations,
      active: false,
    };

    if (meta.pixelated && this.canvasRef.current) {
      this.canvasRef.current.style.imageRendering = "pixelated";
    }

    requestAnimationFrame(this.animationLoop);
  };

  private loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  };

  animationLoop = (timestamp: number) => {
    const ctx = this.canvasRef.current?.getContext("2d");

    if (
      !this.canvasRef.current ||
      !this.spriteSheet.current ||
      !this.sprite.current ||
      !ctx
    )
      return;

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
      this.sprite.current.animations.currentAnimation.core,
    );
    const currentAlt = this.sprite.current.animations.currentAnimation.alt;
    const currentAnimation = coreAnimation
      ? currentAlt
        ? this.sprite.current.animations.coreAnimations[
            this.sprite.current.animations.currentAnimation
              .core as CoreSpriteAnimationsTypes
          ].alt?.[currentAlt]
        : this.sprite.current.animations.coreAnimations[
            this.sprite.current.animations.currentAnimation
              .core as CoreSpriteAnimationsTypes
          ].core
      : currentAlt
        ? this.sprite.current.animations.altAnimations[
            this.sprite.current.animations.currentAnimation
              .core as AltSpriteAnimationsTypes
          ]?.alt?.[currentAlt]
        : this.sprite.current.animations.altAnimations[
            this.sprite.current.animations.currentAnimation
              .core as AltSpriteAnimationsTypes
          ]?.core;

    if (!currentAnimation) {
      requestAnimationFrame(this.animationLoop);
      return;
    }

    currentAnimation.update(dt);
    const frameIndex = currentAnimation.getCurrentFrame();
    this.spriteSheet.current.drawFrame(ctx, frameIndex, 0, 0);

    if (
      this.sprite.current.animations.currentAnimation.core === "run" ||
      this.sprite.current.animations.currentAnimation.core === "walk"
    ) {
      this.move();
    }
    if (this.sprite.current.animations.currentAnimation.core === "idle") {
      this.idle();
    } else {
      if (this.idleTimeout) {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = undefined;
      }
    }

    requestAnimationFrame(this.animationLoop);
  };

  private updateMovement() {
    if (!this.sprite.current) return;

    if (this.activeDirs.size === 0) {
      if (this.sprite.current.animations.currentAnimation.core !== "idle") {
        this.sprite.current.animations.currentAnimation.core = "idle";
        this.sprite.current.animations.currentAnimation.alt = undefined;
        this.sprite.current.animations.coreAnimations.idle.core.reset();
      }
      return;
    }

    // choose run vs walk animation
    const animations = this.sprite.current.animations;
    const animationType = this.sprinting
      ? animations.altAnimations.run
        ? "run"
        : "walk"
      : "walk";
    const isCore = animationType === "walk";
    if (animations.currentAnimation.core !== animationType) {
      animations.currentAnimation.core = animationType;
      const animation = isCore
        ? animations.coreAnimations.walk.core
        : animations.altAnimations.run!.core;
      this.sprite.current.animations.currentAnimation.alt = undefined;
      animation.reset();
    }
  }

  private move = () => {
    if (!this.canvasRef.current || !this.sprite.current) return;

    // movement step
    const meta = spirteSheetsMeta[this.littleBuddy];
    const speed = this.sprinting ? meta.runSpeed : meta.walkSpeed;

    const moveCount = this.activeDirs.size;
    const norm = moveCount > 1 ? Math.SQRT1_2 : 1;

    let dx = 0;
    let dy = 0;
    if (this.activeDirs.has("up")) dy -= speed * norm;
    if (this.activeDirs.has("down")) dy += speed * norm;
    if (this.activeDirs.has("left")) dx -= speed * norm;
    if (this.activeDirs.has("right")) dx += speed * norm;

    const currentDir = this.prevDir;

    if (this.sprite.current.rotatable) {
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
    } else {
      if (dx > 0) {
        if (this.prevDir !== "right") {
          this.sprite.current.positioning.flip = true;
          this.prevDir = "right";
        }
      } else if (dx < 0) {
        if (this.prevDir !== "left") {
          this.sprite.current.positioning.flip = false;
          this.prevDir = "left";
        }
      }
    }

    if (currentDir !== this.prevDir) {
      if (meta.flipTextures) {
        this.sprite.current.positioning.flip =
          !this.sprite.current.positioning.flip;
      }
    }

    const pos = this.sprite.current.positioning.position;
    this.sprite.current.positioning.position = {
      top: Math.max(
        0,
        Math.min(100 - this.sprite.current.positioning.scale.y, pos.top + dy),
      ),
      left: Math.max(
        0,
        Math.min(100 - this.sprite.current.positioning.scale.x, pos.left + dx),
      ),
    };

    this.canvasRef.current.style.width = `${this.sprite.current.positioning.scale.x}%`;
    this.canvasRef.current.style.height = `${this.sprite.current.positioning.scale.y}%`;
    this.canvasRef.current.style.top = `${this.sprite.current.positioning.position.top}%`;
    this.canvasRef.current.style.left = `${this.sprite.current.positioning.position.left}%`;
    this.canvasRef.current.style.transform = `rotate(${this.sprite.current.positioning.rotation}deg) scaleX(${this.sprite.current.positioning.flip ? "-1" : "1"})`;
  };

  private idle = () => {
    if (
      !this.idleTimeout &&
      this.sprite.current?.animations.coreAnimations.idle.alt
    ) {
      this.idleTimeout = setTimeout(
        () => {
          const idleAlt =
            this.sprite.current?.animations.coreAnimations.idle.alt;
          if (
            this.sprite.current &&
            this.sprite.current.animations.currentAnimation.core === "idle" &&
            idleAlt
          ) {
            const idleKeys = Object.keys(idleAlt);
            const randomKey =
              idleKeys[Math.round(Math.random() * (idleKeys.length - 1))];

            this.sprite.current.animations.currentAnimation.alt = randomKey;
            this.sprite.current.animations.coreAnimations.idle.alt?.[
              randomKey
            ].reset();
          }

          if (this.idleTimeout) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = undefined;
          }
        },
        Math.random() * 9000 + 7000,
      );
    }
  };

  private idleAltAnimationFinished = () => {
    if (
      this.sprite.current &&
      this.sprite.current.animations.currentAnimation.core !== "idle"
    ) {
      this.sprite.current.animations.currentAnimation.alt = undefined;
      this.sprite.current.animations.currentAnimation.core = "idle";
      this.sprite.current.animations.coreAnimations.idle.core.reset();

      if (this.idleTimeout) {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = undefined;
      }
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat || !this.sprite.current?.active) return;

    event.stopPropagation();
    event.preventDefault();

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
    if (!this.sprite.current?.active) return;

    event.stopPropagation();
    event.preventDefault();

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

export default LittleBuddiesController;
