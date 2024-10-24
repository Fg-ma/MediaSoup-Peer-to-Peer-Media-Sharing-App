import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  VideoTexture,
  UniversalCamera,
  Mesh,
  Color3,
  BlurPostProcess,
  Vector2,
  ImageProcessingPostProcess,
  Layer,
  DynamicTexture,
  Material,
  MotionBlurPostProcess,
  BlackAndWhitePostProcess,
  ChromaticAberrationPostProcess,
  SharpenPostProcess,
  TonemapPostProcess,
  TonemappingOperator,
  Effect,
  PostProcess,
} from "@babylonjs/core";

type PostProcessEffects =
  | "prismaColors"
  | "blackAndWhite"
  | "bubbleChromatic"
  | "fisheye"
  | "nightVision"
  | "vintageTV"
  | "motionblur"
  | "pixelation"
  | "old"
  | "chromaticAberration"
  | "colorSplash"
  | "tonemap"
  | "rays"
  | "sharpen"
  | "tiltShift"
  | "cartoon";

class BabylonShaderController {
  private time = 0;

  private prismaColorsPostProcess: PostProcess | undefined;
  private blackAndWhitePostProcess: BlackAndWhitePostProcess | undefined;
  private bubbleChromaticPostProcess: PostProcess | undefined;
  private fisheyePostProcess: PostProcess | undefined;
  private nightVisionPostProcess: PostProcess | undefined;
  private vintageTVPostProcess: PostProcess | undefined;
  private motionblurPostProcess: MotionBlurPostProcess | undefined;
  private pixelationPostProcess: PostProcess | undefined;
  private oldPostProcess: PostProcess | undefined;
  private chromaticAberrationPostProcess:
    | ChromaticAberrationPostProcess
    | undefined;
  private colorSplashPostProcess: PostProcess | undefined;
  private tonemapPostProcess: TonemapPostProcess | undefined;
  private raysPostProcess: PostProcess | undefined;
  private sharpenPostProcess: SharpenPostProcess | undefined;
  private tiltShiftPostProcess: PostProcess | undefined;
  private cartoonPostProcess: PostProcess | undefined;

  private glitchActive = false;
  private minGlitchInterval = 2000; // 2 seconds in milliseconds
  private maxGlitchInterval = 10000; // 10 seconds in milliseconds
  private vintageTVGlitchTimeout: NodeJS.Timeout | undefined;
  private vintageTVGlitchActiveTimeout: NodeJS.Timeout | undefined;

  private activeShaders: {
    [postProcessEffect in PostProcessEffects]: boolean;
  } = {
    prismaColors: false,
    blackAndWhite: false,
    bubbleChromatic: false,
    fisheye: false,
    nightVision: false,
    vintageTV: false,
    motionblur: false,
    pixelation: false,
    old: false,
    chromaticAberration: false,
    colorSplash: false,
    tonemap: false,
    rays: false,
    sharpen: false,
    tiltShift: false,
    cartoon: false,
  };

  constructor(
    private engine: Engine,
    private camera: UniversalCamera,
    private scene: Scene
  ) {
    this.changePostProcessEffect("bubbleChromatic", true);
  }

  private loadShader = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load shader from ${url}`);
    }
    return await response.text();
  };

  private startVintageTVGlitch = () => {
    this.glitchActive = true;

    if (this.vintageTVGlitchActiveTimeout === undefined) {
      this.vintageTVGlitchActiveTimeout = setTimeout(() => {
        clearTimeout(this.vintageTVGlitchActiveTimeout);
        this.vintageTVGlitchActiveTimeout = undefined;

        this.glitchActive = false;
      }, 500);
    }
  };

  private stopVintageTVGlitch = () => {
    this.glitchActive = false;

    if (this.vintageTVGlitchActiveTimeout !== undefined) {
      clearTimeout(this.vintageTVGlitchActiveTimeout);
      this.vintageTVGlitchActiveTimeout = undefined;
    }
    if (this.vintageTVGlitchTimeout !== undefined) {
      clearTimeout(this.vintageTVGlitchTimeout);
      this.vintageTVGlitchTimeout = undefined;
    }
  };

  private setVintageTVGlitchInterval = () => {
    const glitchInterval =
      Math.random() * (this.maxGlitchInterval - this.minGlitchInterval) +
      this.minGlitchInterval;

    if (this.vintageTVGlitchTimeout === undefined) {
      this.vintageTVGlitchTimeout = setTimeout(() => {
        clearTimeout(this.vintageTVGlitchTimeout);
        this.vintageTVGlitchTimeout = undefined;

        this.startVintageTVGlitch(); // Start the glitch
        this.setVintageTVGlitchInterval(); // Set up the next glitch interval
      }, glitchInterval);
    }
  };

  private createPostProcessEffect = (postProcessEffect: PostProcessEffects) => {
    switch (postProcessEffect) {
      case "prismaColors":
        this.loadShader("./src/babylon/shaders/prismaColorsShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["prismaColorsPixelShader"] = shaderCode;

            this.prismaColorsPostProcess = new PostProcess(
              "prismaColors",
              "prismaColors",
              null,
              ["time"],
              1.0,
              this.camera
            );
          }
        );
        break;
      case "blackAndWhite":
        this.blackAndWhitePostProcess = new BlackAndWhitePostProcess(
          "blackAndWhite",
          1.0,
          this.camera,
          undefined,
          this.engine,
          false
        );
        break;
      case "bubbleChromatic":
        this.loadShader(
          "./src/babylon/shaders/bubbleChromaticShader.glsl"
        ).then((shaderCode) => {
          Effect.ShadersStore["bubbleChromaticPixelShader"] = shaderCode;

          this.bubbleChromaticPostProcess = new PostProcess(
            "BubbleChromatic",
            "bubbleChromatic",
            ["time"],
            null,
            1.0,
            this.camera
          );
        });
        break;
      case "fisheye":
        this.loadShader("./src/babylon/shaders/fisheyeShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["fisheyePixelShader"] = shaderCode;

            this.fisheyePostProcess = new PostProcess(
              "fisheye",
              "fisheye",
              null,
              null,
              1.0,
              this.camera
            );
          }
        );
        break;
      case "nightVision":
        this.loadShader("./src/babylon/shaders/nightVisionShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["nightVisionPixelShader"] = shaderCode;

            this.nightVisionPostProcess = new PostProcess(
              "nightVision",
              "nightVision",
              ["time"],
              null,
              1.0,
              this.camera
            );
          }
        );
        break;
      case "vintageTV":
        this.loadShader("./src/babylon/shaders/vintageTVShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["vintageTVPixelShader"] = shaderCode;

            this.vintageTVPostProcess = new PostProcess(
              "vintageTV",
              "vintageTV",
              ["time", "aspectRatio", "glitchActive"],
              null,
              1.0,
              this.camera
            );
          }
        );

        this.setVintageTVGlitchInterval();
        break;
      case "motionblur":
        this.motionblurPostProcess = new MotionBlurPostProcess(
          "motionBlur",
          this.scene,
          1.0,
          this.camera
        );
        break;
      case "pixelation":
        this.loadShader("./src/babylon/shaders/pixelationShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["pixelationPixelShader"] = shaderCode;

            this.pixelationPostProcess = new PostProcess(
              "pixelation",
              "pixelation",
              ["pixelSize", "resolution"],
              null,
              1.0,
              this.camera
            );
          }
        );
        break;
      case "old":
        this.loadShader("./src/babylon/shaders/oldShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["oldPixelShader"] = shaderCode;

            this.oldPostProcess = new PostProcess(
              "old",
              "old",
              null,
              ["resolution", "time"],
              1.0,
              this.camera
            );
          }
        );
        break;
      case "chromaticAberration":
        this.chromaticAberrationPostProcess =
          new ChromaticAberrationPostProcess(
            "chromaticAberration",
            this.engine.getRenderWidth(),
            this.engine.getRenderHeight(),
            1,
            this.camera,
            undefined,
            this.engine,
            false
          );
        break;
      case "colorSplash":
        this.loadShader("./src/babylon/shaders/colorSplashShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["colorSplashPixelShader"] = shaderCode;

            this.colorSplashPostProcess = new PostProcess(
              "colorSplash",
              "colorSplash",
              null,
              ["resolution", "targetColor"],
              1.0,
              this.camera
            );

            this.colorSplashPostProcess.onApply = (effect) => {
              effect.setVector2(
                "resolution",
                new Vector2(
                  this.engine.getRenderWidth(),
                  this.engine.getRenderHeight()
                )
              );
              effect.setVector3("targetColor", new Vector3(1, 0, 0));
            };
          }
        );
        break;
      case "tonemap":
        this.tonemapPostProcess = new TonemapPostProcess(
          "tonemap",
          TonemappingOperator.HejiDawson, // You can switch between Hable, Reinhard, or HejiDawson
          1.0, // Exposure adjustment
          this.camera // Attach it to your camera
        );
        break;
      case "rays":
        this.loadShader("./src/babylon/shaders/raysShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["raysPixelShader"] = shaderCode;

            this.raysPostProcess = new PostProcess(
              "rays",
              "rays",
              null,
              [
                "resolution",
                "lightPositionOnScreen",
                "exposure",
                "decay",
                "density",
                "weight",
              ],
              1.0,
              this.camera
            );

            this.raysPostProcess.onApply = (effect) => {
              effect.setVector2(
                "resolution",
                new Vector2(
                  this.engine.getRenderWidth(),
                  this.engine.getRenderHeight()
                )
              );
              effect.setVector2(
                "lightPositionOnScreen",
                new Vector2(0.25, 0.9)
              );
              effect.setFloat("exposure", 1.25);
              effect.setFloat("decay", 0.95);
              effect.setFloat("density", 0.7);
              effect.setFloat("weight", 0.03);
            };
          }
        );
        break;
      case "sharpen":
        this.sharpenPostProcess = new SharpenPostProcess(
          "sharpen",
          1,
          this.camera,
          undefined,
          this.engine,
          false
        );
        break;
      case "tiltShift":
        this.loadShader("./src/babylon/shaders/tiltShiftShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["tiltShiftPixelShader"] = shaderCode;

            this.tiltShiftPostProcess = new PostProcess(
              "tiltShift",
              "tiltShift",
              ["focusHeight", "focusWidth", "blurStrength"],
              null,
              1.0,
              this.camera
            );
          }
        );
        break;
      case "cartoon":
        this.loadShader("./src/babylon/shaders/cartoonShader.glsl").then(
          (shaderCode) => {
            Effect.ShadersStore["cartoonPixelShader"] = shaderCode;

            this.cartoonPostProcess = new PostProcess(
              "cartoon",
              "cartoon",
              null,
              null,
              1.0,
              this.camera
            );
          }
        );
        break;
      default:
        break;
    }
  };

  private removePostProcessEffect = (postProcessEffect: PostProcessEffects) => {
    switch (postProcessEffect) {
      case "prismaColors":
        if (this.prismaColorsPostProcess) {
          this.prismaColorsPostProcess.dispose();
          this.prismaColorsPostProcess = undefined;
        }
        break;
      case "blackAndWhite":
        if (this.blackAndWhitePostProcess) {
          this.blackAndWhitePostProcess.dispose();
          this.blackAndWhitePostProcess = undefined;
        }
        break;
      case "bubbleChromatic":
        if (this.bubbleChromaticPostProcess) {
          this.bubbleChromaticPostProcess.dispose();
          this.bubbleChromaticPostProcess = undefined;
        }
        break;
      case "fisheye":
        if (this.fisheyePostProcess) {
          this.fisheyePostProcess.dispose();
          this.fisheyePostProcess = undefined;
        }
        break;
      case "nightVision":
        if (this.nightVisionPostProcess) {
          this.nightVisionPostProcess.dispose();
          this.nightVisionPostProcess = undefined;
        }
        break;
      case "vintageTV":
        if (this.vintageTVPostProcess) {
          this.vintageTVPostProcess.dispose();
          this.vintageTVPostProcess = undefined;
        }
        this.stopVintageTVGlitch(); // Clear glitch interval if it exists
        break;
      case "motionblur":
        if (this.motionblurPostProcess) {
          this.motionblurPostProcess.dispose();
          this.motionblurPostProcess = undefined;
        }
        break;
      case "pixelation":
        if (this.pixelationPostProcess) {
          this.pixelationPostProcess.dispose();
          this.pixelationPostProcess = undefined;
        }
        break;
      case "old":
        if (this.oldPostProcess) {
          this.oldPostProcess.dispose();
          this.oldPostProcess = undefined;
        }
        break;
      case "chromaticAberration":
        if (this.chromaticAberrationPostProcess) {
          this.chromaticAberrationPostProcess.dispose();
          this.chromaticAberrationPostProcess = undefined;
        }
        break;
      case "colorSplash":
        if (this.colorSplashPostProcess) {
          this.colorSplashPostProcess.dispose();
          this.colorSplashPostProcess = undefined;
        }
        break;
      case "tonemap":
        if (this.tonemapPostProcess) {
          this.tonemapPostProcess.dispose();
          this.tonemapPostProcess = undefined;
        }
        break;
      case "rays":
        if (this.raysPostProcess) {
          this.raysPostProcess.dispose();
          this.raysPostProcess = undefined;
        }
        break;
      case "sharpen":
        if (this.sharpenPostProcess) {
          this.sharpenPostProcess.dispose();
          this.sharpenPostProcess = undefined;
        }
        break;
      case "tiltShift":
        if (this.tiltShiftPostProcess) {
          this.tiltShiftPostProcess.dispose();
          this.tiltShiftPostProcess = undefined;
        }
        break;
      case "cartoon":
        if (this.cartoonPostProcess) {
          this.cartoonPostProcess.dispose();
          this.cartoonPostProcess = undefined;
        }
        break;
      default:
        break;
    }
  };

  renderLoop = () => {
    this.time += this.engine.getDeltaTime() * 0.001;

    if (this.bubbleChromaticPostProcess) {
      this.bubbleChromaticPostProcess.onApply = (effect) => {
        effect.setFloat("time", this.time);
      };
    }

    if (this.nightVisionPostProcess) {
      this.nightVisionPostProcess.onApply = (effect) => {
        effect.setFloat("time", this.time * 0.004);
      };
    }

    if (this.vintageTVPostProcess) {
      this.vintageTVPostProcess.onApply = (effect) => {
        effect.setFloat("time", this.time);
        effect.setFloat("aspectRatio", this.engine.getAspectRatio(this.camera));
        effect.setBool("glitchActive", this.glitchActive);
      };
    }

    if (this.pixelationPostProcess) {
      this.pixelationPostProcess.onApply = (effect) => {
        effect.setFloat("pixelSize", 10.0); // Adjust this for stronger/weaker pixelation

        // Update the resolution uniform
        effect.setVector2(
          "resolution",
          new Vector2(
            this.engine.getRenderWidth(),
            this.engine.getRenderHeight()
          )
        );
      };
    }

    if (this.tiltShiftPostProcess) {
      this.tiltShiftPostProcess.onApply = (effect) => {
        // Set the parameters for the shader
        effect.setFloat("focusHeight", 0.5); // Change as needed
        effect.setFloat("focusWidth", 0.225); // Change as needed
        effect.setFloat("blurStrength", 0.25); // Change as needed
        effect.setVector2(
          "resolution",
          new Vector2(
            this.engine.getRenderWidth(),
            this.engine.getRenderHeight()
          )
        );
      };
    }

    if (this.prismaColorsPostProcess) {
      this.prismaColorsPostProcess.onApply = (effect) => {
        effect.setFloat("time", this.time);
      };
    }

    if (this.oldPostProcess) {
      this.oldPostProcess.onApply = (effect) => {
        effect.setFloat("time", this.time);
        effect.setVector2(
          "resolution",
          new Vector2(
            this.engine.getRenderWidth(),
            this.engine.getRenderHeight()
          )
        );
      };
    }
  };

  changePostProcessEffect = (
    postProcessEffect: PostProcessEffects,
    active: boolean
  ) => {
    if (this.activeShaders[postProcessEffect] !== active) {
      this.activeShaders[postProcessEffect] = active;

      if (active) {
        this.createPostProcessEffect(postProcessEffect);
      } else if (!active) {
        this.removePostProcessEffect(postProcessEffect);
      }
    }
  };
}

export default BabylonShaderController;
