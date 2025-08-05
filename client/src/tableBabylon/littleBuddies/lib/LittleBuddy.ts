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
  UniversalCamera,
  Engine,
} from "@babylonjs/core";
import SpriteSheet from "./SpriteSheet";
import {
  AltSpriteAnimationsTypes,
  coreAnimations,
  CoreSpriteAnimationsTypes,
  LittleBuddiesTypes,
  spirteSheetsMeta,
  SpriteAnimations,
  SpriteAnimationsTypes,
  SpriteMetadata,
  SpriteType,
} from "./typeConstant";
import { MeshMetadata } from "../../../../../universal/babylonTypeContant";
import LittleBuddyAnimations from "./LittleBuddyAnimations";
import LittleBuddyMovement from "./LittleBuddyMovement";
import TableBabylonMouse from "../../../tableBabylon/mouse/TableBabylonMouse";
import TableBabylonScene from "src/tableBabylon/TableBabylonScene";

class LittleBuddy {
  sprite: SpriteType | undefined;
  meta: SpriteMetadata;

  spriteSheet: SpriteSheet | undefined;
  canvas: HTMLCanvasElement;
  lastTimeRef = 0;

  idleTimeout: undefined | NodeJS.Timeout;

  mesh: Mesh | undefined;
  texture: DynamicTexture | undefined;
  private mat: StandardMaterial | undefined;
  private multiMat: MultiMaterial | undefined;

  contentZIndex = 99;

  littleBuddyAnimations: LittleBuddyAnimations;
  littleBuddyMovement: LittleBuddyMovement;

  constructor(
    private userId: string,
    private littleBuddyId: string,
    public littleBuddy: LittleBuddiesTypes,
    private tableBabylonScene: TableBabylonScene,
  ) {
    this.canvas = document.createElement("canvas");

    this.meta = spirteSheetsMeta[this.littleBuddy];

    this.littleBuddyAnimations = new LittleBuddyAnimations(this);
    this.littleBuddyMovement = new LittleBuddyMovement(
      this.tableBabylonScene,
      this,
    );

    this.init();
  }

  private init = async () => {
    const aspect = this.meta.frameWidth / this.meta.frameHeight;

    const positioning = {
      position: { y: Math.random() * 99, x: Math.random() * 99 },
      scale: {
        x: 10,
        y: 10 / aspect,
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
      this.littleBuddyAnimations.newAnimation(
        animations,
        "core",
        core as SpriteAnimationsTypes,
      );
    }
    for (const alt in this.meta.animations.alt) {
      this.littleBuddyAnimations.newAnimation(
        animations,
        "alt",
        alt as SpriteAnimationsTypes,
      );
    }

    this.sprite = {
      rotatable: this.meta.rotatable,
      flipTextures: this.meta.flipTextures,
      positioning,
      animations,
      active: false,
      aspect,
      selected: false,
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
        width: 1, // X-axis
        height: 1, // Y-axis
        depth: 1, // Z-axis
      },
      this.tableBabylonScene.scene,
    );

    this.mesh.metadata = {
      type: "littleBuddy",
      userId: this.userId,
      meshLabel: this.littleBuddyId,
      flags: {
        gizmo: false,
        moveable: true,
        scaleable: false,
        rotateable: false,
        audio: false,
      },
      positioning: {
        initScale: 1,
        manuallyTransformed: true,
      },
    } as MeshMetadata;

    this.tableBabylonScene.tableBabylonMouse.applyMouseActions(this.mesh);

    this.littleBuddyMovement.updateBuddyPosition();

    const sampling = this.meta.pixelated
      ? Texture.NEAREST_SAMPLINGMODE
      : Texture.TRILINEAR_SAMPLINGMODE;

    // Dynamic texture from the canvas
    this.texture = new DynamicTexture(
      this.littleBuddyId + "-texture",
      this.canvas,
      this.tableBabylonScene.scene,
      !this.meta.pixelated,
      sampling,
    );

    this.texture.wrapU = Texture.CLAMP_ADDRESSMODE;
    this.texture.wrapV = Texture.CLAMP_ADDRESSMODE;

    // Material for the front face (Z+)
    this.mat = new StandardMaterial(
      this.littleBuddyId + "-material",
      this.tableBabylonScene.scene,
    );
    this.mat.diffuseTexture = this.texture;
    this.mat.emissiveColor = new Color3(1, 1, 1);
    this.mat.backFaceCulling = false;

    this.mat.diffuseTexture.hasAlpha = true;
    this.mat.useAlphaFromDiffuseTexture = true;
    this.mat.transparencyMode = Material.MATERIAL_ALPHABLEND;

    // Create a multi-material for the mesh
    this.multiMat = new MultiMaterial(
      this.littleBuddyId + "-multiMaterial",
      this.tableBabylonScene.scene,
    );

    for (let i = 0; i < 6; i++) {
      let mat: StandardMaterial;
      if (i === 1) {
        mat = this.mat;
      } else {
        mat = new StandardMaterial(
          `${this.littleBuddyId}-transMat_${i}`,
          this.tableBabylonScene.scene,
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
    this.tableBabylonScene.scene.onBeforeRenderObservable.add(() => {
      this.texture?.update();
    });

    this.tableBabylonScene.tableBabylonPhysics.addMeshCollision(this.mesh);
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

    if (this.sprite.selected) {
      this.drawSelectedOutline(ctx);
    }

    if (
      this.sprite.animations.currentAnimation.core === "run" ||
      this.sprite.animations.currentAnimation.core === "walk"
    ) {
      this.littleBuddyMovement.move();
    }
    if (this.sprite.animations.currentAnimation.core === "idle") {
      this.littleBuddyAnimations.idle();
    } else {
      if (this.idleTimeout) {
        clearTimeout(this.idleTimeout);
        this.idleTimeout = undefined;
      }
    }

    requestAnimationFrame(this.animationLoop);
  };

  private drawSelectedOutline(ctx: CanvasRenderingContext2D) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    // 1. Copy the current sprite image to an offscreen canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = w;
    offscreen.height = h;
    const offCtx = offscreen.getContext("2d")!;
    offCtx.drawImage(this.canvas, 0, 0);

    // 2. Draw a red version slightly enlarged underneath to act as outline
    ctx.save();

    const outlineSize = 0.5; // in pixels

    // draw multiple copies slightly offset to simulate stroke
    for (let dx = -outlineSize; dx <= outlineSize; dx++) {
      for (let dy = -outlineSize; dy <= outlineSize; dy++) {
        // skip center
        if (dx === 0 && dy === 0) continue;
        ctx.drawImage(offscreen, dx, dy);
      }
    }

    // Apply red tint over the outline copies
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "#e62833";
    ctx.fillRect(0, 0, w, h);

    // 3. Restore composite and draw original sprite on top
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(offscreen, 0, 0);

    ctx.restore();
  }

  setSelected = (flag: boolean) => {
    if (!this.sprite) return;
    this.sprite.selected = flag;
  };
}

export default LittleBuddy;
