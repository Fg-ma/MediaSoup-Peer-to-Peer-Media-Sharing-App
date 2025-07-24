import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  MultiMaterial,
  DynamicTexture,
  SubMesh,
  Mesh,
  Material,
  Texture,
} from "@babylonjs/core";
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
  SpriteMetaData,
  SpriteType,
} from "./typeConstant";

class LittleBuddy {
  sprite: SpriteType | undefined;
  meta: SpriteMetaData;

  spriteSheet: SpriteSheet | undefined;
  canvas: HTMLCanvasElement;
  lastTimeRef = 0;

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

  private mesh: Mesh | undefined;
  private mat: StandardMaterial | undefined;
  private multiMat: MultiMaterial | undefined;

  constructor(
    private littleBuddyId: string,
    private littleBuddy: LittleBuddiesTypes,
    private scene: Scene,
  ) {
    this.canvas = document.createElement("canvas");

    this.meta = spirteSheetsMeta[this.littleBuddy];

    this.init();
  }

  private init = async () => {
    const aspect = this.meta.frameWidth / this.meta.frameHeight;

    const positioning = {
      position: { top: 50, left: 50 },
      scale: {
        x: 8,
        y: 8 / aspect,
      },
      rotation: 0,
      flip: false,
    };

    this.canvas.width = this.meta.frameWidth;
    this.canvas.height = this.meta.frameHeight;

    const img = await this.loadImage(this.meta.url);

    const sheet = new SpriteSheet(
      img,
      this.meta.frameWidth,
      this.meta.frameHeight,
    );
    this.spriteSheet = sheet;

    const animations: SpriteAnimations = {
      currentAnimation: { core: "idle", alt: undefined },
      // @ts-expect-error: trust me I know what i'm doing
      coreAnimations: {},
      altAnimations: {},
    };

    for (const core in this.meta.animations.core) {
      this.newAnimation(animations, "core", core as SpriteAnimationsTypes);
    }
    for (const alt in this.meta.animations.alt) {
      this.newAnimation(animations, "alt", alt as SpriteAnimationsTypes);
    }

    this.sprite = {
      rotatable: this.meta.rotatable,
      flipTextures: this.meta.flipTextures,
      positioning,
      animations,
      active: false,
      aspect,
    };

    if (this.meta.pixelated) {
      this.canvas.style.imageRendering = "pixelated";
    }

    this.createBuddy();

    requestAnimationFrame(this.animationLoop);
  };

  private createBuddy = () => {
    // Create a rectangular prism with independent dimensions
    this.mesh = MeshBuilder.CreateBox(
      this.littleBuddyId + "-mesh",
      {
        width: 0.5, // X-axis
        height: 0.5, // Y-axis
        depth: 0.001, // Z-axis
      },
      this.scene,
    );

    const forward = this.scene.activeCamera!.getForwardRay().direction;
    this.mesh.position = this.scene.activeCamera!.position.add(
      forward.scale(2),
    );

    const sampling = this.meta.pixelated
      ? Texture.NEAREST_SAMPLINGMODE
      : Texture.TRILINEAR_SAMPLINGMODE;

    // Dynamic texture from the canvas
    const frontTexture = new DynamicTexture(
      this.littleBuddyId + "-texture",
      this.canvas,
      this.scene,
      !this.meta.pixelated,
      sampling,
    );

    frontTexture.wrapU = Texture.CLAMP_ADDRESSMODE;
    frontTexture.wrapV = Texture.CLAMP_ADDRESSMODE;

    // Material for the front face (Z+)
    this.mat = new StandardMaterial(
      this.littleBuddyId + "-material",
      this.scene,
    );
    this.mat.diffuseTexture = frontTexture;
    this.mat.emissiveColor = new Color3(1, 1, 1);
    this.mat.backFaceCulling = false;

    this.mat.diffuseTexture.hasAlpha = true;
    this.mat.useAlphaFromDiffuseTexture = true;
    this.mat.transparencyMode = Material.MATERIAL_ALPHABLEND;

    // Create a multi-material for the mesh
    this.multiMat = new MultiMaterial(
      this.littleBuddyId + "-multiMaterial",
      this.scene,
    );

    for (let i = 0; i < 6; i++) {
      let mat: StandardMaterial;
      if (i === 1) {
        mat = this.mat;
      } else {
        mat = new StandardMaterial(
          `${this.littleBuddyId}-transMat_${i}`,
          this.scene,
        );
        mat.alpha = 0.2;
        mat.diffuseColor = new Color3(1, 1, 0);
        mat.backFaceCulling = false;
      }
      this.multiMat.subMaterials.push(mat);
    }

    this.mesh.material = this.multiMat;

    // Assign submeshes for each face of the box
    this.mesh.subMeshes = [];
    const verticesCount = this.mesh.getTotalVertices();

    for (let i = 0; i < 6; i++) {
      new SubMesh(i, 0, verticesCount, i * 6, 6, this.mesh);
    }

    // Live update texture from canvas on each frame
    this.scene.onBeforeRenderObservable.add(() => {
      frontTexture.update();
    });
  };

  private loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.crossOrigin = "anonymous";
      img.src = src;
    });
  };

  animationLoop = (timestamp: number) => {
    const ctx = this.canvas?.getContext("2d");

    if (!this.spriteSheet || !this.sprite || !ctx) return;

    if (this.lastTimeRef === 0) {
      this.lastTimeRef = timestamp;
    }

    const dt = (timestamp - this.lastTimeRef) / 1000;
    this.lastTimeRef = timestamp;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const coreAnimation = coreAnimations.includes(
      this.sprite.animations.currentAnimation.core,
    );
    const currentAlt = this.sprite.animations.currentAnimation.alt;
    const currentAnimation = coreAnimation
      ? currentAlt
        ? this.sprite.animations.coreAnimations[
            this.sprite.animations.currentAnimation
              .core as CoreSpriteAnimationsTypes
          ].alt?.[currentAlt]
        : this.sprite.animations.coreAnimations[
            this.sprite.animations.currentAnimation
              .core as CoreSpriteAnimationsTypes
          ].core
      : currentAlt
        ? this.sprite.animations.altAnimations[
            this.sprite.animations.currentAnimation
              .core as AltSpriteAnimationsTypes
          ]?.alt?.[currentAlt]
        : this.sprite.animations.altAnimations[
            this.sprite.animations.currentAnimation
              .core as AltSpriteAnimationsTypes
          ]?.core;

    if (!currentAnimation) {
      requestAnimationFrame(this.animationLoop);
      return;
    }

    currentAnimation.update(dt);
    const frameIndex = currentAnimation.getCurrentFrame();
    this.spriteSheet.drawFrame(ctx, frameIndex, 0, 0);

    if (
      this.sprite.animations.currentAnimation.core === "run" ||
      this.sprite.animations.currentAnimation.core === "walk"
    ) {
      this.move();
    }
    if (this.sprite.animations.currentAnimation.core === "idle") {
      this.idle();
    } else {
      if (this.idleTimeout) {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = undefined;
      }
    }

    requestAnimationFrame(this.animationLoop);
  };

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

  private updateMovement() {
    if (!this.sprite) return;

    if (this.activeDirs.size === 0) {
      if (this.sprite.animations.currentAnimation.core !== "idle") {
        this.sprite.animations.currentAnimation.core = "idle";
        this.sprite.animations.currentAnimation.alt = undefined;
        this.sprite.animations.coreAnimations.idle.core.reset();
      }
      return;
    }

    // choose run vs walk animation
    const animations = this.sprite.animations;
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
      this.sprite.animations.currentAnimation.alt = undefined;
      animation.reset();
    }
  }

  private move = () => {
    if (!this.canvas || !this.sprite) return;

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

    if (this.sprite.rotatable) {
      if (dx > 0 && dy > 0) {
        this.sprite.positioning.rotation = 45;
        this.sprite.positioning.flip = true;
        this.prevDir = "leftDown";
      } else if (dx > 0 && dy < 0) {
        this.sprite.positioning.rotation = -45;
        this.sprite.positioning.flip = true;
        this.prevDir = "leftUp";
      } else if (dx < 0 && dy > 0) {
        this.sprite.positioning.rotation = -45;
        this.sprite.positioning.flip = false;
        this.prevDir = "rightDown";
      } else if (dx < 0 && dy < 0) {
        this.sprite.positioning.rotation = 45;
        this.sprite.positioning.flip = false;
        this.prevDir = "rightUp";
      } else if (dx === 0 && dy > 0) {
        if (this.prevDir !== "down") {
          this.sprite.positioning.rotation =
            this.prevDir === "right" ||
            this.prevDir === "rightDown" ||
            this.prevDir === "rightUp"
              ? 90
              : -90;
          this.sprite.positioning.flip =
            this.prevDir === "right" ||
            this.prevDir === "rightDown" ||
            this.prevDir === "rightUp";
          this.prevDir = "down";
        }
      } else if (dx === 0 && dy < 0) {
        if (this.prevDir !== "up") {
          this.sprite.positioning.rotation =
            this.prevDir === "right" ||
            this.prevDir === "rightDown" ||
            this.prevDir === "rightUp"
              ? -90
              : 90;
          this.sprite.positioning.flip =
            this.prevDir === "right" ||
            this.prevDir === "rightDown" ||
            this.prevDir === "rightUp";
          this.prevDir = "up";
        }
      } else if (dx > 0 && dy === 0) {
        this.sprite.positioning.rotation = 0;
        this.sprite.positioning.flip = true;
        this.prevDir = "right";
      } else if (dx < 0 && dy === 0) {
        this.sprite.positioning.rotation = 0;
        this.sprite.positioning.flip = false;
        this.prevDir = "left";
      }
    } else {
      if (dx > 0) {
        if (this.prevDir !== "right") {
          this.sprite.positioning.flip = true;
          this.prevDir = "right";
        }
      } else if (dx < 0) {
        if (this.prevDir !== "left") {
          this.sprite.positioning.flip = false;
          this.prevDir = "left";
        }
      }
    }

    if (currentDir !== this.prevDir) {
      if (meta.flipTextures) {
        this.sprite.positioning.flip = !this.sprite.positioning.flip;
      }
    }

    const pos = this.sprite.positioning.position;
    this.sprite.positioning.position = {
      top: Math.max(
        0,
        Math.min(100 - this.sprite.positioning.scale.y, pos.top + dy),
      ),
      left: Math.max(
        0,
        Math.min(100 - this.sprite.positioning.scale.x, pos.left + dx),
      ),
    };

    this.canvas.style.width = `${this.sprite.positioning.scale.x}%`;
    this.canvas.style.height = `${this.sprite.positioning.scale.y}%`;
    this.canvas.style.top = `${this.sprite.positioning.position.top}%`;
    this.canvas.style.left = `${this.sprite.positioning.position.left}%`;
    this.canvas.style.transform = `rotate(${this.sprite.positioning.rotation}deg) scaleX(${this.sprite.positioning.flip ? "-1" : "1"})`;
  };

  private idle = () => {
    if (!this.idleTimeout && this.sprite?.animations.coreAnimations.idle.alt) {
      this.idleTimeout = setTimeout(
        () => {
          const idleAlt = this.sprite?.animations.coreAnimations.idle.alt;
          if (
            this.sprite &&
            this.sprite.animations.currentAnimation.core === "idle" &&
            idleAlt
          ) {
            const idleKeys = Object.keys(idleAlt);
            const randomKey =
              idleKeys[Math.round(Math.random() * (idleKeys.length - 1))];

            this.sprite.animations.currentAnimation.alt = randomKey;
            this.sprite.animations.coreAnimations.idle.alt?.[randomKey].reset();
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
      this.sprite &&
      this.sprite.animations.currentAnimation.core !== "idle"
    ) {
      this.sprite.animations.currentAnimation.alt = undefined;
      this.sprite.animations.currentAnimation.core = "idle";
      this.sprite.animations.coreAnimations.idle.core.reset();

      if (this.idleTimeout) {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = undefined;
      }
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat || !this.sprite?.active) return;

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
    if (!this.sprite?.active) return;

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

export default LittleBuddy;
