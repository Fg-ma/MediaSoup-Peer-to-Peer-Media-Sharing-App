import Animation from "./Animation";
import LittleBuddy from "./LittleBuddy";
import {
  spirteSheetsMeta,
  SpriteAnimations,
  SpriteAnimationsTypes,
} from "./typeConstant";

class LittleBuddyAnimations {
  constructor(private littleBuddy: LittleBuddy) {}

  newAnimation = (
    animations: SpriteAnimations,
    type: "core" | "alt",
    name: SpriteAnimationsTypes,
  ) => {
    const meta =
      // @ts-expect-error: trust me I know what i'm doing
      spirteSheetsMeta[this.littleBuddy.littleBuddy].animations[type][name];
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

  idle = () => {
    if (
      !this.littleBuddy.idleTimeout &&
      this.littleBuddy.sprite?.animations.coreAnimations.idle.alt
    ) {
      this.littleBuddy.idleTimeout = setTimeout(
        () => {
          const idleAlt =
            this.littleBuddy.sprite?.animations.coreAnimations.idle.alt;
          if (
            this.littleBuddy.sprite &&
            this.littleBuddy.sprite.animations.currentAnimation.core ===
              "idle" &&
            idleAlt
          ) {
            const idleKeys = Object.keys(idleAlt);
            const randomKey =
              idleKeys[Math.round(Math.random() * (idleKeys.length - 1))];

            this.littleBuddy.sprite.animations.currentAnimation.alt = randomKey;
            this.littleBuddy.sprite.animations.coreAnimations.idle.alt?.[
              randomKey
            ].reset();
          }

          if (this.littleBuddy.idleTimeout) {
            clearTimeout(this.littleBuddy.idleTimeout);
            this.littleBuddy.idleTimeout = undefined;
          }
        },
        Math.random() * 9000 + 7000,
      );
    }
  };

  private idleAltAnimationFinished = () => {
    if (
      this.littleBuddy.sprite &&
      this.littleBuddy.sprite.animations.currentAnimation.core !== "idle"
    ) {
      this.littleBuddy.sprite.animations.currentAnimation.alt = undefined;
      this.littleBuddy.sprite.animations.currentAnimation.core = "idle";
      this.littleBuddy.sprite.animations.coreAnimations.idle.core.reset();

      if (this.littleBuddy.idleTimeout) {
        clearTimeout(this.littleBuddy.idleTimeout);
        this.littleBuddy.idleTimeout = undefined;
      }
    }
  };
}

export default LittleBuddyAnimations;
