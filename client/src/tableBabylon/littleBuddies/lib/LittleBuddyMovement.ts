import { Vector3 } from "@babylonjs/core";
import { spirteSheetsMeta } from "./typeConstant";
import LittleBuddy from "./LittleBuddy";
import TableBabylonScene from "../../../tableBabylon/TableBabylonScene";

class LittleBuddyMovement {
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

  constructor(
    private tableBabylonScene: TableBabylonScene,
    private littleBuddy: LittleBuddy,
  ) {}

  safeUpdatePositioning = (
    update:
      | {
          type: "position";
          x: number;
          y: number;
        }
      | {
          type: "scale";
          aspect: number;
          x: number;
          y: number;
        },
  ) => {
    if (!this.littleBuddy.sprite) return;

    switch (update.type) {
      case "position": {
        const scale = this.littleBuddy.sprite.positioning.scale;

        this.littleBuddy.sprite.positioning.position = {
          x: Math.max(scale.x / 2, Math.min(update.x, 100 - scale.x / 2)),
          y: Math.max(scale.y / 2, Math.min(update.y, 100 - scale.y / 2)),
        };
        break;
      }
      case "scale": {
        const pos = this.littleBuddy.sprite.positioning.position;

        // Determine max scale based on position and aspect ratio
        // Prevent overflow beyond 0-100 boundaries in both axes
        const maxScaleX = 2 * Math.min(pos.x, 100 - pos.x);
        const maxScaleY = 2 * Math.min(pos.y, 100 - pos.y);

        let targetScaleX = update.x;
        let targetScaleY = update.y;

        // Adjust target scales to maintain aspect ratio within safe bounds
        if (update.aspect >= 1) {
          // Wider than tall (landscape): scale X dominates
          targetScaleX = Math.min(update.x, maxScaleX);
          targetScaleY = targetScaleX / update.aspect;

          // If Y overflowed, back-calculate X
          if (targetScaleY > maxScaleY) {
            targetScaleY = maxScaleY;
            targetScaleX = targetScaleY * update.aspect;
          }
        } else {
          // Taller than wide (portrait): scale Y dominates
          targetScaleY = Math.min(update.y, maxScaleY);
          targetScaleX = targetScaleY * update.aspect;

          // If X overflowed, back-calculate Y
          if (targetScaleX > maxScaleX) {
            targetScaleX = maxScaleX;
            targetScaleY = targetScaleX / update.aspect;
          }
        }

        this.littleBuddy.sprite.positioning.scale = {
          x: Math.max(1, targetScaleX),
          y: Math.max(1, targetScaleY),
        };
        break;
      }
      default:
        break;
    }
  };

  move = () => {
    if (!this.littleBuddy.canvas || !this.littleBuddy.sprite) return;

    // movement step
    const meta = spirteSheetsMeta[this.littleBuddy.littleBuddy];
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

    if (this.littleBuddy.sprite.rotatable) {
      if (dx > 0 && dy > 0) {
        this.littleBuddy.sprite.positioning.rotation = 45;
        this.littleBuddy.sprite.positioning.flip = true;
        this.prevDir = "leftDown";
      } else if (dx > 0 && dy < 0) {
        this.littleBuddy.sprite.positioning.rotation = -45;
        this.littleBuddy.sprite.positioning.flip = true;
        this.prevDir = "leftUp";
      } else if (dx < 0 && dy > 0) {
        this.littleBuddy.sprite.positioning.rotation = -45;
        this.littleBuddy.sprite.positioning.flip = false;
        this.prevDir = "rightDown";
      } else if (dx < 0 && dy < 0) {
        this.littleBuddy.sprite.positioning.rotation = 45;
        this.littleBuddy.sprite.positioning.flip = false;
        this.prevDir = "rightUp";
      } else if (dx === 0 && dy > 0) {
        if (this.prevDir !== "down") {
          this.littleBuddy.sprite.positioning.rotation =
            this.prevDir === "right" ||
            this.prevDir === "rightDown" ||
            this.prevDir === "rightUp"
              ? 90
              : -90;
          this.littleBuddy.sprite.positioning.flip =
            this.prevDir === "right" ||
            this.prevDir === "rightDown" ||
            this.prevDir === "rightUp";
          this.prevDir = "down";
        }
      } else if (dx === 0 && dy < 0) {
        if (this.prevDir !== "up") {
          this.littleBuddy.sprite.positioning.rotation =
            this.prevDir === "right" ||
            this.prevDir === "rightDown" ||
            this.prevDir === "rightUp"
              ? -90
              : 90;
          this.littleBuddy.sprite.positioning.flip =
            this.prevDir === "right" ||
            this.prevDir === "rightDown" ||
            this.prevDir === "rightUp";
          this.prevDir = "up";
        }
      } else if (dx > 0 && dy === 0) {
        this.littleBuddy.sprite.positioning.rotation = 0;
        this.littleBuddy.sprite.positioning.flip = true;
        this.prevDir = "right";
      } else if (dx < 0 && dy === 0) {
        this.littleBuddy.sprite.positioning.rotation = 0;
        this.littleBuddy.sprite.positioning.flip = false;
        this.prevDir = "left";
      }
    } else {
      if (dx > 0) {
        if (this.prevDir !== "right") {
          this.littleBuddy.sprite.positioning.flip = true;
          this.prevDir = "right";
        }
      } else if (dx < 0) {
        if (this.prevDir !== "left") {
          this.littleBuddy.sprite.positioning.flip = false;
          this.prevDir = "left";
        }
      }
    }

    if (currentDir !== this.prevDir) {
      if (meta.flipTextures) {
        this.littleBuddy.sprite.positioning.flip =
          !this.littleBuddy.sprite.positioning.flip;
      }
    }

    const pos = this.littleBuddy.sprite.positioning.position;
    this.safeUpdatePositioning({
      type: "position",
      y: pos.y + dy,
      x: pos.x + dx,
    });

    this.updateBuddyPosition();
    this.updateBuddyFlip();
  };

  private updateMovement() {
    if (!this.littleBuddy.sprite) return;

    if (this.activeDirs.size === 0) {
      if (this.littleBuddy.sprite.animations.currentAnimation.core !== "idle") {
        this.littleBuddy.sprite.animations.currentAnimation.core = "idle";
        this.littleBuddy.sprite.animations.currentAnimation.alt = undefined;
        this.littleBuddy.sprite.animations.coreAnimations.idle.core.reset();
      }
      return;
    }

    // choose run vs walk animation
    const animations = this.littleBuddy.sprite.animations;
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
      this.littleBuddy.sprite.animations.currentAnimation.alt = undefined;
      animation.reset();
    }
  }

  updateBuddyPosition = () => {
    if (!this.littleBuddy.sprite || !this.littleBuddy.mesh) return;

    // 1) compute and apply world‐space position:
    const worldPos = this.positionLittleBuddy();
    if (worldPos) {
      this.littleBuddy.mesh.position.copyFrom(worldPos);
    }

    // 2) scale so “1%” = 1% of on‐screen width/height at that layer:
    const fov = this.tableBabylonScene.camera.fov;
    const aspect =
      this.tableBabylonScene.engine.getRenderWidth() /
      this.tableBabylonScene.engine.getRenderHeight();

    // Note: we used the same distance to compute view size
    const camZ = this.tableBabylonScene.camera.globalPosition.z;
    const distance = this.littleBuddy.contentZIndex - camZ;
    const viewHeight = 2 * Math.tan(fov / 2) * distance;
    const viewWidth = viewHeight * aspect;

    this.littleBuddy.mesh.scaling = new Vector3(
      (this.littleBuddy.sprite.positioning.scale.x / 100) * viewWidth,
      (this.littleBuddy.sprite.positioning.scale.y / 100) * viewHeight,
      1,
    );
  };

  updateMovementDirection = (
    action: "add" | "remove",
    direction: "left" | "right" | "up" | "down",
  ) => {
    if (action === "add") this.activeDirs.add(direction);
    if (action === "remove") this.activeDirs.delete(direction);
    this.updateMovement();
  };

  private positionLittleBuddy = (): Vector3 | undefined => {
    if (!this.littleBuddy.sprite) return;

    // --- 1) turn 0–100% into NDC (–1…+1 for X, +1…–1 for Y) ---
    const ndcX = (this.littleBuddy.sprite.positioning.position.x / 100) * 2 - 1;
    const ndcY = 1 - (this.littleBuddy.sprite.positioning.position.y / 100) * 2;

    // --- 2) camera basis vectors ---
    const camPos = this.tableBabylonScene.camera.globalPosition.clone();
    const target = this.tableBabylonScene.camera.getTarget();
    const forward = target.subtract(camPos).normalize(); // F
    // Make “right” point to +X on screen:
    const right = Vector3.Cross(
      this.tableBabylonScene.camera.upVector,
      forward,
    ).normalize(); // R
    // Re‑compute orthogonal up:
    const up = Vector3.Cross(forward, right).normalize(); // U

    // --- 3) how far out along F must we go so world‑Z == contentZIndex? ---
    //    worldZ = camPos.z + forward.z * d  == contentZIndex
    // → d = (contentZIndex - camPos.z)/forward.z,  but forward.z is 1 here.
    const distance = this.littleBuddy.contentZIndex - camPos.z;

    // --- 4) physical size of view‐plane at that distance ---
    const fov = this.tableBabylonScene.camera.fov;
    const aspect =
      this.tableBabylonScene.engine.getRenderWidth() /
      this.tableBabylonScene.engine.getRenderHeight();
    const viewHeight = 2 * Math.tan(fov / 2) * distance;
    const viewWidth = viewHeight * aspect;

    // --- 5) convert NDC → world‐space offset ---
    const offsetX = ndcX * (viewWidth / 2);
    const offsetY = ndcY * (viewHeight / 2);

    // --- 6) assemble final world position ---
    return camPos
      .add(forward.scale(distance))
      .add(right.scale(offsetX))
      .add(up.scale(offsetY));
  };

  updateSize = (
    action: "grow" | "shrink",
    speed: "fast" | "slow",
    aspect = 1,
  ) => {
    if (!this.littleBuddy.sprite) return;

    const increment =
      (speed === "fast" ? 1 : 0.5) * (action === "grow" ? 1 : -1);

    this.safeUpdatePositioning({
      type: "scale",
      aspect,
      x: this.littleBuddy.sprite.positioning.scale.x + increment,
      y: this.littleBuddy.sprite.positioning.scale.y + increment,
    });

    this.updateBuddyPosition();
  };

  private updateBuddyFlip = () => {
    if (!this.littleBuddy.texture) return;

    if (this.littleBuddy.sprite?.positioning.flip) {
      this.littleBuddy.texture.uScale = -1;
      this.littleBuddy.texture.uOffset = 1;
    } else {
      this.littleBuddy.texture.uScale = 1;
      this.littleBuddy.texture.uOffset = 0;
    }
  };

  toggleSprint = (sprinting: boolean) => {
    this.sprinting = sprinting;
  };
}

export default LittleBuddyMovement;
